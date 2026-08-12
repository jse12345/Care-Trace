package com.springboot.caretrace.api.medicalstaff.controller;

import com.springboot.caretrace.api.medicalstaff.entity.AccountStatus;
import com.springboot.caretrace.api.medicalstaff.entity.StaffRole;
import com.springboot.caretrace.api.medicalstaff.service.MedicalStaffService;
import com.springboot.caretrace.api.medicalstaff.vo.MedicalStaffVO;
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
@RequestMapping("/medical-staff")
@RequiredArgsConstructor
@Log4j2
public class MedicalStaffRestController {

    private final MedicalStaffService service;

    @GetMapping("/list.do")
    public ResponseEntity<Map<String, Object>> list(
            HttpServletRequest request,
            @RequestParam(required = false) Long departmentNo,
            @RequestParam(required = false) StaffRole role,
            @RequestParam(required = false) AccountStatus status
    ) throws Exception {
        PageObject pageObject = PageObject.getInstance(request);

        Map<String, Object> map = new HashMap<>();
        map.put(
                "list",
                service.list(
                        pageObject,
                        departmentNo,
                        role,
                        status
                )
        );
        map.put("pageObject", pageObject);

        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

    @GetMapping("/view.do")
    public ResponseEntity<MedicalStaffVO> view(Long staffNo) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(service.view(staffNo));
    }

    @PostMapping("/write.do")
    public ResponseEntity<MedicalStaffVO> write(
            @RequestBody MedicalStaffVO vo
    ) {
        log.info("[write] 의료진 등록 데이터: {}", vo);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.write(vo));
    }

    @PostMapping("/update.do")
    public ResponseEntity<String> update(
            @RequestBody MedicalStaffVO vo
    ) {
        service.update(vo);
        return ResponseEntity.status(HttpStatus.OK)
                .body("의료진 정보 수정이 완료되었습니다.");
    }

    @PostMapping("/role-status.do")
    public ResponseEntity<String> updateRoleStatus(
            @RequestBody MedicalStaffVO vo
    ) {
        service.updateRoleStatus(vo);
        return ResponseEntity.status(HttpStatus.OK)
                .body("의료진 권한 및 상태 수정이 완료되었습니다.");
    }

    @PostMapping("/delete.do")
    public ResponseEntity<String> delete(
            @RequestBody MedicalStaffVO vo
    ) {
        service.delete(vo.getStaffNo());
        return ResponseEntity.status(HttpStatus.OK)
                .body("의료진 삭제가 완료되었습니다.");
    }
}