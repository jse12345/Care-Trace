package com.springboot.caretrace.api.lesion.repository;

import com.springboot.caretrace.api.lesion.entity.Lesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface QLesionRepository
        extends JpaRepository<Lesion, Long>,
        QuerydslPredicateExecutor<Lesion> {

    boolean existsByCaseIdAndLesionLabelAndIsDeleted(
            Long caseId,
            String lesionLabel,
            String isDeleted
    );

    boolean existsByCaseIdAndLesionLabelAndIsDeletedAndLesionIdNot(
            Long caseId,
            String lesionLabel,
            String isDeleted,
            Long lesionId
    );
}
