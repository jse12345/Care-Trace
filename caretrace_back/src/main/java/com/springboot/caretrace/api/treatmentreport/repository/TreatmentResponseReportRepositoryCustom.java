package com.springboot.caretrace.api.treatmentreport.repository;

import com.springboot.caretrace.api.treatmentreport.entity.ResponseResult;
import com.springboot.caretrace.api.treatmentreport.entity.TreatmentResponseReport;
import com.springboot.caretrace.page.PageObject;
import java.time.LocalDate;
import java.util.List;

public interface TreatmentResponseReportRepositoryCustom {
    // 기존 getList와 getCount 메서드를 아래 코드로 교체하세요.
    List<TreatmentResponseReport> getList(PageObject pageObject, Long caseId, LocalDate startDate, LocalDate endDate, ResponseResult responseResult);
    Long getCount(PageObject pageObject, Long caseId, LocalDate startDate, LocalDate endDate, ResponseResult responseResult);
    TreatmentResponseReport getReport(Long reportId);
    TreatmentResponseReport saveReport(TreatmentResponseReport report);
}