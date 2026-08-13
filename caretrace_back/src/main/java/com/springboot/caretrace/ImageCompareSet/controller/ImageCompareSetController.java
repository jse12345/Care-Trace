package com.springboot.caretrace.ImageCompareSet.controller;

import com.springboot.caretrace.ImageCompareSet.entity.ImageCompareSet;
import com.springboot.caretrace.ImageCompareSet.service.ImageCompareSetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Log4j2
public class ImageCompareSetController {

    private final ImageCompareSetService imageCompareSetService;

    @GetMapping("/pacs/list.do")
    public ResponseEntity<?> getPacsStudyList() {
        log.info("[PACS Study List] 오르탕크 연동 및 상세 조회 시작");
        try {
            String orthancUrl = "http://localhost:8042/studies";
            RestTemplate restTemplate = new RestTemplate();

            // 1. 오르탕크에서 모든 Study ID 목록(문자열 배열)을 가져옴
            String[] studyIds = restTemplate.getForObject(orthancUrl, String[].class);

            List<Map<String, Object>> studyList = new ArrayList<>();

            if (studyIds != null) {
                // 2. 각각의 Study ID로 오르탕크에 상세 정보를 다시 요청해서 필요한 데이터만 추출
                for (String studyId : studyIds) {
                    String detailUrl = "http://localhost:8042/studies/" + studyId;
                    try {
                        Map<String, Object> detail = restTemplate.getForObject(detailUrl, Map.class);
                        if (detail != null) {
                            Map<String, Object> patientMain = (Map<String, Object>) detail.get("PatientMainDicomTags");
                            Map<String, Object> studyMain = (Map<String, Object>) detail.get("MainDicomTags");

                            Map<String, Object> studyInfo = new HashMap<>();
                            studyInfo.put("id", studyId);
                            studyInfo.put("studyInstanceUID", studyMain != null ? studyMain.get("StudyInstanceUID") : studyId);
                            studyInfo.put("patientId", patientMain != null ? patientMain.get("PatientID") : "Unknown");
                            studyInfo.put("patientName", patientMain != null ? patientMain.get("PatientName") : "Unknown");
                            studyInfo.put("studyDate", studyMain != null ? studyMain.get("StudyDate") : "-");
                            studyInfo.put("studyDescription", studyMain != null ? studyMain.get("StudyDescription") : "-");

                            studyList.add(studyInfo);
                        }
                    } catch (Exception innerE) {
                        log.error("개별 Study 조회 실패 (ID: " + studyId + "): ", innerE);
                    }
                }
            }

            return ResponseEntity.status(HttpStatus.OK).body(studyList);
        } catch (Exception e) {
            log.error("오르탕크 PACS 연동 오류: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("오르탕크 서버 통신 실패");
        }
    }

    @GetMapping("/compare-set/list.do")
    public ResponseEntity<List<ImageCompareSet>> list(@RequestParam(required = false) Long patientId) {
        List<ImageCompareSet> list = imageCompareSetService.getCompareSetsByPatient(patientId);
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @GetMapping("/compare-set/view.do")
    public ResponseEntity<ImageCompareSet> getDetail(@RequestParam Long id) {
        return ResponseEntity.ok(imageCompareSetService.getCompareSetById(id));
    }

    @PostMapping("/compare-set/register.do")
    public ResponseEntity<ImageCompareSet> register(@RequestBody ImageCompareSet imageCompareSet) {
        ImageCompareSet created = imageCompareSetService.createImageCompareSet(imageCompareSet);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/compare-set/update.do/{id}")
    public ResponseEntity<ImageCompareSet> update(@PathVariable Long id, @RequestBody ImageCompareSet updatedInfo) {
        ImageCompareSet updated = imageCompareSetService.updateImageCompareSet(id, updatedInfo);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/compare-set/delete.do/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        imageCompareSetService.deleteImageCompareSet(id);
        return ResponseEntity.ok("비교 세트가 성공적으로 삭제되었습니다.");
    }
}