package com.springboot.caretrace.api.consultation.repository;

import com.springboot.caretrace.api.consultation.entity.ConsultationOpinion;
import com.springboot.caretrace.api.consultation.entity.OpinionStatus;
import com.springboot.caretrace.api.consultation.entity.OpinionType;
import com.springboot.caretrace.page.PageObject;
import java.util.List;

public interface ConsultationOpinionRepositoryCustom {
    List<ConsultationOpinion> getList(PageObject pageObject, Long caseId, OpinionType type, OpinionStatus status);
    Long getCount(PageObject pageObject, Long caseId, OpinionType type, OpinionStatus status);
    ConsultationOpinion getOpinion(Long opinionId);
    ConsultationOpinion saveOpinion(ConsultationOpinion opinion);
}