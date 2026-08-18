package com.springboot.caretrace.api.patientcase.repository;

import com.springboot.caretrace.api.patientcase.entity.PatientCase;

import java.util.List;

public interface PatientCaseRepositoryCustom {

    List<PatientCase> searchPatientCases(
            String keyword,
            String status
    );
}