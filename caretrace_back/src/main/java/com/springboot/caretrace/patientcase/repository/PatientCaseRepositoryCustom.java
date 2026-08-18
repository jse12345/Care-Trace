package com.springboot.caretrace.patientcase.repository;

import com.springboot.caretrace.patientcase.entity.PatientCase;

import java.util.List;

public interface PatientCaseRepositoryCustom {

    List<PatientCase> searchPatientCases(
            String keyword,
            String status
    );
}