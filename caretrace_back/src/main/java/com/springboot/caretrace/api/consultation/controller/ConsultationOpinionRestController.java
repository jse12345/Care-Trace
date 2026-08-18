package com.springboot.caretrace.api.consultation.controller;

import com.springboot.caretrace.api.consultation.entity.OpinionStatus;
import com.springboot.caretrace.api.consultation.entity.OpinionType;
import com.springboot.caretrace.api.consultation.service.ConsultationOpinionService;
import com.springboot.caretrace.api.consultation.vo.ConsultationOpinionVO;
import com.springboot.caretrace.page.PageObject;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/consultation")
@RequiredArgsConstructor
@Log4j2
public class ConsultationOpinionRestController {

    private final ConsultationOpinionService service;

    @GetMapping("/list.do")
    public ResponseEntity<Map<String, Object>> list(
            HttpServletRequest request,
            @RequestParam(required = false) Long caseId,
            @RequestParam(required = false) OpinionType type,
            @RequestParam(required = false) OpinionStatus status
    ) throws Exception {
        PageObject pageObject = PageObject.getInstance(request);
        Map<String, Object> map = new HashMap<>();

        // caseId가 null일 경우 전체 조회를 수행하도록 Service로 넘김
        map.put("list", service.list(pageObject, caseId, type, status));
        map.put("pageObject", pageObject);
        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

    @PostMapping("/write.do")
    public ResponseEntity<ConsultationOpinionVO> writeRequest(@RequestBody ConsultationOpinionVO vo) {
        log.info("[write] 데이터: {}", vo);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.writeRequest(vo));
    }

    @PostMapping("/reply.do")
    public ResponseEntity<ConsultationOpinionVO> writeResponse(@RequestBody ConsultationOpinionVO vo) {
        log.info("[writeResponse] 데이터: {}", vo);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.writeResponse(vo));
    }

    @PostMapping("/delete.do")
    public ResponseEntity<String> delete(@RequestBody ConsultationOpinionVO vo) {
        service.delete(vo.getOpinionId());
        return ResponseEntity.status(HttpStatus.OK).body("정상적으로 철회(삭제)되었습니다.");
    }

    @GetMapping("/view.do")
    public ResponseEntity<ConsultationOpinionVO> view(@RequestParam("opinionId") Long opinionId) {
        ConsultationOpinionVO opinion = service.view(opinionId);
        return ResponseEntity.ok(opinion);
    }

    // 1. 환자 검색 API (/consultation/search-patient.do?keyword=홍길동)
    @GetMapping("/search-patient.do")
    public ResponseEntity<List<Map<String, Object>>> searchPatientForConsultation(@RequestParam String keyword) {
        log.info("[searchPatientForConsultation] 검색 키워드: {}", keyword);
        return ResponseEntity.ok(service.searchPatientsForConsultation(keyword));
    }

    // 2. 특정 환자의 증례 목록 조회 API (/consultation/search-case.do?patientId=1)
    @GetMapping("/search-case.do")
    public ResponseEntity<List<Map<String, Object>>> searchCaseForConsultation(@RequestParam Long patientId) {
        log.info("[searchCaseForConsultation] 조회할 환자 ID: {}", patientId);
        return ResponseEntity.ok(service.getCasesForConsultation(patientId));
    }

}