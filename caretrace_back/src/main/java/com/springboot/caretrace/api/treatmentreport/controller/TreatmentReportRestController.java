package com.springboot.caretrace.api.treatmentreport.controller;

import com.springboot.caretrace.api.treatmentreport.entity.ResponseResult;
import com.springboot.caretrace.api.treatmentreport.service.TreatmentResponseReportService;
import com.springboot.caretrace.api.treatmentreport.vo.TreatmentResponseReportVO;
import com.springboot.caretrace.page.PageObject;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/treatment-report")
@RequiredArgsConstructor
@Log4j2
public class TreatmentReportRestController {

    private final TreatmentResponseReportService service;

    @GetMapping("/list.do")
    public ResponseEntity<Map<String, Object>> list(
            HttpServletRequest request,
            @RequestParam(required = false) Long caseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate evaluationDate,
            @RequestParam(required = false) ResponseResult responseResult
    ) throws Exception {
        PageObject pageObject = PageObject.getInstance(request);
        Map<String, Object> map = new HashMap<>();
        map.put("list", service.list(pageObject, caseId, evaluationDate, responseResult));
        map.put("pageObject", pageObject);
        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

    @GetMapping("/view.do")
    public ResponseEntity<TreatmentResponseReportVO> view(@RequestParam Long reportId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.view(reportId));
    }

    @PostMapping("/write.do")
    public ResponseEntity<TreatmentResponseReportVO> write(@RequestBody TreatmentResponseReportVO vo) {
        log.info("[write] 치료반응보고서 데이터: {}", vo);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.write(vo));
    }

    @PostMapping("/update.do")
    public ResponseEntity<String> update(@RequestBody TreatmentResponseReportVO vo) {
        log.info("[update] 치료반응보고서 수정 및 확정: {}", vo);
        service.update(vo);
        return ResponseEntity.status(HttpStatus.OK).body("보고서가 정상적으로 수정(확정)되었습니다.");
    }

    @PostMapping("/delete.do")
    public ResponseEntity<String> delete(@RequestBody TreatmentResponseReportVO vo) {
        service.delete(vo.getReportId());
        return ResponseEntity.status(HttpStatus.OK).body("보고서가 정상적으로 삭제(보관) 처리되었습니다.");
    }
}