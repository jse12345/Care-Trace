package com.springboot.caretrace.api.department.controller;

import com.springboot.caretrace.api.department.entity.DepartmentStatus;
import com.springboot.caretrace.api.department.service.DepartmentService;
import com.springboot.caretrace.api.department.vo.DepartmentVO;
import com.springboot.caretrace.page.PageObject;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/department")
@RequiredArgsConstructor
@Log4j2
public class DepartmentRestController {

    private final DepartmentService service;

    @GetMapping("/list.do")
    public ResponseEntity<Map<String, Object>> list(
            HttpServletRequest request,
            @RequestParam(required = false) DepartmentStatus status
    ) throws Exception {
        PageObject pageObject = PageObject.getInstance(request);

        Map<String, Object> map = new HashMap<>();
        map.put("list", service.list(pageObject, status));
        map.put("pageObject", pageObject);

        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

    @GetMapping("/view.do")
    public ResponseEntity<DepartmentVO> view(Long departmentNo) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(service.view(departmentNo));
    }

    @PostMapping("/write.do")
    public ResponseEntity<DepartmentVO> write(
            @RequestBody DepartmentVO vo
    ) {
        log.info("[write] 진료과 등록 데이터: {}", vo);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.write(vo));
    }

    @PostMapping("/update.do")
    public ResponseEntity<String> update(
            @RequestBody DepartmentVO vo
    ) {
        service.update(vo);
        return ResponseEntity.status(HttpStatus.OK)
                .body("진료과 정보 수정이 완료되었습니다.");
    }

    @PostMapping("/delete.do")
    public ResponseEntity<String> delete(
            @RequestBody DepartmentVO vo
    ) {
        service.delete(vo.getDepartmentNo());
        return ResponseEntity.status(HttpStatus.OK)
                .body("진료과 삭제가 완료되었습니다.");
    }
}
