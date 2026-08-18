package com.springboot.caretrace.api.patientcase.controller;

import com.springboot.caretrace.api.patientcase.service.PatientCaseService;
import com.springboot.caretrace.api.patientcase.vo.PatientCaseVO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patient-cases")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PatientCaseRepositoryController {

    private final PatientCaseService patientCaseService;

    // 케이스 목록
    @GetMapping
    public ResponseEntity<List<PatientCaseVO>> getPatientCaseList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {

        return ResponseEntity.ok(
                patientCaseService.getPatientCaseList(
                        keyword,
                        status
                )
        );
    }

    // 케이스 상세
    @GetMapping("/{caseId}")
    public ResponseEntity<PatientCaseVO> getPatientCase(
            @PathVariable Long caseId
    ) {

        return ResponseEntity.ok(
                patientCaseService.getPatientCase(caseId)
        );
    }

    // 케이스 등록
    @PostMapping
    public ResponseEntity<PatientCaseVO> writePatientCase(
            @RequestBody PatientCaseVO vo
    ) {

        return ResponseEntity.ok(
                patientCaseService.writePatientCase(vo)
        );
    }

    // 케이스 수정
    @PutMapping("/{caseId}")
    public ResponseEntity<PatientCaseVO> updatePatientCase(
            @PathVariable Long caseId,
            @RequestBody PatientCaseVO vo
    ) {

        return ResponseEntity.ok(
                patientCaseService.updatePatientCase(
                        caseId,
                        vo
                )
        );
    }

    // 케이스 삭제
    @DeleteMapping("/{caseId}")
    public ResponseEntity<Void> deletePatientCase(
            @PathVariable Long caseId
    ) {

        patientCaseService.deletePatientCase(caseId);

        return ResponseEntity.noContent().build();
    }
}