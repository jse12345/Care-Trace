package com.springboot.caretrace.patientcase.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_case")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "case_id")
    private Long caseId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "staff_no", nullable = false)
    private Long staffNo;

    @Column(name = "diagnosis", nullable = false, length = 200)
    private String diagnosis;

    @Column(name = "body_part", length = 100)
    private String bodyPart;

    @Column(name = "case_status", nullable = false, length = 30)
    private String caseStatus;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "memo", columnDefinition = "TEXT")
    private String memo;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false, length = 1)
    private String isDeleted;

    @PrePersist
    public void prePersist() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (isDeleted == null) {
            isDeleted = "N";
        }

        if (caseStatus == null) {
            caseStatus = "FOLLOW_UP";
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}