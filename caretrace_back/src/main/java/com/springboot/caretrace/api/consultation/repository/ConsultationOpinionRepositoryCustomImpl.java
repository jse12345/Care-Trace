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
import com.springboot.caretrace.api.patient.entity.QPatient;
import com.springboot.caretrace.api.patient.repository.PatientRepositoryCustomImpl;
import com.springboot.caretrace.api.patientcase.entity.QPatientCase;
import com.springboot.caretrace.page.PageObject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import static com.springboot.caretrace.api.patient.entity.QPatient.patient;
import static com.springboot.caretrace.api.patientcase.entity.QPatientCase.patientCase;

@Repository
@RequiredArgsConstructor
public class ConsultationOpinionRepositoryCustomImpl implements ConsultationOpinionRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QConsultationOpinionRepository qRepository;

    private final QConsultationOpinion opinion = QConsultationOpinion.consultationOpinion;
    private final QMedicalStaff staff = QMedicalStaff.medicalStaff;
    private final PatientRepositoryCustomImpl patientRepositoryCustomImpl;

    @Override
    public List<ConsultationOpinionVO> getList(PageObject pageObject, Long caseId, OpinionType type, OpinionStatus status) {

        // 1단계: 사용자의 검색 조건(caseId, 상태, 구분 등)에 맞는 데이터의 ID만 5개(페이징) 찾아옵니다.
        List<ConsultationOpinion> targetList = queryFactory
                .selectFrom(opinion)
                .where(search(caseId, type, status))
                .orderBy(opinion.createdAt.desc())
                .limit(pageObject.getPerPageNum())
                .offset(pageObject.getLimit())
                .fetch();

        if (targetList.isEmpty()) {
            return Collections.emptyList();
        }

        // 2단계: 찾아온 5개의 글이 속한 "원글(부모) ID"를 모두 수집하여 Set에 담습니다. (중복 제거)
        Set<Long> familyIds = new HashSet<>();
        for (ConsultationOpinion op : targetList) {
            if (op.getParentOpinionId() == null) {
                // 본인이 원글(REQUEST)인 경우 본인의 ID를 담음
                familyIds.add(op.getOpinionId());
            } else {
                // 본인이 답글(RESPONSE)인 경우 부모의 ID를 담음
                familyIds.add(op.getParentOpinionId());
            }
        }

        // 3단계: 수집된 '원글 ID'들을 바탕으로 관련된 원글 + 모든 답글을 한 번에 조회해서 반환합니다.
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
                        staff.staffName.as("staffName"),
                        patient.patientName.as("patientName")
                ))
                .from(opinion)
                .leftJoin(staff).on(opinion.staffId.eq(staff.staffNo))
                .leftJoin(patientCase).on(opinion.caseId.eq(patientCase.caseId))
                .leftJoin(patient).on(patientCase.patientId.eq(patient.patientId))
                .where(
                        // 삭제되지 않은 데이터만 가져오도록 필터링
                        opinion.isDeleted.eq("n"),
                        // 수집된 원글이거나 OR 그 원글을 부모로 두는 답글인 경우 모두 포함
                        opinion.opinionId.in(familyIds)
                                .or(opinion.parentOpinionId.in(familyIds))
                )
                // 프론트엔드 전달을 위해 최신순 정렬
                .orderBy(opinion.createdAt.desc())
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