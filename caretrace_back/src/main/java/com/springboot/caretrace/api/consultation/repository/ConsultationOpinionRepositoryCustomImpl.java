package com.springboot.caretrace.api.consultation.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.springboot.caretrace.api.consultation.entity.ConsultationOpinion;
import com.springboot.caretrace.api.consultation.entity.OpinionStatus;
import com.springboot.caretrace.api.consultation.entity.OpinionType;
import com.springboot.caretrace.api.consultation.entity.QConsultationOpinion;
import com.springboot.caretrace.api.consultation.vo.ConsultationOpinionVO;
import com.springboot.caretrace.api.medicalstaff.entity.QMedicalStaff;
import com.springboot.caretrace.page.PageObject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ConsultationOpinionRepositoryCustomImpl implements ConsultationOpinionRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QConsultationOpinionRepository qRepository;

    private final QConsultationOpinion opinion = QConsultationOpinion.consultationOpinion;
    private final QMedicalStaff staff = QMedicalStaff.medicalStaff;

    @Override
    public List<ConsultationOpinionVO> getList(PageObject pageObject, Long caseId, OpinionType type, OpinionStatus status) {
        return queryFactory
                .select(Projections.fields(ConsultationOpinionVO.class,
                        opinion.opinionId,
                        opinion.caseId,
                        opinion.parentOpinionId,
                        opinion.opinionType,
                        opinion.opinionContent,
                        opinion.status,
                        opinion.createdAt,
                        opinion.updatedAt,
                        staff.staffNo.as("staffId"),   // medical_staff 테이블의 번호
                        staff.staffName.as("staffName") // JOIN을 통해 가져온 의료진 이름
                ))
                .from(opinion)
                .leftJoin(staff).on(opinion.staffId.eq(staff.staffNo))
                .where(search(caseId, type, status))
                .orderBy(opinion.createdAt.desc())
                .limit(pageObject.getPerPageNum())
                .offset(pageObject.getLimit())
                .fetch();
    }

    @Override
    public Long getCount(PageObject pageObject, Long caseId, OpinionType type, OpinionStatus status) {
        Long count = queryFactory
                .select(opinion.count())
                .from(opinion)
                .where(search(caseId, type, status))
                .fetchOne();
        return count == null ? 0L : count;
    }

    @Override
    public ConsultationOpinionVO getOpinion(Long opinionId) {
        return queryFactory
                .select(Projections.fields(ConsultationOpinionVO.class,
                        opinion.opinionId,
                        opinion.caseId,
                        opinion.parentOpinionId,
                        opinion.opinionType,
                        opinion.opinionContent,
                        opinion.status,
                        opinion.createdAt,
                        opinion.updatedAt,
                        staff.staffNo.as("staffId"),
                        staff.staffName.as("staffName")
                ))
                .from(opinion)
                .leftJoin(staff).on(opinion.staffId.eq(staff.staffNo))
                .where(
                        opinion.opinionId.eq(opinionId),
                        opinion.isDeleted.eq("n")
                )
                .fetchOne();
    }

    @Override
    public ConsultationOpinion saveOpinion(ConsultationOpinion entity) {
        return qRepository.save(entity);
    }

    // 요구사항 1-1: 삭제되지 않은 의견만 증례별 조회 및 구분/상태 검색
    private BooleanBuilder search(Long caseId, OpinionType type, OpinionStatus status) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(opinion.isDeleted.eq("n"));

        if (caseId != null) {
            builder.and(opinion.caseId.eq(caseId));
        }
        if (type != null) {
            builder.and(opinion.opinionType.eq(type));
        }
        if (status != null) {
            builder.and(opinion.status.eq(status));
        }
        return builder;
    }
}