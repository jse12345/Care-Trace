package com.springboot.caretrace.patient.controller;

import com.springboot.caretrace.patient.service.PatientService;
import com.springboot.caretrace.patient.vo.PatientVO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PatientRepositoryController {

    private final PatientService patientService;

    // 환자 목록
    @GetMapping
    public ResponseEntity<List<PatientVO>> getPatientList(
            @RequestParam(required = false) String keyword
    ) {

        return ResponseEntity.ok(
                patientService.getPatientList(keyword)
        );
    }

    // 환자 상세
    @GetMapping("/{patientId}")
    public ResponseEntity<PatientVO> getPatient(
            @PathVariable Long patientId
    ) {

        return ResponseEntity.ok(
                patientService.getPatient(patientId)
        );
    }

    // 환자 등록
    @PostMapping
    public ResponseEntity<PatientVO> writePatient(
            @RequestBody PatientVO vo
    ) {

        return ResponseEntity.ok(
                patientService.writePatient(vo)
        );
    }

    // 환자 수정
    @PutMapping("/{patientId}")
    public ResponseEntity<PatientVO> updatePatient(
            @PathVariable Long patientId,
            @RequestBody PatientVO vo
    ) {

        return ResponseEntity.ok(
                patientService.updatePatient(patientId, vo)
        );
    }

    // 환자 삭제
    @DeleteMapping("/{patientId}")
    public ResponseEntity<Void> deletePatient(
            @PathVariable Long patientId
    ) {

        patientService.deletePatient(patientId);

        return ResponseEntity.noContent().build();
    }
}