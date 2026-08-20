package com.springboot.caretrace.api.lesion.controller;

import com.springboot.caretrace.api.lesion.entity.LesionType;
import com.springboot.caretrace.api.lesion.service.LesionService;
import com.springboot.caretrace.api.lesion.vo.LesionVO;
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
@RequestMapping("/lesion")
@RequiredArgsConstructor
@Log4j2
public class LesionRestController {

    private final LesionService service;

    @GetMapping("/list.do")
    public ResponseEntity<Map<String, Object>> list(
            HttpServletRequest request,
            @RequestParam(required = false) Long caseId,
            @RequestParam(required = false) LesionType lesionType
    ) throws Exception {
        PageObject pageObject = PageObject.getInstance(request);

        Map<String, Object> map = new HashMap<>();
        map.put("list", service.list(pageObject, caseId, lesionType));
        map.put("pageObject", pageObject);

        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

    @GetMapping("/view.do")
    public ResponseEntity<LesionVO> view(@RequestParam Long lesionId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.view(lesionId));
    }

    @PostMapping("/write.do")
    public ResponseEntity<LesionVO> write(
            @RequestBody LesionVO vo,
            Authentication authentication
    ) {
        // 함정#4: createdBy는 클라이언트 입력을 믿지 않고 JWT principal에서 뽑는다.
        MedicalStaff medicalStaff = (MedicalStaff) authentication.getPrincipal();

        log.info("[write] 병변 등록 데이터: {}", vo);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.write(vo, medicalStaff.getStaffNo()));
    }

    @PostMapping("/update.do")
    public ResponseEntity<String> update(@RequestBody LesionVO vo) {
        service.update(vo);
        return ResponseEntity.status(HttpStatus.OK).body("병변 정보 수정이 완료되었습니다.");
    }

    @PostMapping("/delete.do")
    public ResponseEntity<String> delete(@RequestBody LesionVO vo) {
        service.delete(vo.getLesionId());
        return ResponseEntity.status(HttpStatus.OK).body("병변 삭제가 완료되었습니다.");
    }
}
