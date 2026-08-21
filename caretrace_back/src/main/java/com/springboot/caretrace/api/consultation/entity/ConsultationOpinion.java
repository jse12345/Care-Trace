package com.springboot.caretrace.api.consultation.entity;

import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import com.springboot.caretrace.api.patientcase.entity.PatientCase;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultation_opinion")
@Check(constraints = "is_deleted IN ('Y','N')")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ConsultationOpinion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "opinion_id", columnDefinition = "INT UNSIGNED")
    private Long opinionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id", nullable = false)
    private PatientCase patientCase;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_id", nullable = false)
    private MedicalStaff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_opinion_id", columnDefinition = "INT UNSIGNED")
    private ConsultationOpinion parentOpinion;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "opinion_type", nullable = false, length = 20)
    private OpinionType opinionType = OpinionType.REQUEST;

    @Column(name = "opinion_content", nullable = false, length = 200)
    private String opinionContent;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OpinionStatus status = OpinionStatus.OPEN;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false, length = 1)
    private String isDeleted = "N";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 요구사항 1-4: 의견 철회 시 상태 및 삭제 여부 변경[cite: 2]
    public void softDelete() {
        this.isDeleted = "Y";
        this.status = OpinionStatus.CLOSED;
    }

    // 요구사항 1-3: 응답 등록 시 원 의견 상태 변경[cite: 2]
    public void changeStatus(OpinionStatus newStatus) {
        this.status = newStatus;
    }
}