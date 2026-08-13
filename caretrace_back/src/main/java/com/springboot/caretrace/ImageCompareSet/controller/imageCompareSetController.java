package com.springboot.caretrace.ImageCompareSet.controller;

import com.springboot.caretrace.ImageCompareSet.entity.ImageCompareSet;
import com.springboot.caretrace.ImageCompareSet.service.ImageCompareSetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/compare-set")
@RequiredArgsConstructor
@Log4j2
public class imageCompareSetController {

    private final ImageCompareSetService imageCompareSetService;

    @GetMapping("/list.do")
    public ResponseEntity<List<ImageCompareSet>> list(@RequestParam(required = false) Long patientId) {
        log.info("[ImageCompareSet list] patientId = {}", patientId);
        List<ImageCompareSet> list = imageCompareSetService.getCompareSetsByPatient(patientId);
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @GetMapping("/view.do")
    public ResponseEntity<ImageCompareSet> getDetail(@RequestParam Long id) {
        log.info("[ImageCompareSet getDetail] id = {}", id);
        return ResponseEntity.ok(imageCompareSetService.getCompareSetById(id));
    }

    @PostMapping("/register.do")
    public ResponseEntity<ImageCompareSet> register(@RequestBody ImageCompareSet imageCompareSet) {
        log.info("[ImageCompareSet register]");
        ImageCompareSet created = imageCompareSetService.createImageCompareSet(imageCompareSet);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/update.do/{id}")
    public ResponseEntity<ImageCompareSet> update(@PathVariable Long id, @RequestBody ImageCompareSet updatedInfo) {
        log.info("[ImageCompareSet update] id = {}", id);
        ImageCompareSet updated = imageCompareSetService.updateImageCompareSet(id, updatedInfo);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete.do/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        log.info("[ImageCompareSet delete] id = {}", id);
        imageCompareSetService.deleteImageCompareSet(id);
        return ResponseEntity.ok("비교 세트가 성공적으로 삭제되었습니다.");
    }
}