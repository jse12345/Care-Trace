package com.springboot.caretrace.api.patient.repository;

import com.springboot.caretrace.api.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QPatientRepository
        extends JpaRepository<Patient, Long>, PatientRepositoryCustom {

    Optional<Patient> findByPatientIdAndIsDeleted(
            Long patientId,
            String isDeleted
    );

    boolean existsByPatientCode(String patientCode);
}