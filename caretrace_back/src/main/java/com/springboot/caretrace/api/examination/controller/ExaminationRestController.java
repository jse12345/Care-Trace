package com.springboot.caretrace.api.examination.controller;

import com.springboot.caretrace.api.examination.service.ExaminationService;
import com.springboot.caretrace.api.examination.vo.ExaminationSyncResultVO;
import com.springboot.caretrace.api.examination.vo.ExaminationVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/examination")
@RequiredArgsConstructor
@Log4j2
public class ExaminationRestController {

    private final ExaminationService examinationService;

    @GetMapping("/list.do")
    public ResponseEntity<List<ExaminationVO>> list(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long caseId,
            @RequestParam(required = false) Long lesionId
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(examinationService.list(patientId, caseId, lesionId));
    }

    @GetMapping("/view.do")
    public ResponseEntity<ExaminationVO> view(@RequestParam Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(examinationService.view(id));
    }

    @PostMapping("/sync.do")
    public ResponseEntity<ExaminationSyncResultVO> sync() {
        log.info("[ExaminationRestController.sync] Orthanc -> DB 동기화 요청");
        return ResponseEntity.status(HttpStatus.OK).body(examinationService.sync());
    }
}
