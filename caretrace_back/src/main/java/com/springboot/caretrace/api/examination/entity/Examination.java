package com.springboot.caretrace.api.examination.entity;

import com.springboot.caretrace.api.patient.entity.Patient;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "examination")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Examination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "examination_id")
    private Long id;

    @Column(name = "orthanc_study_id", unique = true, nullable = false, length = 100)
    private String orthancStudyId;

    @Column(name = "study_instance_uid", unique = true, length = 128)
    private String studyInstanceUid;

    @Column(name = "dicom_patient_id", length = 100)
    private String dicomPatientId;

    @Column(name = "dicom_patient_name", length = 200)
    private String dicomPatientName;

    @Column(name = "dicom_patient_sex", length = 10)
    private String dicomPatientSex;

    @Column(name = "dicom_patient_birth_date", length = 20)
    private String dicomPatientBirthDate;

    // Care-Trace 내부 Patient 매칭 결과 (dicomPatientId <-> Patient.patientCode). 매칭 안 되면 null.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(name = "accession_number", length = 64)
    private String accessionNumber;

    @Column(name = "study_date", length = 20)
    private String studyDate;

    @Column(name = "study_time", length = 20)
    private String studyTime;

    @Column(name = "study_description", length = 500)
    private String studyDescription;

    @Column(name = "referring_physician_name", length = 200)
    private String referringPhysicianName;

    @Column(name = "study_id_tag", length = 64)
    private String studyID;

    private Boolean stable;

    @Builder.Default
    private Integer seriesCount = 0;

    @Builder.Default
    private Integer instanceCount = 0;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @OneToMany(
            mappedBy = "examination",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<ExaminationSeries> seriesList = new ArrayList<>();
}
