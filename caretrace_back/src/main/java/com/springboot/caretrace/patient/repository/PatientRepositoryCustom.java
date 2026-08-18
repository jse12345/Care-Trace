package com.springboot.caretrace.patient.repository;

import com.springboot.caretrace.patient.entity.Patient;

import java.util.List;

public interface PatientRepositoryCustom {

    List<Patient> searchPatients(String keyword);

}