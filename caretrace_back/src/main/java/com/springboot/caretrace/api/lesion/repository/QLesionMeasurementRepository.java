package com.springboot.caretrace.api.lesion.repository;

import com.springboot.caretrace.api.lesion.entity.LesionMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface QLesionMeasurementRepository
        extends JpaRepository<LesionMeasurement, Long>,
        QuerydslPredicateExecutor<LesionMeasurement> {

    boolean existsByLesion_LesionIdAndExamination_IdAndIsDeleted(
            Long lesionId,
            Long examinationId,
            String isDeleted
    );

    boolean existsByLesion_LesionIdAndExamination_IdAndIsDeletedAndMeasurementIdNot(
            Long lesionId,
            Long examinationId,
            String isDeleted,
            Long measurementId
    );

    long countByLesion_LesionIdAndIsDeleted(
            Long lesionId,
            String isDeleted
    );
}
