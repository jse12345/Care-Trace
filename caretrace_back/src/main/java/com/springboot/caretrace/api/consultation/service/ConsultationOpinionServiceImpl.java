package com.springboot.caretrace.api.consultation.service;

import com.springboot.caretrace.api.consultation.entity.ConsultationOpinion;
import com.springboot.caretrace.api.consultation.entity.OpinionStatus;
import com.springboot.caretrace.api.consultation.entity.OpinionType;
import com.springboot.caretrace.api.consultation.repository.ConsultationOpinionRepositoryCustom;
import com.springboot.caretrace.api.consultation.repository.QConsultationOpinionRepository;
import com.springboot.caretrace.api.consultation.vo.ConsultationOpinionVO;
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
public class ConsultationOpinionServiceImpl implements ConsultationOpinionService {

    private final ConsultationOpinionRepositoryCustom repositoryCustom;
    private final QConsultationOpinionRepository jpaRepository;

    @Override
    public List<ConsultationOpinionVO> list(PageObject pageObject, Long caseId, OpinionType type, OpinionStatus status) {
        pageObject.setTotalRow(repositoryCustom.getCount(pageObject, caseId, type, status));
        // 이미 Repository에서 VO로 변환되어 넘어오므로 바로 반환합니다.
        return repositoryCustom.getList(pageObject, caseId, type, status);
    }

    @Override
    @Transactional
    public ConsultationOpinionVO writeRequest(ConsultationOpinionVO vo) {
        ConsultationOpinion opinion = ConsultationOpinion.builder()
                .caseId(requiredLong(vo.getCaseId()))
                .staffId(requiredLong(vo.getStaffId()))
                .opinionContent(requiredString(vo.getOpinionContent()))
                .opinionType(OpinionType.REQUEST)
                .status(OpinionStatus.OPEN)
                .isDeleted("n")
                .build();
        return entityToVO(repositoryCustom.saveOpinion(opinion));
    }

    @Override
    @Transactional
    public ConsultationOpinionVO writeResponse(ConsultationOpinionVO vo) {
        ConsultationOpinion parentOpinion = findActiveOpinion(vo.getParentOpinionId());
        parentOpinion.changeStatus(OpinionStatus.ANSWERED);
        repositoryCustom.saveOpinion(parentOpinion);

        ConsultationOpinion responseOpinion = ConsultationOpinion.builder()
                .caseId(parentOpinion.getCaseId())
                .staffId(requiredLong(vo.getStaffId()))
                .parentOpinionId(parentOpinion.getOpinionId())
                .opinionContent(requiredString(vo.getOpinionContent()))
                .opinionType(OpinionType.RESPONSE)
                .status(OpinionStatus.OPEN)
                .isDeleted("n")
                .build();

        return entityToVO(repositoryCustom.saveOpinion(responseOpinion));
    }

    @Override
    @Transactional
    public Long delete(Long opinionId) {
        ConsultationOpinion opinion = findActiveOpinion(opinionId);
        opinion.softDelete();
        repositoryCustom.saveOpinion(opinion);
        return 1L;
    }

    // 상태 업데이트용 영속성 엔티티 조회를 위해 기본 JpaRepository의 findById 사용
    private ConsultationOpinion findActiveOpinion(Long opinionId) {
        if (opinionId == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "원 의견 번호가 필요합니다.");

        ConsultationOpinion opinion = jpaRepository.findById(opinionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "의견을 찾을 수 없습니다."));

        if ("y".equalsIgnoreCase(opinion.getIsDeleted())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "이미 삭제된 의견입니다.");
        }
        return opinion;
    }

    private ConsultationOpinionVO entityToVO(ConsultationOpinion entity) {
        return ConsultationOpinionVO.builder()
                .opinionId(entity.getOpinionId())
                .caseId(entity.getCaseId())
                .staffId(entity.getStaffId())
                .parentOpinionId(entity.getParentOpinionId())
                .opinionType(entity.getOpinionType())
                .opinionContent(entity.getOpinionContent())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private Long requiredLong(Long value) {
        if (value == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "필수 입력값이 누락되었습니다.");
        return value;
    }

    private String requiredString(String value) {
        if (value == null || value.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "필수 입력값이 누락되었습니다.");
        return value.trim();
    }
    @Override
    public ConsultationOpinionVO view(Long opinionId) {
        ConsultationOpinionVO vo = repositoryCustom.getOpinion(opinionId);

        if (vo == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "해당 협진 의견을 찾을 수 없습니다.");
        }

        return vo;
    }
}