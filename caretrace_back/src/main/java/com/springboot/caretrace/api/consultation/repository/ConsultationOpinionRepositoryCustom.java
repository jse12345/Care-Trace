package com.springboot.caretrace.api.consultation.repository;

import com.springboot.caretrace.api.consultation.entity.ConsultationOpinion;
import com.springboot.caretrace.api.consultation.entity.OpinionStatus;
import com.springboot.caretrace.api.consultation.entity.OpinionType;
// VO 클래스 import 추가
import com.springboot.caretrace.api.consultation.vo.ConsultationOpinionVO;
import com.springboot.caretrace.page.PageObject;
import java.util.List;

public interface ConsultationOpinionRepositoryCustom {
    List<ConsultationOpinionVO> getList(PageObject pageObject, Long caseId, OpinionType type, OpinionStatus status);

    Long getCount(PageObject pageObject, Long caseId, OpinionType type, OpinionStatus status);

    ConsultationOpinionVO getOpinion(Long opinionId);

    ConsultationOpinion saveOpinion(ConsultationOpinion opinion);
}