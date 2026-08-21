package com.springboot.caretrace.api.lesion.entity;

import com.springboot.caretrace.api.examination.entity.Examination;
import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "lesion_measurement")
@Check(constraints = "is_deleted IN ('Y','N')")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class LesionMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "measurement_id")
    private Long measurementId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesion_id", nullable = false)
    private Lesion lesion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "examination_id", nullable = false)
    private Examination examination;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "measured_by", nullable = false)
    private MedicalStaff measuredByStaff;

    @Column(name = "study_instance_uid", length = 64)
    private String studyInstanceUid;

    @Column(name = "series_instance_uid", length = 64)
    private String seriesInstanceUid;

    @Column(name = "sop_instance_uid", length = 64)
    private String sopInstanceUid;

    @Column(name = "instance_number")
    private Integer instanceNumber;

    @Builder.Default
    @Column(name = "frame_number")
    private Integer frameNumber = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "roi_type", nullable = false, length = 20)
    private RoiType roiType;

    @Column(name = "roi_points", nullable = false, columnDefinition = "TEXT")
    private String roiPoints;

    @Column(name = "pixel_spacing_x", precision = 10, scale = 6)
    private BigDecimal pixelSpacingX;

    @Column(name = "pixel_spacing_y", precision = 10, scale = 6)
    private BigDecimal pixelSpacingY;

    @Column(name = "slice_thickness", precision = 10, scale = 6)
    private BigDecimal sliceThickness;

    @Column(name = "long_axis_mm", precision = 10, scale = 2)
    private BigDecimal longAxisMm;

    @Column(name = "short_axis_mm", precision = 10, scale = 2)
    private BigDecimal shortAxisMm;

    @Column(name = "area_mm2", precision = 10, scale = 2)
    private BigDecimal areaMm2;

    @Column(name = "long_axis_px", precision = 10, scale = 2)
    private BigDecimal longAxisPx;

    @Column(name = "short_axis_px", precision = 10, scale = 2)
    private BigDecimal shortAxisPx;

    @Column(name = "area_px2", precision = 10, scale = 2)
    private BigDecimal areaPx2;

    @Column(name = "window_center")
    private Integer windowCenter;

    @Column(name = "window_width")
    private Integer windowWidth;

    @Column(name = "memo", columnDefinition = "TEXT")
    private String memo;

    @Column(name = "measured_at", nullable = false)
    private LocalDateTime measuredAt;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false, length = 1)
    private String isDeleted = "N";

    @CreationTimestamp
    @Column(name = "reg_date", nullable = false, updatable = false)
    private LocalDateTime regDate;

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;

    public void update(
            String studyInstanceUid,
            String seriesInstanceUid,
            String sopInstanceUid,
            Integer instanceNumber,
            Integer frameNumber,
            RoiType roiType,
            String roiPoints,
            BigDecimal pixelSpacingX,
            BigDecimal pixelSpacingY,
            BigDecimal sliceThickness,
            BigDecimal longAxisMm,
            BigDecimal shortAxisMm,
            BigDecimal areaMm2,
            BigDecimal longAxisPx,
            BigDecimal shortAxisPx,
            BigDecimal areaPx2,
            Integer windowCenter,
            Integer windowWidth,
            String memo,
            LocalDateTime measuredAt
    ) {
        this.studyInstanceUid = studyInstanceUid;
        this.seriesInstanceUid = seriesInstanceUid;
        this.sopInstanceUid = sopInstanceUid;
        this.instanceNumber = instanceNumber;
        this.frameNumber = frameNumber;
        this.roiType = roiType;
        this.roiPoints = roiPoints;
        this.pixelSpacingX = pixelSpacingX;
        this.pixelSpacingY = pixelSpacingY;
        this.sliceThickness = sliceThickness;
        this.longAxisMm = longAxisMm;
        this.shortAxisMm = shortAxisMm;
        this.areaMm2 = areaMm2;
        this.longAxisPx = longAxisPx;
        this.shortAxisPx = shortAxisPx;
        this.areaPx2 = areaPx2;
        this.windowCenter = windowCenter;
        this.windowWidth = windowWidth;
        this.memo = memo;
        this.measuredAt = measuredAt;
    }

    public void softDelete() {
        this.isDeleted = "Y";
    }
}
