package com.springboot.caretrace.ImageCompareSet.repository;

import com.springboot.caretrace.ImageCompareSet.entity.ImageCompareSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageCompareSetRepository extends JpaRepository<ImageCompareSet, Long> {
    List<ImageCompareSet> findByPatient_PatientId(Long patientId);
}