package com.springboot.caretrace.ImageCompareSet.controller;

import com.springboot.caretrace.ImageCompareSet.entity.ImageCompareSet;
import com.springboot.caretrace.ImageCompareSet.service.ImageCompareSetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Log4j2
public class ImageCompareSetController {

    private final ImageCompareSetService imageCompareSetService;

    @GetMapping("/pacs/list.do")
    public ResponseEntity<?> getPacsStudyList() {
        log.info("[PACS Study List Proxy] 오르탕크 목록 조회 요청");
        try {
            String orthancUrl = "http://localhost:8042/studies";
            RestTemplate restTemplate = new RestTemplate();

            Object[] studies = restTemplate.getForObject(orthancUrl, Object[].class);
            return ResponseEntity.status(HttpStatus.OK).body(studies);
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