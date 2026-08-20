package com.springboot.caretrace.api.treatmentreport.service;

import com.springboot.caretrace.api.treatmentreport.entity.ResponseResult;
import com.springboot.caretrace.api.treatmentreport.vo.TreatmentResponseReportVO;
import com.springboot.caretrace.page.PageObject;

import java.time.LocalDate;
import java.util.List;

public interface TreatmentResponseReportService {
    // 기존 list 메서드 정의를 아래 코드로 교체하세요.
    List<TreatmentResponseReportVO> list(PageObject pageObject, Long caseId, LocalDate startDate, LocalDate endDate, ResponseResult responseResult);    TreatmentResponseReportVO view(Long reportId);
    TreatmentResponseReportVO write(TreatmentResponseReportVO vo);
    Long update(TreatmentResponseReportVO vo);
    Long delete(Long reportId);
}