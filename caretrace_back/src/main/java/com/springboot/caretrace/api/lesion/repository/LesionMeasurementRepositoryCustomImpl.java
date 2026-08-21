package com.springboot.caretrace.api.lesion.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.springboot.caretrace.api.lesion.entity.LesionMeasurement;
import com.springboot.caretrace.api.lesion.entity.QLesionMeasurement;
import com.springboot.caretrace.page.PageObject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class LesionMeasurementRepositoryCustomImpl
        implements LesionMeasurementRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QLesionMeasurementRepository qLesionMeasurementRepository;

    private final QLesionMeasurement measurement =
            QLesionMeasurement.lesionMeasurement;

    @Override
    public List<LesionMeasurement> getList(
            PageObject pageObject,
            Long lesionId,
            Long examinationId
    ) {
        return queryFactory
                .selectFrom(measurement)
                .where(search(lesionId, examinationId))
                .orderBy(measurement.measuredAt.desc())
                .limit(pageObject.getPerPageNum())
                .offset(pageObject.getLimit())
                .fetch();
    }

    @Override
    public Long getCount(
            PageObject pageObject,
            Long lesionId,
            Long examinationId
    ) {
        Long count = queryFactory
                .select(measurement.count())
                .from(measurement)
                .where(search(lesionId, examinationId))
                .fetchOne();

        return count == null ? 0L : count;
    }

    @Override
    public LesionMeasurement getMeasurement(Long measurementId) {
        return queryFactory
                .selectFrom(measurement)
                .where(
                        measurement.measurementId.eq(measurementId),
                        measurement.isDeleted.eq("N")
                )
                .fetchOne();
    }

    @Override
    public List<LesionMeasurement> getTrendList(Long lesionId) {
        return queryFactory
                .selectFrom(measurement)
                .where(
                        measurement.lesion.lesionId.eq(lesionId),
                        measurement.isDeleted.eq("N")
                )
                .orderBy(measurement.measuredAt.asc())
                .fetch();
    }

    @Override
    public LesionMeasurement saveMeasurement(LesionMeasurement measurement) {
        return qLesionMeasurementRepository.save(measurement);
    }

    private BooleanBuilder search(Long lesionId, Long examinationId) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(measurement.isDeleted.eq("N"));

        if (lesionId != null) {
            builder.and(measurement.lesion.lesionId.eq(lesionId));
        }
        if (examinationId != null) {
            builder.and(measurement.examination.id.eq(examinationId));
        }

        return builder;
    }
}
