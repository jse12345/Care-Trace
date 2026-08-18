package com.springboot.caretrace.api.patientcase.repository;

import com.springboot.caretrace.api.patientcase.entity.PatientCase;
import com.springboot.caretrace.api.patientcase.vo.PatientCaseVO;

import java.util.List;

public interface PatientCaseRepositoryCustom {

    List<PatientCaseVO> searchPatientCases(
            String keyword,
            String status
    );

    PatientCaseVO findPatientCaseDetail(Long caseId);
    List<PatientCase> findByPatientId(Long patientId);
}