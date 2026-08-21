package com.springboot.caretrace.api.patientcase.entity;

import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import com.springboot.caretrace.api.patient.entity.Patient;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_case")
// DB에 이미 chk_patient_case_is_deleted CHECK (is_deleted IN ('Y','N')) 제약이 있어 별도 @Check 불필요
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "case_id", columnDefinition = "BIGINT UNSIGNED")
    private Long caseId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false, columnDefinition = "BIGINT UNSIGNED")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_no", nullable = false)
    private MedicalStaff staff;

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

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false, length = 1)
    private String isDeleted;
}