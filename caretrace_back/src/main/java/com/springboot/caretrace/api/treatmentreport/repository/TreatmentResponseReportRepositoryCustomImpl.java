package com.springboot.caretrace.api.treatmentreport.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.springboot.caretrace.api.treatmentreport.entity.QTreatmentResponseReport;
import com.springboot.caretrace.api.treatmentreport.entity.ResponseResult;
import com.springboot.caretrace.api.treatmentreport.entity.TreatmentResponseReport;
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

    @Override
    public List<TreatmentResponseReport> getList(PageObject pageObject, Long caseId, LocalDate evaluationDate, ResponseResult responseResult) {
        return queryFactory
                .selectFrom(report)
                .where(search(caseId, evaluationDate, responseResult))
                .orderBy(report.evaluationDate.desc(), report.createdAt.desc())
                .limit(pageObject.getPerPageNum())
                .offset(pageObject.getLimit())
                .fetch();
    }

    @Override
    public Long getCount(PageObject pageObject, Long caseId, LocalDate evaluationDate, ResponseResult responseResult) {
        Long count = queryFactory
                .select(report.count())
                .from(report)
                .where(search(caseId, evaluationDate, responseResult))
                .fetchOne();
        return count == null ? 0L : count;
    }

    @Override
    public TreatmentResponseReport getReport(Long reportId) {
        return queryFactory
                .selectFrom(report)
                .where(
                        report.reportId.eq(reportId),
                        report.isDeleted.eq("n")
                )
                .fetchOne();
    }

    @Override
    public TreatmentResponseReport saveReport(TreatmentResponseReport entity) {
        return qRepository.save(entity);
    }

    // 요구사항 2-1: 삭제되지 않은 보고서 중 평가 기준일 및 치료 반응 결과 기준으로 검색[cite: 4]
    private BooleanBuilder search(Long caseId, LocalDate evaluationDate, ResponseResult responseResult) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(report.isDeleted.eq("n"));

        if (caseId != null) {
            builder.and(report.caseId.eq(caseId));
        }
        if (evaluationDate != null) {
            builder.and(report.evaluationDate.eq(evaluationDate));
        }
        if (responseResult != null) {
            builder.and(report.responseResult.eq(responseResult));
        }
        return builder;
    }
}