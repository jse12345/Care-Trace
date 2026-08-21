package com.springboot.caretrace.api.treatmentreport.entity;

import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import com.springboot.caretrace.api.patientcase.entity.PatientCase;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "treatment_response_report")
@Check(constraints = "is_deleted IN ('Y','N')")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class TreatmentResponseReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id", columnDefinition = "INT UNSIGNED")
    private Long reportId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id", nullable = false)
    private PatientCase patientCase;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_id", nullable = false)
    private MedicalStaff staff;

    @Column(name = "evaluation_criteria", nullable = false, length = 50)
    private String evaluationCriteria;

    @Column(name = "evaluation_date", nullable = false)
    private LocalDate evaluationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "response_result", nullable = false, length = 20)
    private ResponseResult responseResult;

    @Column(name = "size_change_rate", precision = 5, scale = 2)
    private BigDecimal sizeChangeRate;

    @Column(name = "report_content", nullable = false, length = 200)
    private String reportContent;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReportStatus status = ReportStatus.DRAFT;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false, length = 1)
    private String isDeleted = "N";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 요구사항 2-3: 보고서 내용 수정 및 상태 변경 (확정 등)[cite: 4]
    public void updateReport(ResponseResult responseResult, BigDecimal sizeChangeRate, String reportContent, ReportStatus status) {
        this.responseResult = responseResult;
        this.sizeChangeRate = sizeChangeRate;
        this.reportContent = reportContent;
        this.status = status;
    }

    // 요구사항 2-4: 보고서 삭제 시 실제 삭제 없이 is_deleted와 상태 변경[cite: 4]
    public void softDelete() {
        this.isDeleted = "Y";
        this.status = ReportStatus.ARCHIVED;
    }
}