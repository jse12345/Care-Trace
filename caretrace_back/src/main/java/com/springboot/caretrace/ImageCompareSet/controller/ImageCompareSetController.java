package com.springboot.caretrace.ImageCompareSet.controller;

import com.springboot.caretrace.ImageCompareSet.service.ImageCompareSetService;
import com.springboot.caretrace.ImageCompareSet.vo.ImageCompareSetVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Log4j2
public class ImageCompareSetController {

    private final ImageCompareSetService imageCompareSetService;

    // PACS Study 목록 조회는 /examination/list.do (com.springboot.caretrace.api.examination)로 이전됨.
    // 여기서는 Orthanc를 직접 호출하지 않고, DB에 동기화된 Examination 데이터를 사용한다.

    @GetMapping("/compare-set/list.do")
    public ResponseEntity<List<ImageCompareSetVO>> list(@RequestParam(required = false) Long patientId) {
        List<ImageCompareSetVO> list = imageCompareSetService.getCompareSetsByPatient(patientId);
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @GetMapping("/compare-set/view.do")
    public ResponseEntity<ImageCompareSetVO> getDetail(@RequestParam Long id) {
        return ResponseEntity.ok(imageCompareSetService.getCompareSetById(id));
    }

    @PostMapping("/compare-set/register.do")
    public ResponseEntity<ImageCompareSetVO> register(@RequestBody ImageCompareSetVO vo) {
        ImageCompareSetVO created = imageCompareSetService.createImageCompareSet(vo);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/compare-set/update.do/{id}")
    public ResponseEntity<ImageCompareSetVO> update(@PathVariable Long id, @RequestBody ImageCompareSetVO vo) {
        ImageCompareSetVO updated = imageCompareSetService.updateImageCompareSet(id, vo);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/compare-set/delete.do/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        imageCompareSetService.deleteImageCompareSet(id);
        return ResponseEntity.ok("비교 세트가 성공적으로 삭제되었습니다.");
    }
}
