package com.springboot.caretrace.api.lesion.controller;

import com.springboot.caretrace.api.lesion.service.LesionMeasurementService;
import com.springboot.caretrace.api.lesion.vo.LesionMeasurementVO;
import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import com.springboot.caretrace.page.PageObject;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/lesion-measurement")
@RequiredArgsConstructor
@Log4j2
public class LesionMeasurementRestController {

    private final LesionMeasurementService service;

    @GetMapping("/list.do")
    public ResponseEntity<Map<String, Object>> list(
            HttpServletRequest request,
            @RequestParam(required = true) Long lesionId,
            @RequestParam(required = false) Long examinationId
    ) throws Exception {
        PageObject pageObject = PageObject.getInstance(request);

        Map<String, Object> map = new HashMap<>();
        map.put("list", service.list(pageObject, lesionId, examinationId));
        map.put("pageObject", pageObject);

        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

    @GetMapping("/view.do")
    public ResponseEntity<LesionMeasurementVO> view(@RequestParam Long measurementId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.view(measurementId));
    }

    @PostMapping("/write.do")
    public ResponseEntity<LesionMeasurementVO> write(
            @RequestBody LesionMeasurementVO vo,
            Authentication authentication
    ) {
        MedicalStaff medicalStaff = (MedicalStaff) authentication.getPrincipal();

        log.info("[write] 측정값 등록 데이터: {}", vo);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.write(vo, medicalStaff.getStaffNo()));
    }

    @PostMapping("/update.do")
    public ResponseEntity<String> update(@RequestBody LesionMeasurementVO vo) {
        service.update(vo);
        return ResponseEntity.status(HttpStatus.OK).body("측정값 수정이 완료되었습니다.");
    }

    @PostMapping("/delete.do")
    public ResponseEntity<String> delete(@RequestBody LesionMeasurementVO vo) {
        service.delete(vo.getMeasurementId());
        return ResponseEntity.status(HttpStatus.OK).body("측정값 삭제가 완료되었습니다.");
    }

    @GetMapping("/trend.do")
    public ResponseEntity<Map<String, Object>> trend(@RequestParam Long lesionId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.trend(lesionId));
    }
}
