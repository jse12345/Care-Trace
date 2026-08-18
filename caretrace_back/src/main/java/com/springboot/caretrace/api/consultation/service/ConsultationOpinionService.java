package com.springboot.caretrace.api.consultation.service;

import com.springboot.caretrace.api.consultation.entity.OpinionStatus;
import com.springboot.caretrace.api.consultation.entity.OpinionType;
import com.springboot.caretrace.api.consultation.vo.ConsultationOpinionVO;
import com.springboot.caretrace.page.PageObject;
import java.util.List;
import java.util.Map;

public interface ConsultationOpinionService {
    List<ConsultationOpinionVO> list(PageObject pageObject, Long caseId, OpinionType type, OpinionStatus status);
    ConsultationOpinionVO writeRequest(ConsultationOpinionVO vo);
    ConsultationOpinionVO writeResponse(ConsultationOpinionVO vo);
    Long delete(Long opinionId);
    ConsultationOpinionVO view(Long opinionId);
    List<Map<String, Object>> searchPatientsForConsultation(String keyword);
    List<Map<String, Object>> getCasesForConsultation(Long patientId);
}