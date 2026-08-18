package com.springboot.caretrace.patientcase.repository;

import com.springboot.caretrace.patientcase.entity.PatientCase;
import com.springboot.caretrace.patientcase.entity.QPatientCase;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PatientCaseRepositoryCustomImpl
        implements PatientCaseRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<PatientCase> searchPatientCases(
            String keyword,
            String status
    ) {

        QPatientCase patientCase = QPatientCase.patientCase;

        BooleanBuilder builder = new BooleanBuilder();

        // 삭제되지 않은 케이스만
        builder.and(patientCase.isDeleted.eq("N"));

        // 상태 검색
        if (status != null && !status.trim().isEmpty()) {

            builder.and(
                    patientCase.caseStatus.eq(status)
            );
        }

        /*
         * 현재 PatientCase 자체에는 환자명이나 담당의사명이
         * 없기 때문에 여기서는 케이스 기본 검색만 처리한다.
         *
         * patientName / staffName까지 QueryDSL JOIN으로 검색하려면
         * 기존 Patient, MedicalStaff의 Q클래스를 확인한 후
         * JOIN을 추가하면 된다.
         */

        if (keyword != null && !keyword.trim().isEmpty()) {

            String searchKeyword = keyword.trim();

            builder.and(
                    patientCase.diagnosis
                            .containsIgnoreCase(searchKeyword)
                            .or(
                                    patientCase.bodyPart
                                            .containsIgnoreCase(searchKeyword)
                            )
            );
        }

        return queryFactory
                .selectFrom(patientCase)
                .where(builder)
                .orderBy(patientCase.caseId.desc())
                .fetch();
    }
}