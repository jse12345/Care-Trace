package com.springboot.caretrace.patientcase.service;

import com.springboot.caretrace.patientcase.vo.PatientCaseVO;

import java.util.List;

public interface PatientCaseService {

    List<PatientCaseVO> getPatientCaseList(
            String keyword,
            String status
    );

    PatientCaseVO getPatientCase(Long caseId);

    PatientCaseVO writePatientCase(PatientCaseVO vo);

    PatientCaseVO updatePatientCase(
            Long caseId,
            PatientCaseVO vo
    );

    void deletePatientCase(Long caseId);
}