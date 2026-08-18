package com.springboot.caretrace.api.patientcase.service;

import com.springboot.caretrace.api.patientcase.entity.PatientCase;
import com.springboot.caretrace.api.patientcase.repository.QPatientCaseRepository;
import com.springboot.caretrace.api.patientcase.vo.PatientCaseVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientCaseServiceImpl
        implements PatientCaseService {

    private final QPatientCaseRepository patientCaseRepository;

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

        PatientCase patientCase =
                PatientCase.builder()
                        .patientId(vo.getPatientId())
                        .staffNo(vo.getStaffNo())
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

        patientCase.setPatientId(
                vo.getPatientId()
        );

        patientCase.setStaffNo(
                vo.getStaffNo()
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
                .patientId(patientCase.getPatientId())
                .staffNo(patientCase.getStaffNo())
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