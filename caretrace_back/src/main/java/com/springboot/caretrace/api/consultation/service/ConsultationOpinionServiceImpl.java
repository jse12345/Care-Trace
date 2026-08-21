package com.springboot.caretrace.api.consultation.service;

import com.springboot.caretrace.api.consultation.entity.ConsultationOpinion;
import com.springboot.caretrace.api.consultation.entity.OpinionStatus;
import com.springboot.caretrace.api.consultation.entity.OpinionType;
import com.springboot.caretrace.api.consultation.repository.ConsultationOpinionRepositoryCustom;
import com.springboot.caretrace.api.consultation.repository.QConsultationOpinionRepository;
import com.springboot.caretrace.api.consultation.vo.ConsultationOpinionVO;
import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import com.springboot.caretrace.api.medicalstaff.repository.QMedicalStaffRepository;
import com.springboot.caretrace.api.patient.repository.QPatientRepository;
import com.springboot.caretrace.page.PageObject;

import com.springboot.caretrace.api.patientcase.repository.QPatientCaseRepository;
import com.springboot.caretrace.api.patientcase.entity.PatientCase;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional(readOnly = true)
public class ConsultationOpinionServiceImpl implements ConsultationOpinionService {

    private final ConsultationOpinionRepositoryCustom repositoryCustom;
    private final QConsultationOpinionRepository jpaRepository;

    private final QPatientRepository patientRepository;
    private final QPatientCaseRepository patientCaseRepository;
    private final QMedicalStaffRepository medicalStaffRepository;

    @Override
    public List<ConsultationOpinionVO> list(PageObject pageObject, Long caseId, OpinionType type, OpinionStatus status) {
        pageObject.setTotalRow(repositoryCustom.getCount(pageObject, caseId, type, status));
        return repositoryCustom.getList(pageObject, caseId, type, status);
    }

    @Override
    @Transactional
    public ConsultationOpinionVO writeRequest(ConsultationOpinionVO vo) {
        PatientCase patientCase = patientCaseRepository.findById(requiredLong(vo.getCaseId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "증례를 찾을 수 없습니다."));
        MedicalStaff staff = medicalStaffRepository.findById(requiredLong(vo.getStaffId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "의료진을 찾을 수 없습니다."));

        ConsultationOpinion opinion = ConsultationOpinion.builder()
                .patientCase(patientCase)
                .staff(staff)
                .opinionContent(requiredString(vo.getOpinionContent()))
                .opinionType(OpinionType.REQUEST)
                .status(OpinionStatus.OPEN)
                .isDeleted("N")
                .build();
        return entityToVO(repositoryCustom.saveOpinion(opinion));
    }

    @Override
    @Transactional
    public ConsultationOpinionVO writeResponse(ConsultationOpinionVO vo) {
        ConsultationOpinion parentOpinion = findActiveOpinion(vo.getParentOpinionId());
        parentOpinion.changeStatus(OpinionStatus.ANSWERED);
        repositoryCustom.saveOpinion(parentOpinion);

        MedicalStaff staff = medicalStaffRepository.findById(requiredLong(vo.getStaffId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "의료진을 찾을 수 없습니다."));

        ConsultationOpinion responseOpinion = ConsultationOpinion.builder()
                .patientCase(parentOpinion.getPatientCase())
                .staff(staff)
                .parentOpinion(parentOpinion)
                .opinionContent(requiredString(vo.getOpinionContent()))
                .opinionType(OpinionType.RESPONSE)
                .status(OpinionStatus.OPEN)
                .isDeleted("N")
                .build();

        return entityToVO(repositoryCustom.saveOpinion(responseOpinion));
    }

    @Override
    @Transactional
    public Long delete(Long opinionId) {
        ConsultationOpinion opinion = findActiveOpinion(opinionId);
        opinion.softDelete();
        repositoryCustom.saveOpinion(opinion);
        return 1L;
    }

    @Override
    public ConsultationOpinionVO view(Long opinionId) {
        ConsultationOpinionVO vo = repositoryCustom.getOpinion(opinionId);
        if (vo == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "해당 협진 의견을 찾을 수 없습니다.");
        }
        return vo;
    }

    // 다른 도메인(환자, 증례) 데이터를 읽어오는 메서드 구현부

    @Override
    public List<Map<String, Object>> searchPatientsForConsultation(String keyword) {
        return patientRepository.searchPatients(keyword).stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("patientId", p.getPatientId());
                    map.put("patientName", p.getPatientName());
                    map.put("birthDate", p.getBirthDate());
                    return map;
                }).collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getCasesForConsultation(Long patientId) {
        // QPatientCaseRepository에 1줄 추가하신 그 메서드 활용
        List<PatientCase> cases = patientCaseRepository.findByPatient_PatientIdAndIsDeletedOrderByCaseIdDesc(patientId, "N");

        return cases.stream()
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("caseId", c.getCaseId());
                    map.put("diagnosisName", c.getDiagnosis()); // PatientCase 엔티티의 진단명 필드
                    map.put("visitDate", c.getStartDate());     // PatientCase 엔티티의 추적 시작일 필드
                    return map;
                }).collect(Collectors.toList());
    }

    // =========================================================================
    // 내부 헬퍼 메서드들
    // =========================================================================

    private ConsultationOpinion findActiveOpinion(Long opinionId) {
        if (opinionId == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "원 의견 번호가 필요합니다.");

        ConsultationOpinion opinion = jpaRepository.findById(opinionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "의견을 찾을 수 없습니다."));

        if ("y".equalsIgnoreCase(opinion.getIsDeleted())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "이미 삭제된 의견입니다.");
        }
        return opinion;
    }

    private ConsultationOpinionVO entityToVO(ConsultationOpinion entity) {
        return ConsultationOpinionVO.builder()
                .opinionId(entity.getOpinionId())
                .caseId(entity.getPatientCase().getCaseId())
                .staffId(entity.getStaff().getStaffNo())
                .parentOpinionId(entity.getParentOpinion() != null ? entity.getParentOpinion().getOpinionId() : null)
                .opinionType(entity.getOpinionType())
                .opinionContent(entity.getOpinionContent())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private Long requiredLong(Long value) {
        if (value == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "필수 입력값이 누락되었습니다.");
        return value;
    }

    private String requiredString(String value) {
        if (value == null || value.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "필수 입력값이 누락되었습니다.");
        return value.trim();
    }
}