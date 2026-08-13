package com.springboot.caretrace.api.lesion.service;

import com.springboot.caretrace.api.lesion.vo.LesionMeasurementVO;
import com.springboot.caretrace.page.PageObject;

import java.util.List;
import java.util.Map;

public interface LesionMeasurementService {

    List<LesionMeasurementVO> list(
            PageObject pageObject,
            Long lesionId,
            Long examinationId
    );

    LesionMeasurementVO view(Long measurementId);

    LesionMeasurementVO write(LesionMeasurementVO vo, Long measuredBy);

    Long update(LesionMeasurementVO vo);

    Long delete(Long measurementId);

    Map<String, Object> trend(Long lesionId);
}
