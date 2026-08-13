package com.springboot.caretrace.api.lesion.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LesionMeasurementTrendVO {

    private Long measurementId;
    private Long examinationId;
    private LocalDateTime measuredAt;
    private BigDecimal longAxisMm;
    private BigDecimal shortAxisMm;
    private BigDecimal areaMm2;
    private BigDecimal trendValueMm;
    private BigDecimal changeRatePercent;
    private Boolean baseline;
}
