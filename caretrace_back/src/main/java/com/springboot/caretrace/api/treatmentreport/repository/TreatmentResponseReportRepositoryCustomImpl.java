package com.springboot.caretrace.api.treatmentreport.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.springboot.caretrace.api.treatmentreport.entity.QTreatmentResponseReport;
import com.springboot.caretrace.api.treatmentreport.entity.ResponseResult;
import com.springboot.caretrace.api.treatmentreport.entity.TreatmentResponseReport;
import com.springboot.caretrace.api.patientcase.entity.QPatientCase;
import com.springboot.caretrace.api.patient.entity.QPatient;
import com.springboot.caretrace.api.medicalstaff.entity.QMedicalStaff;
import com.springboot.caretrace.page.PageObject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class TreatmentResponseReportRepositoryCustomImpl implements TreatmentResponseReportRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QTreatmentResponseReportRepository qRepository;

    private final QTreatmentResponseReport report = QTreatmentResponseReport.treatmentResponseReport;
    private final QPatientCase patientCase = QPatientCase.patientCase;
    private final QPatient patient = QPatient.patient;
    private final QMedicalStaff medicalStaff = QMedicalStaff.medicalStaff;

    @Override
    public List<TreatmentResponseReport> getList(PageObject pageObject, Long caseId, LocalDate startDate, LocalDate endDate, ResponseResult responseResult) {
        return queryFactory
                .selectFrom(report)
                .leftJoin(patientCase).on(report.caseId.eq(patientCase.caseId))
                .leftJoin(patient).on(patientCase.patientId.eq(patient.patientId))
                .leftJoin(medicalStaff).on(report.staffId.eq(medicalStaff.staffNo))
                .where(search(pageObject, caseId, startDate, endDate, responseResult))
                .orderBy(report.evaluationDate.desc(), report.createdAt.desc())
                .limit(pageObject.getPerPageNum())
                .offset(pageObject.getLimit())
                .fetch();
    }

    @Override
    public Long getCount(PageObject pageObject, Long caseId, LocalDate startDate, LocalDate endDate, ResponseResult responseResult) {
        Long count = queryFactory
                .select(report.count())
                .from(report)
                .leftJoin(patientCase).on(report.caseId.eq(patientCase.caseId))
                .leftJoin(patient).on(patientCase.patientId.eq(patient.patientId))
                .leftJoin(medicalStaff).on(report.staffId.eq(medicalStaff.staffNo))
                .where(search(pageObject, caseId, startDate, endDate, responseResult))
                .fetchOne();
        return count == null ? 0L : count;
    }

    @Override
    public TreatmentResponseReport getReport(Long reportId) {
        return queryFactory.selectFrom(report)
                .where(report.reportId.eq(reportId), report.isDeleted.eq("n"))
                .fetchOne();
    }

    @Override
    public TreatmentResponseReport saveReport(TreatmentResponseReport entity) {
        return qRepository.save(entity);
    }

    private BooleanBuilder search(PageObject pageObject, Long caseId, LocalDate startDate, LocalDate endDate, ResponseResult responseResult) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(report.isDeleted.eq("n"));

        if (caseId != null) builder.and(report.caseId.eq(caseId));
        if (startDate != null) builder.and(report.evaluationDate.goe(startDate));
        if (endDate != null) builder.and(report.evaluationDate.loe(endDate));
        if (responseResult != null) builder.and(report.responseResult.eq(responseResult));

        // PageObject를 활용한 이름 검색 로직
        String word = pageObject.getWord();
        if (word != null && !word.isBlank()) {
            String key = pageObject.getKey();
            String normalizedWord = word.trim();
            BooleanBuilder keywordBuilder = new BooleanBuilder();

            // key가 비어있거나 'p'를 포함하면 환자명 검색
            if (key == null || key.isBlank() || key.contains("p")) {
                keywordBuilder.or(patient.patientName.containsIgnoreCase(normalizedWord));
            }
            // key가 비어있거나 's'를 포함하면 의료진명 검색
            if (key == null || key.isBlank() || key.contains("s")) {
                keywordBuilder.or(medicalStaff.staffName.containsIgnoreCase(normalizedWord));
            }
            builder.and(keywordBuilder);
        }
        return builder;
    }
}