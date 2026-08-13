package com.springboot.caretrace.api.lesion.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.springboot.caretrace.api.lesion.service.LesionDicomProxyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lesion/dicom")
@RequiredArgsConstructor
@Log4j2
public class LesionDicomProxyController {

    private final LesionDicomProxyService service;

    @GetMapping("/studies.do")
    public ResponseEntity<JsonNode> studies() {
        return ResponseEntity.status(HttpStatus.OK).body(service.getStudies());
    }

    @GetMapping("/series.do")
    public ResponseEntity<JsonNode> series(@RequestParam String studyId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.getSeries(studyId));
    }

    @GetMapping("/instances.do")
    public ResponseEntity<JsonNode> instances(@RequestParam String seriesId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.getOrderedInstances(seriesId));
    }

    @GetMapping(value = "/preview.do", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> preview(@RequestParam String instanceId) {
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.IMAGE_PNG)
                .body(service.getPreview(instanceId));
    }

    @GetMapping("/tags.do")
    public ResponseEntity<JsonNode> tags(@RequestParam String instanceId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.getTags(instanceId));
    }

    @GetMapping("/resolve.do")
    public ResponseEntity<JsonNode> resolve(@RequestParam String uid) {
        return ResponseEntity.status(HttpStatus.OK).body(service.resolve(uid));
    }
}
