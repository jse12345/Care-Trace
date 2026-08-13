package com.springboot.caretrace.api.consultation.repository;

import com.springboot.caretrace.api.consultation.entity.ConsultationOpinion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import java.util.Optional;

public interface QConsultationOpinionRepository
        extends JpaRepository<ConsultationOpinion, Long>,
        QuerydslPredicateExecutor<ConsultationOpinion> {

    Optional<ConsultationOpinion> findByOpinionIdAndIsDeleted(Long opinionId, String isDeleted);
}