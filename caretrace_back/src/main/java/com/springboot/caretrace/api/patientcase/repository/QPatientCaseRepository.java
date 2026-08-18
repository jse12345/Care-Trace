package com.springboot.caretrace.api.patientcase.repository;

import com.springboot.caretrace.api.patientcase.entity.PatientCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QPatientCaseRepository
        extends JpaRepository<PatientCase, Long>,
        PatientCaseRepositoryCustom {

    Optional<PatientCase> findByCaseIdAndIsDeleted(
            Long caseId,
            String isDeleted
    );
}