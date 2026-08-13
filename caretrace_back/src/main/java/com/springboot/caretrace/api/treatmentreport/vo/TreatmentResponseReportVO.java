package com.springboot.caretrace.api.treatmentreport.vo;

import com.springboot.caretrace.api.treatmentreport.entity.ReportStatus;
import com.springboot.caretrace.api.treatmentreport.entity.ResponseResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentResponseReportVO {
    private Long reportId;
    private Long caseId;
    private Long staffId;
    private String evaluationCriteria;
    private LocalDate evaluationDate;
    private ResponseResult responseResult;
    private BigDecimal sizeChangeRate;
    private String reportContent;
    private ReportStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}