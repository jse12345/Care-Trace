package com.springboot.caretrace.api.consultation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultation_opinion")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ConsultationOpinion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "opinion_id", columnDefinition = "INT UNSIGNED")
    private Long opinionId;

    @Column(name = "case_id", nullable = false, columnDefinition = "BIGINT UNSIGNED")
    private Long caseId;

    @Column(name = "staff_id", nullable = false)
    private Long staffId;

    @Column(name = "parent_opinion_id", columnDefinition = "INT UNSIGNED")
    private Long parentOpinionId;

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
    private String isDeleted = "n";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 요구사항 1-4: 의견 철회 시 상태 및 삭제 여부 변경[cite: 2]
    public void softDelete() {
        this.isDeleted = "y";
        this.status = OpinionStatus.CLOSED;
    }

    // 요구사항 1-3: 응답 등록 시 원 의견 상태 변경[cite: 2]
    public void changeStatus(OpinionStatus newStatus) {
        this.status = newStatus;
    }
}