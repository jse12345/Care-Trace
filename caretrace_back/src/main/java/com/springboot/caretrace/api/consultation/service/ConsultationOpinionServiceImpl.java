package com.springboot.caretrace.api.consultation.service;

import com.springboot.caretrace.api.consultation.entity.ConsultationOpinion;
import com.springboot.caretrace.api.consultation.entity.OpinionStatus;
import com.springboot.caretrace.api.consultation.entity.OpinionType;
import com.springboot.caretrace.api.consultation.repository.ConsultationOpinionRepositoryCustom;
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

    @Override
    public List<ConsultationOpinionVO> list(PageObject pageObject, Long caseId, OpinionType type, OpinionStatus status) {
        pageObject.setTotalRow(repositoryCustom.getCount(pageObject, caseId, type, status));
        return repositoryCustom.getList(pageObject, caseId, type, status)
                .stream()
                .map(this::entityToVO)
                .toList();
    }

    @Override
    @Transactional
    public ConsultationOpinionVO writeRequest(ConsultationOpinionVO vo) {
        // 요구사항 1-2: 협진의견 등록 (상태 OPEN, 구분 REQUEST)[cite: 2]
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
        // 요구사항 1-3: 응답 등록 시 원 의견 참조 및 원 의견 상태 변경[cite: 2]
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
        // 요구사항 1-4: 협진의견 철회 시 is_deleted 'y', status 'CLOSED'[cite: 2]
        ConsultationOpinion opinion = findActiveOpinion(opinionId);
        opinion.softDelete();
        repositoryCustom.saveOpinion(opinion);
        return 1L;
    }

    private ConsultationOpinion findActiveOpinion(Long opinionId) {
        if (opinionId == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "원 의견 번호가 필요합니다.");
        ConsultationOpinion opinion = repositoryCustom.getOpinion(opinionId);
        if (opinion == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "의견을 찾을 수 없습니다.");
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
}