package com.springboot.caretrace.api.patient.service;

import com.springboot.caretrace.api.patient.entity.Patient;
import com.springboot.caretrace.api.patient.repository.QPatientRepository;
import com.springboot.caretrace.api.patient.vo.PatientVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientServiceImpl implements PatientService {

    private final QPatientRepository patientRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PatientVO> getPatientList(String keyword) {

        return patientRepository.searchPatients(keyword)
                .stream()
                .map(this::toVO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PatientVO getPatient(Long patientId) {

        Patient patient = patientRepository
                .findByPatientIdAndIsDeleted(patientId, "N")
                .orElseThrow(() ->
                        new IllegalArgumentException("환자를 찾을 수 없습니다.")
                );

        return toVO(patient);
    }

    @Override
    public PatientVO writePatient(PatientVO vo) {

        if (patientRepository.existsByPatientCode(vo.getPatientCode())) {
            throw new IllegalArgumentException(
                    "이미 존재하는 환자 식별번호입니다."
            );
        }

        Patient patient = Patient.builder()
                .patientCode(vo.getPatientCode())
                .patientName(vo.getPatientName())
                .birthDate(vo.getBirthDate())
                .gender(vo.getGender())
                .phone(vo.getPhone())
                .isDeleted("N")
                .build();

        Patient savedPatient = patientRepository.save(patient);

        return toVO(savedPatient);
    }

    @Override
    public PatientVO updatePatient(Long patientId, PatientVO vo) {

        Patient patient = patientRepository
                .findByPatientIdAndIsDeleted(patientId, "N")
                .orElseThrow(() ->
                        new IllegalArgumentException("환자를 찾을 수 없습니다.")
                );

        patient.setPatientCode(vo.getPatientCode());
        patient.setPatientName(vo.getPatientName());
        patient.setBirthDate(vo.getBirthDate());
        patient.setGender(vo.getGender());
        patient.setPhone(vo.getPhone());

        return toVO(patient);
    }

    @Override
    public void deletePatient(Long patientId) {

        Patient patient = patientRepository
                .findByPatientIdAndIsDeleted(patientId, "N")
                .orElseThrow(() ->
                        new IllegalArgumentException("환자를 찾을 수 없습니다.")
                );

        // 실제 삭제하지 않고 삭제 여부만 변경
        patient.setIsDeleted("Y");
    }

    private PatientVO toVO(Patient patient) {

        return PatientVO.builder()
                .patientId(patient.getPatientId())
                .patientCode(patient.getPatientCode())
                .patientName(patient.getPatientName())
                .birthDate(patient.getBirthDate())
                .gender(patient.getGender())
                .phone(patient.getPhone())
                .createdAt(patient.getCreatedAt())
                .updatedAt(patient.getUpdatedAt())
                .isDeleted(patient.getIsDeleted())
                .build();
    }
}