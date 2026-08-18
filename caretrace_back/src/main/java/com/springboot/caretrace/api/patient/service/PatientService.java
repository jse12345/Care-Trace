package com.springboot.caretrace.api.patient.service;

import com.springboot.caretrace.api.patient.vo.PatientVO;

import java.util.List;

public interface PatientService {

    List<PatientVO> getPatientList(String keyword);

    PatientVO getPatient(Long patientId);

    PatientVO writePatient(PatientVO vo);

    PatientVO updatePatient(Long patientId, PatientVO vo);

    void deletePatient(Long patientId);
}