package com.springboot.caretrace.api.treatmentreport.service;

import com.springboot.caretrace.api.treatmentreport.entity.ResponseResult;
import com.springboot.caretrace.api.treatmentreport.vo.TreatmentResponseReportVO;
import com.springboot.caretrace.page.PageObject;

import java.time.LocalDate;
import java.util.List;

public interface TreatmentResponseReportService {
    List<TreatmentResponseReportVO> list(PageObject pageObject, Long caseId, LocalDate evaluationDate, ResponseResult responseResult);
    TreatmentResponseReportVO view(Long reportId);
    TreatmentResponseReportVO write(TreatmentResponseReportVO vo);
    Long update(TreatmentResponseReportVO vo);
    Long delete(Long reportId);
}