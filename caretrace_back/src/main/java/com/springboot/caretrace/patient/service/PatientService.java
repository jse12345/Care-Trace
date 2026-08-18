package com.springboot.caretrace.patient.service;

import com.springboot.caretrace.patient.vo.PatientVO;

import java.util.List;

public interface PatientService {

    List<PatientVO> getPatientList(String keyword);

    PatientVO getPatient(Long patientId);

    PatientVO writePatient(PatientVO vo);

    PatientVO updatePatient(Long patientId, PatientVO vo);

    void deletePatient(Long patientId);
}