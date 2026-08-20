package com.springboot.caretrace.api.treatmentreport.service;

import com.springboot.caretrace.api.treatmentreport.entity.ReportStatus;
import com.springboot.caretrace.api.treatmentreport.entity.ResponseResult;
import com.springboot.caretrace.api.treatmentreport.entity.TreatmentResponseReport;
import com.springboot.caretrace.api.treatmentreport.repository.TreatmentResponseReportRepositoryCustom;
import com.springboot.caretrace.api.treatmentreport.vo.TreatmentResponseReportVO;
import com.springboot.caretrace.api.patientcase.repository.QPatientCaseRepository;
import com.springboot.caretrace.api.patient.repository.QPatientRepository;
import com.springboot.caretrace.api.medicalstaff.repository.QMedicalStaffRepository;
import com.springboot.caretrace.page.PageObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional(readOnly = true)
public class TreatmentResponseReportServiceImpl implements TreatmentResponseReportService {

    private final TreatmentResponseReportRepositoryCustom repositoryCustom;
    private final QPatientCaseRepository patientCaseRepository;
    private final QPatientRepository patientRepository;
    private final QMedicalStaffRepository medicalStaffRepository;

    @Override
    public List<TreatmentResponseReportVO> list(PageObject pageObject, Long caseId, LocalDate evaluationDate, ResponseResult responseResult) {
        pageObject.setTotalRow(repositoryCustom.getCount(pageObject, caseId, evaluationDate, responseResult));
        return repositoryCustom.getList(pageObject, caseId, evaluationDate, responseResult)
                .stream()
                .map(this::entityToVO)
                .toList();
    }

    @Override
    public TreatmentResponseReportVO view(Long reportId) {
        return entityToVO(findActiveReport(reportId));
    }

    @Override
    @Transactional
    public TreatmentResponseReportVO write(TreatmentResponseReportVO vo) {
        TreatmentResponseReport report = TreatmentResponseReport.builder()
                .caseId(requiredLong(vo.getCaseId()))
                .staffId(requiredLong(vo.getStaffId()))
                // patientName, diagnosisName, staffName 은 엔티티에 없으므로 제거!
                .evaluationCriteria(requiredString(vo.getEvaluationCriteria()))
                .evaluationDate(vo.getEvaluationDate() != null ? vo.getEvaluationDate() : LocalDate.now())
                .responseResult(vo.getResponseResult())
                .sizeChangeRate(vo.getSizeChangeRate())
                .reportContent(requiredString(vo.getReportContent()))
                .status(ReportStatus.DRAFT)
                .isDeleted("n")
                .build();

        return entityToVO(repositoryCustom.saveReport(report));
    }

    @Override
    @Transactional
    public Long update(TreatmentResponseReportVO vo) {
        TreatmentResponseReport report = findActiveReport(vo.getReportId());

        report.updateReport(
                vo.getResponseResult() != null ? vo.getResponseResult() : report.getResponseResult(),
                vo.getSizeChangeRate() != null ? vo.getSizeChangeRate() : report.getSizeChangeRate(),
                vo.getReportContent() != null ? vo.getReportContent() : report.getReportContent(),
                vo.getStatus() != null ? vo.getStatus() : report.getStatus()
        );

        repositoryCustom.saveReport(report);
        return 1L;
    }

    @Override
    @Transactional
    public Long delete(Long reportId) {
        TreatmentResponseReport report = findActiveReport(reportId);
        report.softDelete();
        repositoryCustom.saveReport(report);
        return 1L;
    }

    private TreatmentResponseReport findActiveReport(Long reportId) {
        if (reportId == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "보고서 번호가 필요합니다.");
        TreatmentResponseReport report = repositoryCustom.getReport(reportId);
        if (report == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "보고서를 찾을 수 없습니다.");
        return report;
    }

    private TreatmentResponseReportVO entityToVO(TreatmentResponseReport entity) {
        TreatmentResponseReportVO vo = TreatmentResponseReportVO.builder()
                .reportId(entity.getReportId())
                .caseId(entity.getCaseId())
                .staffId(entity.getStaffId())
                .evaluationCriteria(entity.getEvaluationCriteria())
                .evaluationDate(entity.getEvaluationDate())
                .responseResult(entity.getResponseResult())
                .sizeChangeRate(entity.getSizeChangeRate())
                .reportContent(entity.getReportContent())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();

        // 작성 의료진 이름 세팅
        if (entity.getStaffId() != null) {
            medicalStaffRepository.findById(entity.getStaffId())
                    .ifPresent(staff -> vo.setStaffName(staff.getStaffName()));
        }

        // 환자명 및 증례명 세팅
        if (entity.getCaseId() != null) {
            patientCaseRepository.findById(entity.getCaseId())
                    .ifPresent(pCase -> {
                        vo.setDiagnosisName(pCase.getDiagnosis()); // 증례명(진단명)

                        patientRepository.findById(pCase.getPatientId())
                                .ifPresent(patient -> vo.setPatientName(patient.getPatientName())); // 환자명
                    });
        }

        return vo;
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