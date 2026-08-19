package com.springboot.caretrace.api.examination.repository;

import com.springboot.caretrace.api.examination.entity.ExaminationSeries;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QExaminationSeriesRepository extends JpaRepository<ExaminationSeries, Long> {

    Optional<ExaminationSeries> findByOrthancSeriesId(String orthancSeriesId);

    Optional<ExaminationSeries> findBySeriesInstanceUid(String seriesInstanceUid);
}
