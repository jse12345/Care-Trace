package com.springboot.caretrace.api.patient.repository;

import com.springboot.caretrace.api.patient.entity.Patient;

import java.util.List;

public interface PatientRepositoryCustom {

    List<Patient> searchPatients(String keyword);

}