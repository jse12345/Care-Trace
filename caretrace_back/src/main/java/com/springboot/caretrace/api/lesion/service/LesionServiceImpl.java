package com.springboot.caretrace.api.lesion.service;

import com.springboot.caretrace.api.lesion.entity.Lesion;
import com.springboot.caretrace.api.lesion.entity.LesionMeasurement;
import com.springboot.caretrace.api.lesion.entity.LesionType;
import com.springboot.caretrace.api.lesion.repository.LesionMeasurementRepositoryCustom;
import com.springboot.caretrace.api.lesion.repository.LesionRepositoryCustom;
import com.springboot.caretrace.api.lesion.repository.QLesionRepository;
import com.springboot.caretrace.api.lesion.vo.LesionVO;
import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import com.springboot.caretrace.api.medicalstaff.repository.QMedicalStaffRepository;
import com.springboot.caretrace.api.patientcase.entity.PatientCase;
import com.springboot.caretrace.api.patientcase.repository.QPatientCaseRepository;
import com.springboot.caretrace.page.PageObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional(readOnly = true)
public class LesionServiceImpl implements LesionService {

    private final LesionRepositoryCustom lesionRepositoryCustom;
    private final QLesionRepository qLesionRepository;
    private final LesionMeasurementRepositoryCustom lesionMeasurementRepositoryCustom;
    private final QPatientCaseRepository patientCaseRepository;
    private final QMedicalStaffRepository medicalStaffRepository;

    @Override
    public List<LesionVO> list(
            PageObject pageObject,
            Long caseId,
            LesionType lesionType
    ) {
        pageObject.setTotalRow(
                lesionRepositoryCustom.getCount(pageObject, caseId, lesionType)
        );

        return lesionRepositoryCustom.getList(pageObject, caseId, lesionType);
    }

    @Override
    public LesionVO view(Long lesionId) {
        return lesionToVO(findActiveLesion(lesionId));
    }

    @Override
    @Transactional
    public LesionVO write(LesionVO vo, Long createdBy) {
        PatientCase patientCase = findActivePatientCase(requiredLong(vo.getCaseId()));
        String lesionLabel = requiredString(vo.getLesionLabel());
        MedicalStaff createdByStaff = medicalStaffRepository.findById(createdBy)
                .orElseThrow(() -> notFound("의료진 정보를 찾을 수 없습니다."));

        if (qLesionRepository.existsByPatientCase_CaseIdAndLesionLabelAndIsDeleted(
                patientCase.getCaseId(), lesionLabel, "N"
        )) {
            throw conflict("이미 등록된 병변 라벨입니다.");
        }

        Lesion lesion = Lesion.builder()
                .patientCase(patientCase)
                .createdByStaff(createdByStaff)
                .lesionLabel(lesionLabel)
                .organ(optional(vo.getOrgan()))
                .lesionType(vo.getLesionType())
                .isLymphNode(vo.getIsLymphNode() != null && vo.getIsLymphNode())
                .description(optional(vo.getDescription()))
                .isDeleted("N")
                .build();

        return lesionToVO(lesionRepositoryCustom.writeLesion(lesion));
    }

    @Override
    @Transactional
    public Long update(LesionVO vo) {
        Lesion lesion = findActiveLesion(vo.getLesionId());
        String lesionLabel = requiredString(vo.getLesionLabel());

        if (qLesionRepository.existsByPatientCase_CaseIdAndLesionLabelAndIsDeletedAndLesionIdNot(
                lesion.getPatientCase().getCaseId(), lesionLabel, "N", lesion.getLesionId()
        )) {
            throw conflict("이미 등록된 병변 라벨입니다.");
        }

        lesion.update(
                lesionLabel,
                optional(vo.getOrgan()),
                vo.getLesionType(),
                vo.getIsLymphNode(),
                optional(vo.getDescription())
        );
        lesionRepositoryCustom.updateLesion(lesion);
        return 1L;
    }

    @Override
    @Transactional
    public Long delete(Long lesionId) {
        Lesion lesion = findActiveLesion(lesionId);

        // 함정#5: 병변 삭제 시 하위 측정값도 함께 소프트삭제(cascade)해서
        // 삭제된 병변 아래 "살아있는" 측정값이 남지 않도록 한다.
        List<LesionMeasurement> measurements =
                lesionMeasurementRepositoryCustom.getTrendList(lesionId);
        for (LesionMeasurement measurement : measurements) {
            measurement.softDelete();
            lesionMeasurementRepositoryCustom.saveMeasurement(measurement);
        }

        lesion.softDelete();
        lesionRepositoryCustom.updateLesion(lesion);
        return 1L;
    }

    private Lesion findActiveLesion(Long lesionId) {
        if (lesionId == null) {
            throw notFound("병변을 찾을 수 없습니다.");
        }

        Lesion lesion = lesionRepositoryCustom.getLesion(lesionId);

        if (lesion == null) {
            throw notFound("병변을 찾을 수 없습니다.");
        }
        return lesion;
    }

    private PatientCase findActivePatientCase(Long caseId) {
        return patientCaseRepository.findByCaseIdAndIsDeleted(caseId, "N")
                .orElseThrow(() -> notFound("존재하지 않는 증례입니다."));
    }

    private LesionVO lesionToVO(Lesion lesion) {
        return LesionVO.builder()
                .lesionId(lesion.getLesionId())
                .caseId(lesion.getPatientCase().getCaseId())
                .createdBy(lesion.getCreatedByStaff().getStaffNo())
                .lesionLabel(lesion.getLesionLabel())
                .organ(lesion.getOrgan())
                .lesionType(lesion.getLesionType())
                .isLymphNode(lesion.getIsLymphNode())
                .description(lesion.getDescription())
                .regDate(lesion.getRegDate())
                .updateDate(lesion.getUpdateDate())
                .build();
    }

    private String requiredString(String value) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "필수 입력값을 확인해 주세요."
            );
        }
        return value.trim();
    }

    private Long requiredLong(Long value) {
        if (value == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "필수 입력값을 확인해 주세요."
            );
        }
        return value;
    }

    private String optional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}
