package com.springboot.caretrace.api.lesion.repository;

import com.springboot.caretrace.api.lesion.entity.LesionMeasurement;
import com.springboot.caretrace.page.PageObject;

import java.util.List;

public interface LesionMeasurementRepositoryCustom {

    List<LesionMeasurement> getList(
            PageObject pageObject,
            Long lesionId,
            Long examinationId
    );

    Long getCount(
            PageObject pageObject,
            Long lesionId,
            Long examinationId
    );

    LesionMeasurement getMeasurement(Long measurementId);

    List<LesionMeasurement> getTrendList(Long lesionId);

    LesionMeasurement saveMeasurement(LesionMeasurement measurement);
}
