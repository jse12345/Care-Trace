package com.springboot.caretrace.api.lesion.vo;

import com.springboot.caretrace.api.lesion.entity.RoiType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LesionMeasurementVO {

    private Long measurementId;
    private Long lesionId;
    private Long examinationId;
    private Long measuredBy;
    private String studyInstanceUid;
    private String seriesInstanceUid;
    private String sopInstanceUid;
    private Integer instanceNumber;
    private Integer frameNumber;
    private RoiType roiType;
    private List<RoiPointVO> roiPoints;
    private BigDecimal pixelSpacingX;
    private BigDecimal pixelSpacingY;
    private BigDecimal sliceThickness;
    private BigDecimal longAxisMm;
    private BigDecimal shortAxisMm;
    private BigDecimal areaMm2;
    private Integer windowCenter;
    private Integer windowWidth;
    private String memo;
    private LocalDateTime measuredAt;
    private LocalDateTime regDate;
    private LocalDateTime updateDate;
}
