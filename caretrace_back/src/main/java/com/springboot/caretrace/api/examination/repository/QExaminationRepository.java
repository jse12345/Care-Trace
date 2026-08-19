package com.springboot.caretrace.api.examination.repository;

import com.springboot.caretrace.api.examination.entity.Examination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface QExaminationRepository extends JpaRepository<Examination, Long> {

    Optional<Examination> findByOrthancStudyId(String orthancStudyId);

    Optional<Examination> findByStudyInstanceUid(String studyInstanceUid);

    List<Examination> findAllByOrderByIdDesc();

    List<Examination> findAllByPatientIdOrderByIdDesc(Long patientId);

    @Query("select distinct e from Examination e left join fetch e.seriesList where e.id = :id")
    Optional<Examination> findDetailById(Long id);
}
