package com.springboot.caretrace.api.lesion.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.springboot.caretrace.api.lesion.entity.Lesion;
import com.springboot.caretrace.api.lesion.entity.LesionType;
import com.springboot.caretrace.api.lesion.entity.QLesion;
import com.springboot.caretrace.page.PageObject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class LesionRepositoryCustomImpl implements LesionRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QLesionRepository qLesionRepository;

    private final QLesion lesion = QLesion.lesion;

    @Override
    public List<Lesion> getList(
            PageObject pageObject,
            Long caseId,
            LesionType lesionType
    ) {
        return queryFactory
                .selectFrom(lesion)
                .where(search(pageObject, caseId, lesionType))
                .orderBy(lesion.regDate.desc())
                .limit(pageObject.getPerPageNum())
                .offset(pageObject.getLimit())
                .fetch();
    }

    @Override
    public Long getCount(
            PageObject pageObject,
            Long caseId,
            LesionType lesionType
    ) {
        Long count = queryFactory
                .select(lesion.count())
                .from(lesion)
                .where(search(pageObject, caseId, lesionType))
                .fetchOne();

        return count == null ? 0L : count;
    }

    @Override
    public Lesion getLesion(Long lesionId) {
        return queryFactory
                .selectFrom(lesion)
                .where(
                        lesion.lesionId.eq(lesionId),
                        lesion.isDeleted.eq("N")
                )
                .fetchOne();
    }

    @Override
    public Lesion writeLesion(Lesion lesion) {
        return qLesionRepository.save(lesion);
    }

    @Override
    public Lesion updateLesion(Lesion lesion) {
        return qLesionRepository.save(lesion);
    }

    private BooleanBuilder search(
            PageObject pageObject,
            Long caseId,
            LesionType lesionType
    ) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(lesion.isDeleted.eq("N"));

        if (caseId != null) {
            builder.and(lesion.patientCase.caseId.eq(caseId));
        }
        if (lesionType != null) {
            builder.and(lesion.lesionType.eq(lesionType));
        }

        String word = pageObject.getWord();
        if (word == null || word.trim().isEmpty()) {
            return builder;
        }

        String key = pageObject.getKey();
        String normalizedWord = word.trim();
        BooleanBuilder keywordBuilder = new BooleanBuilder();

        if (key == null || key.isBlank() || key.contains("l")) {
            keywordBuilder.or(
                    lesion.lesionLabel.containsIgnoreCase(normalizedWord)
            );
        }
        if (key == null || key.isBlank() || key.contains("o")) {
            keywordBuilder.or(
                    lesion.organ.containsIgnoreCase(normalizedWord)
            );
        }

        builder.and(keywordBuilder);
        return builder;
    }
}
