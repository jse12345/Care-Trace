package com.springboot.caretrace.api.examination.service;

import com.springboot.caretrace.api.examination.entity.Examination;
import com.springboot.caretrace.api.examination.entity.ExaminationSeries;
import com.springboot.caretrace.api.examination.repository.QExaminationRepository;
import com.springboot.caretrace.api.examination.repository.QExaminationSeriesRepository;
import com.springboot.caretrace.api.examination.vo.ExaminationSeriesVO;
import com.springboot.caretrace.api.examination.vo.ExaminationSyncResultVO;
import com.springboot.caretrace.api.examination.vo.ExaminationVO;
import com.springboot.caretrace.api.lesion.entity.Lesion;
import com.springboot.caretrace.api.lesion.repository.QLesionRepository;
import com.springboot.caretrace.api.patient.entity.Patient;
import com.springboot.caretrace.api.patient.repository.QPatientRepository;
import com.springboot.caretrace.api.patientcase.entity.PatientCase;
import com.springboot.caretrace.api.patientcase.repository.QPatientCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

/**
 * Orthanc PACS 서버의 Study/Series를 MariaDB(examination/examination_series)로 동기화하고,
 * 동기화된 데이터를 조회하는 서비스. webjjang 프로젝트의 PacsServiceImpl 구조를 참고해 포팅했다.
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class ExaminationServiceImpl implements ExaminationService {

    private final WebClient orthancWebClient;

    private final QExaminationRepository examinationRepository;
    private final QExaminationSeriesRepository examinationSeriesRepository;
    private final QPatientRepository patientRepository;
    private final QLesionRepository lesionRepository;
    private final QPatientCaseRepository patientCaseRepository;

    // 동기화 중복 실행 방지 가드
    private final AtomicBoolean syncInProgress = new AtomicBoolean(false);

    @Override
    @Transactional(readOnly = true)
    public List<ExaminationVO> list(Long patientId, Long caseId, Long lesionId) {

        Long resolvedPatientId = patientId;
        Long resolvedCaseId = caseId;

        if (resolvedPatientId == null && resolvedCaseId == null && lesionId != null) {
            resolvedCaseId = lesionRepository.findById(lesionId)
                    .map(Lesion::getCaseId)
                    .orElse(null);
        }

        if (resolvedPatientId == null && resolvedCaseId != null) {
            resolvedPatientId = patientCaseRepository.findById(resolvedCaseId)
                    .map(PatientCase::getPatientId)
                    .orElse(null);
        }

        List<Examination> examinations = resolvedPatientId != null
                ? examinationRepository.findAllByPatientIdOrderByIdDesc(resolvedPatientId)
                : examinationRepository.findAllByOrderByIdDesc();

        return examinations.stream()
                .map(examination -> toVO(examination, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExaminationVO view(Long id) {

        Examination examination = examinationRepository.findDetailById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "검사 정보를 찾을 수 없습니다. id=" + id
                ));

        return toVO(examination, true);
    }

    /*
     * Orthanc의 /studies 전체를 가져와 DB에 upsert한다.
     * 전체 목록을 매번 다시 가져오되(full pull), Study/Series 단위로는 UID 기준으로 upsert한다.
     * 이후 Orthanc에 더 이상 존재하지 않는 Study/Series는 로컬 DB에서도 삭제해 정합성을 맞춘다.
     * 긴 루프 동안 Orthanc HTTP 호출을 반복하므로 메서드 전체를 하나의 트랜잭션으로 묶지 않고
     * 각 repository.save() 호출이 개별 트랜잭션으로 처리되도록 둔다(webjjang과 동일한 방식).
     */
    @Override
    public ExaminationSyncResultVO sync() {

        if (!syncInProgress.compareAndSet(false, true)) {
            log.warn("[ExaminationServiceImpl.sync] 이미 동기화가 진행 중이라 요청을 건너뜁니다.");
            return ExaminationSyncResultVO.builder()
                    .alreadyRunning(true)
                    .build();
        }

        try {
            List<String> orthancStudyIds = orthancWebClient.get()
                    .uri("/studies")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<String>>() {})
                    .block();

            if (orthancStudyIds == null) {
                orthancStudyIds = new ArrayList<>();
            }

            int savedCount = 0;
            int updatedCount = 0;
            int failedCount = 0;
            List<String> failedStudyIds = new ArrayList<>();

            for (String studyId : orthancStudyIds) {
                try {
                    Map<String, Object> studyDetailData = getStudyFromOrthanc(studyId);

                    if (studyDetailData == null) {
                        failedCount++;
                        failedStudyIds.add(studyId);
                        continue;
                    }

                    Map<String, String> studyTags = getStringMap(studyDetailData, "MainDicomTags");
                    String studyInstanceUid = getTag(studyTags, "StudyInstanceUID");

                    Examination existing = findExistingExamination(studyId, studyInstanceUid);

                    if (existing != null) {
                        existing.setStable(getBoolean(studyDetailData, "IsStable"));
                        saveSeriesList(studyDetailData, existing);
                        updatedCount++;
                        continue;
                    }

                    Examination examination = createExaminationEntity(studyDetailData, studyTags);
                    Examination saved = examinationRepository.save(examination);
                    saveSeriesList(studyDetailData, saved);
                    savedCount++;

                } catch (Exception e) {
                    failedCount++;
                    failedStudyIds.add(studyId);
                    log.error("[ExaminationServiceImpl.sync] Study 동기화 실패 : {}", studyId, e);
                }
            }

            Set<String> orthancStudyIdSet = new HashSet<>(orthancStudyIds);
            List<Examination> staleExaminations = examinationRepository.findAll().stream()
                    .filter(examination -> !orthancStudyIdSet.contains(examination.getOrthancStudyId()))
                    .collect(Collectors.toList());
            int deletedCount = staleExaminations.size();
            examinationRepository.deleteAll(staleExaminations);

            log.info(
                    "[ExaminationServiceImpl.sync] 완료 - 전체 {} / 신규 {} / 갱신 {} / 삭제 {} / 실패 {}",
                    orthancStudyIds.size(), savedCount, updatedCount, deletedCount, failedCount
            );

            return ExaminationSyncResultVO.builder()
                    .totalCount(orthancStudyIds.size())
                    .savedCount(savedCount)
                    .updatedCount(updatedCount)
                    .deletedCount(deletedCount)
                    .failedCount(failedCount)
                    .failedStudyIds(failedStudyIds)
                    .build();

        } finally {
            syncInProgress.set(false);
        }
    }

    // ---------------------------------------------------------------------
    // 내부 헬퍼
    // ---------------------------------------------------------------------

    private Examination findExistingExamination(String orthancStudyId, String studyInstanceUid) {

        Examination examination = examinationRepository.findByOrthancStudyId(orthancStudyId).orElse(null);
        if (examination != null) {
            return examination;
        }

        if (studyInstanceUid == null || studyInstanceUid.isBlank()) {
            return null;
        }

        return examinationRepository.findByStudyInstanceUid(studyInstanceUid).orElse(null);
    }

    private ExaminationSeries findExistingSeries(String orthancSeriesId, String seriesInstanceUid) {

        ExaminationSeries series = examinationSeriesRepository.findByOrthancSeriesId(orthancSeriesId).orElse(null);
        if (series != null) {
            return series;
        }

        if (seriesInstanceUid == null || seriesInstanceUid.isBlank()) {
            return null;
        }

        return examinationSeriesRepository.findBySeriesInstanceUid(seriesInstanceUid).orElse(null);
    }

    private Examination createExaminationEntity(Map<String, Object> studyData, Map<String, String> studyTags) {

        String orthancStudyId = getString(studyData, "ID");
        Map<String, String> patientTags = getStringMap(studyData, "PatientMainDicomTags");
        String dicomPatientId = getTag(patientTags, "PatientID");

        Long matchedPatientId = null;
        if (dicomPatientId != null && !dicomPatientId.isBlank()) {
            matchedPatientId = patientRepository.findByPatientCode(dicomPatientId)
                    .map(Patient::getPatientId)
                    .orElse(null);
        }

        return Examination.builder()
                .orthancStudyId(orthancStudyId)
                .studyInstanceUid(getTag(studyTags, "StudyInstanceUID"))
                .dicomPatientId(dicomPatientId)
                .dicomPatientName(getTag(patientTags, "PatientName"))
                .dicomPatientSex(getTag(patientTags, "PatientSex"))
                .dicomPatientBirthDate(getTag(patientTags, "PatientBirthDate"))
                .patientId(matchedPatientId)
                .accessionNumber(getTag(studyTags, "AccessionNumber"))
                .studyDate(getTag(studyTags, "StudyDate"))
                .studyTime(getTag(studyTags, "StudyTime"))
                .studyDescription(getTag(studyTags, "StudyDescription"))
                .referringPhysicianName(getTag(studyTags, "ReferringPhysicianName"))
                .studyID(getTag(studyTags, "StudyID"))
                .stable(getBoolean(studyData, "IsStable"))
                .seriesCount(0)
                .instanceCount(0)
                .lastSyncedAt(LocalDateTime.now())
                .build();
    }

    private void saveSeriesList(Map<String, Object> studyData, Examination examination) {

        List<String> orthancSeriesIds = getStringList(studyData, "Series");
        Set<String> orthancSeriesIdSet = new HashSet<>(orthancSeriesIds);

        if (examination.getId() != null) {
            List<ExaminationSeries> staleSeries = examinationSeriesRepository
                    .findAllByExamination_Id(examination.getId()).stream()
                    .filter(series -> !orthancSeriesIdSet.contains(series.getOrthancSeriesId()))
                    .collect(Collectors.toList());
            examinationSeriesRepository.deleteAll(staleSeries);
        }

        int totalSeriesCount = 0;
        int totalInstanceCount = 0;

        for (String orthancSeriesId : orthancSeriesIds) {

            Map<String, Object> seriesData = getSeriesFromOrthanc(orthancSeriesId);
            if (seriesData == null) {
                continue;
            }

            Map<String, String> seriesTags = getStringMap(seriesData, "MainDicomTags");
            String seriesInstanceUid = getTag(seriesTags, "SeriesInstanceUID");

            if (seriesInstanceUid == null || seriesInstanceUid.isBlank()) {
                log.warn("[ExaminationServiceImpl.saveSeriesList] SeriesInstanceUID가 없어 저장하지 않습니다 : {}", orthancSeriesId);
                continue;
            }

            List<String> instanceIds = getStringList(seriesData, "Instances");
            int instanceCount = instanceIds.size();

            totalSeriesCount++;
            totalInstanceCount += instanceCount;

            ExaminationSeries existingSeries = findExistingSeries(orthancSeriesId, seriesInstanceUid);

            if (existingSeries != null) {
                existingSeries.setInstanceCount(instanceCount);
                examinationSeriesRepository.save(existingSeries);
                continue;
            }

            ExaminationSeries series = ExaminationSeries.builder()
                    .orthancSeriesId(orthancSeriesId)
                    .seriesInstanceUid(seriesInstanceUid)
                    .modality(getTag(seriesTags, "Modality"))
                    .seriesDescription(getTag(seriesTags, "SeriesDescription"))
                    .seriesNumber(getTag(seriesTags, "SeriesNumber"))
                    .instanceCount(instanceCount)
                    .examination(examination)
                    .build();

            examinationSeriesRepository.save(series);
        }

        // Series/Instance 개수는 기존 값을 신뢰하지 않고 Orthanc 기준으로 매번 다시 계산한다.
        // (기존 series를 건너뛰면 개수가 비어서 0으로 덮어써지는 것을 방지)
        examination.setSeriesCount(totalSeriesCount);
        examination.setInstanceCount(totalInstanceCount);
        examination.setLastSyncedAt(LocalDateTime.now());

        examinationRepository.save(examination);
    }

    private Map<String, Object> getStudyFromOrthanc(String orthancStudyId) {
        return orthancWebClient.get()
                .uri("/studies/{id}", orthancStudyId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
    }

    private Map<String, Object> getSeriesFromOrthanc(String orthancSeriesId) {
        return orthancWebClient.get()
                .uri("/series/{id}", orthancSeriesId)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> getStringMap(Map<String, Object> data, String key) {
        if (data == null) return null;
        Object value = data.get(key);
        if (value instanceof Map<?, ?>) return (Map<String, String>) value;
        return null;
    }

    @SuppressWarnings("unchecked")
    private List<String> getStringList(Map<String, Object> data, String key) {
        if (data == null) return new ArrayList<>();
        Object value = data.get(key);
        if (value instanceof List<?>) return (List<String>) value;
        return new ArrayList<>();
    }

    private String getTag(Map<String, String> tags, String key) {
        if (tags == null) return null;
        return tags.get(key);
    }

    private String getString(Map<String, Object> data, String key) {
        if (data == null) return null;
        Object value = data.get(key);
        return value == null ? null : String.valueOf(value);
    }

    private Boolean getBoolean(Map<String, Object> data, String key) {
        if (data == null) return false;
        Object value = data.get(key);
        if (value instanceof Boolean booleanValue) return booleanValue;
        if (value instanceof String stringValue) return Boolean.parseBoolean(stringValue);
        return false;
    }

    private ExaminationVO toVO(Examination examination, boolean includeSeries) {

        ExaminationVO.ExaminationVOBuilder builder = ExaminationVO.builder()
                .id(examination.getId())
                .orthancStudyId(examination.getOrthancStudyId())
                .studyInstanceUid(examination.getStudyInstanceUid())
                .dicomPatientId(examination.getDicomPatientId())
                .dicomPatientName(examination.getDicomPatientName())
                .dicomPatientSex(examination.getDicomPatientSex())
                .dicomPatientBirthDate(examination.getDicomPatientBirthDate())
                .patientId(examination.getPatientId())
                .accessionNumber(examination.getAccessionNumber())
                .studyDate(examination.getStudyDate())
                .studyTime(examination.getStudyTime())
                .studyDescription(examination.getStudyDescription())
                .referringPhysicianName(examination.getReferringPhysicianName())
                .studyID(examination.getStudyID())
                .stable(Boolean.TRUE.equals(examination.getStable()))
                .seriesCount(examination.getSeriesCount())
                .instanceCount(examination.getInstanceCount())
                .lastSyncedAt(examination.getLastSyncedAt());

        if (includeSeries) {
            builder.seriesList(
                    examination.getSeriesList().stream()
                            .map(this::toSeriesVO)
                            .collect(Collectors.toList())
            );
        }

        return builder.build();
    }

    private ExaminationSeriesVO toSeriesVO(ExaminationSeries series) {
        return ExaminationSeriesVO.builder()
                .id(series.getId())
                .orthancSeriesId(series.getOrthancSeriesId())
                .seriesInstanceUid(series.getSeriesInstanceUid())
                .modality(series.getModality())
                .seriesDescription(series.getSeriesDescription())
                .seriesNumber(series.getSeriesNumber())
                .instanceCount(series.getInstanceCount())
                .build();
    }
}
