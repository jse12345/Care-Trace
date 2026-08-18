package com.springboot.caretrace.api.patientcase.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.springboot.caretrace.api.medicalstaff.entity.QMedicalStaff;
import com.springboot.caretrace.api.patientcase.entity.QPatientCase;
import com.springboot.caretrace.api.patientcase.vo.PatientCaseVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PatientCaseRepositoryCustomImpl
        implements PatientCaseRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<PatientCaseVO> searchPatientCases(
            String keyword,
            String status
    ) {

        QPatientCase patientCase =
                QPatientCase.patientCase;

        QMedicalStaff medicalStaff =
                QMedicalStaff.medicalStaff;

        BooleanBuilder builder =
                new BooleanBuilder();

        // 삭제되지 않은 케이스만
        builder.and(
                patientCase.isDeleted.eq("N")
        );

        // 상태 검색
        if (status != null &&
                !status.trim().isEmpty()) {

            builder.and(
                    patientCase.caseStatus.eq(status)
            );
        }

        // 검색
        if (keyword != null &&
                !keyword.trim().isEmpty()) {

            String searchKeyword =
                    keyword.trim();

            builder.and(
                    patientCase.diagnosis
                            .containsIgnoreCase(searchKeyword)
                            .or(
                                    patientCase.bodyPart
                                            .containsIgnoreCase(
                                                    searchKeyword
                                            )
                            )
                            .or(
                                    medicalStaff.staffName
                                            .containsIgnoreCase(
                                                    searchKeyword
                                            )
                            )
            );
        }

        return queryFactory
                .select(
                        Projections.fields(
                                PatientCaseVO.class,

                                patientCase.caseId,
                                patientCase.patientId,
                                patientCase.staffNo,

                                medicalStaff.staffName
                                        .as("staffName"),

                                patientCase.diagnosis,
                                patientCase.bodyPart,
                                patientCase.caseStatus,
                                patientCase.startDate,
                                patientCase.endDate,
                                patientCase.memo,
                                patientCase.createdAt,
                                patientCase.updatedAt,
                                patientCase.isDeleted
                        )
                )
                .from(patientCase)

                // 담당 의료진 JOIN
                .join(medicalStaff)
                .on(
                        patientCase.staffNo
                                .eq(medicalStaff.staffNo)
                )

                .where(builder)

                .orderBy(
                        patientCase.caseId.desc()
                )

                .fetch();
    }
}