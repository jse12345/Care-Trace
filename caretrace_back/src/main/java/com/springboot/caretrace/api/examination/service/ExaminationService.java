package com.springboot.caretrace.api.examination.service;

import com.springboot.caretrace.api.examination.vo.ExaminationSyncResultVO;
import com.springboot.caretrace.api.examination.vo.ExaminationVO;

import java.util.List;

public interface ExaminationService {

    // 검사 목록 조회. patientId/caseId/lesionId 중 있는 것부터 우선순위로 환자를 특정해서 필터링한다. 전부 null이면 전체 목록.
    List<ExaminationVO> list(Long patientId, Long caseId, Long lesionId);

    // 검사 상세 조회 (Series 목록 포함)
    ExaminationVO view(Long id);

    // Orthanc 서버의 전체 Study를 가져와 DB에 upsert
    ExaminationSyncResultVO sync();
}
