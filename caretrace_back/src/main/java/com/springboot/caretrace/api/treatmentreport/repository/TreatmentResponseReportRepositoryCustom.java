package com.springboot.caretrace.api.treatmentreport.repository;

import com.springboot.caretrace.api.treatmentreport.entity.ResponseResult;
import com.springboot.caretrace.api.treatmentreport.entity.TreatmentResponseReport;
import com.springboot.caretrace.page.PageObject;
import java.time.LocalDate;
import java.util.List;

public interface TreatmentResponseReportRepositoryCustom {
    List<TreatmentResponseReport> getList(PageObject pageObject, Long caseId, LocalDate evaluationDate, ResponseResult responseResult);
    Long getCount(PageObject pageObject, Long caseId, LocalDate evaluationDate, ResponseResult responseResult);
    TreatmentResponseReport getReport(Long reportId);
    TreatmentResponseReport saveReport(TreatmentResponseReport report);
}