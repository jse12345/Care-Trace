package com.springboot.caretrace.api.patientcase.service;

import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import com.springboot.caretrace.api.medicalstaff.repository.QMedicalStaffRepository;
import com.springboot.caretrace.api.patient.entity.Patient;
import com.springboot.caretrace.api.patient.repository.QPatientRepository;
import com.springboot.caretrace.api.patientcase.entity.PatientCase;
import com.springboot.caretrace.api.patientcase.repository.QPatientCaseRepository;
import com.springboot.caretrace.api.patientcase.vo.PatientCaseVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientCaseServiceImpl
        implements PatientCaseService {

    private final QPatientCaseRepository patientCaseRepository;
    private final QPatientRepository patientRepository;
    private final QMedicalStaffRepository medicalStaffRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PatientCaseVO> getPatientCaseList(
            String keyword,
            String status
    ) {

        return patientCaseRepository
                .searchPatientCases(
                        keyword,
                        status
                );
    }

    @Override
    @Transactional(readOnly = true)
    public PatientCaseVO getPatientCase(Long caseId) {

        PatientCaseVO vo =
                patientCaseRepository
                        .findPatientCaseDetail(caseId);

        if (vo == null) {

            throw new IllegalArgumentException(
                    "환자 케이스를 찾을 수 없습니다."
            );
        }

        return vo;
    }

    @Override
    public PatientCaseVO writePatientCase(
            PatientCaseVO vo
    ) {

        if (vo.getPatientId() == null) {
            throw new IllegalArgumentException(
                    "환자를 선택해주세요."
            );
        }

        if (vo.getStaffNo() == null) {
            throw new IllegalArgumentException(
                    "담당의사를 선택해주세요."
            );
        }

        if (vo.getDiagnosis() == null ||
                vo.getDiagnosis().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "진단명을 입력해주세요."
            );
        }

        if (vo.getStartDate() == null) {
            throw new IllegalArgumentException(
                    "추적 시작일을 입력해주세요."
            );
        }

        Patient patient = patientRepository.findById(vo.getPatientId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "환자를 찾을 수 없습니다."
                ));

        MedicalStaff staff = medicalStaffRepository.findById(vo.getStaffNo())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "담당의사를 찾을 수 없습니다."
                ));

        PatientCase patientCase =
                PatientCase.builder()
                        .patient(patient)
                        .staff(staff)
                        .diagnosis(vo.getDiagnosis())
                        .bodyPart(vo.getBodyPart())
                        .caseStatus(
                                vo.getCaseStatus() == null
                                        ? "FOLLOW_UP"
                                        : vo.getCaseStatus()
                        )
                        .startDate(vo.getStartDate())
                        .endDate(vo.getEndDate())
                        .memo(vo.getMemo())
                        .isDeleted("N")
                        .build();

        PatientCase saved =
                patientCaseRepository.save(patientCase);

        return toVO(saved);
    }

    @Override
    public PatientCaseVO updatePatientCase(
            Long caseId,
            PatientCaseVO vo
    ) {

        PatientCase patientCase =
                patientCaseRepository
                        .findByCaseIdAndIsDeleted(
                                caseId,
                                "N"
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "환자 케이스를 찾을 수 없습니다."
                                )
                        );

        patientCase.setPatient(
                patientRepository.findById(vo.getPatientId())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "환자를 찾을 수 없습니다."
                        ))
        );

        patientCase.setStaff(
                medicalStaffRepository.findById(vo.getStaffNo())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "담당의사를 찾을 수 없습니다."
                        ))
        );

        patientCase.setDiagnosis(
                vo.getDiagnosis()
        );

        patientCase.setBodyPart(
                vo.getBodyPart()
        );

        patientCase.setCaseStatus(
                vo.getCaseStatus()
        );

        patientCase.setStartDate(
                vo.getStartDate()
        );

        patientCase.setEndDate(
                vo.getEndDate()
        );

        patientCase.setMemo(
                vo.getMemo()
        );

        return toVO(patientCase);
    }

    @Override
    public void deletePatientCase(Long caseId) {

        PatientCase patientCase =
                patientCaseRepository
                        .findByCaseIdAndIsDeleted(
                                caseId,
                                "N"
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "환자 케이스를 찾을 수 없습니다."
                                )
                        );

        patientCase.setIsDeleted("Y");
    }

    private PatientCaseVO toVO(
            PatientCase patientCase
    ) {

        return PatientCaseVO.builder()
                .caseId(patientCase.getCaseId())
                .patientId(patientCase.getPatient().getPatientId())
                .staffNo(patientCase.getStaff().getStaffNo())
                .diagnosis(patientCase.getDiagnosis())
                .bodyPart(patientCase.getBodyPart())
                .caseStatus(patientCase.getCaseStatus())
                .startDate(patientCase.getStartDate())
                .endDate(patientCase.getEndDate())
                .memo(patientCase.getMemo())
                .createdAt(patientCase.getCreatedAt())
                .updatedAt(patientCase.getUpdatedAt())
                .isDeleted(patientCase.getIsDeleted())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientCaseVO> getPatientCasesByPatientId(
            Long patientId
    ) {

        return patientCaseRepository
                .findByPatientId(patientId)
                .stream()
                .map(this::toVO)
                .toList();
    }
}