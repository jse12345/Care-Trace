package com.springboot.caretrace.api.treatmentreport.repository;

import com.springboot.caretrace.api.treatmentreport.entity.TreatmentResponseReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import java.util.Optional;

public interface QTreatmentResponseReportRepository
        extends JpaRepository<TreatmentResponseReport, Long>,
        QuerydslPredicateExecutor<TreatmentResponseReport> {

    Optional<TreatmentResponseReport> findByReportIdAndIsDeleted(Long reportId, String isDeleted);
}