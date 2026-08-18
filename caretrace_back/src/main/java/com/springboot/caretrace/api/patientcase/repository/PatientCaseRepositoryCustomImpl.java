package com.springboot.caretrace.api.patientcase.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.springboot.caretrace.api.medicalstaff.entity.QMedicalStaff;
import com.springboot.caretrace.api.patient.entity.QPatient;
import com.springboot.caretrace.api.patientcase.entity.PatientCase;
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

        QPatient patient =
                QPatient.patient;

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
                                    patient.patientName
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

                                // 환자 정보
                                patient.patientCode
                                        .as("patientCode"),

                                patient.patientName
                                        .as("patientName"),

                                // 의료진 정보
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

                // 환자 JOIN
                .join(patient)
                .on(
                        patientCase.patientId
                                .eq(patient.patientId)
                )

                // 의료진 JOIN
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


    @Override
    public PatientCaseVO findPatientCaseDetail(
            Long caseId
    ) {

        QPatientCase patientCase =
                QPatientCase.patientCase;

        QPatient patient =
                QPatient.patient;

        QMedicalStaff medicalStaff =
                QMedicalStaff.medicalStaff;

        return queryFactory
                .select(
                        Projections.fields(
                                PatientCaseVO.class,

                                patientCase.caseId,

                                patientCase.patientId,

                                // 환자 정보
                                patient.patientCode
                                        .as("patientCode"),

                                patient.patientName
                                        .as("patientName"),

                                // 의료진 정보
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

                // 환자 JOIN
                .join(patient)
                .on(
                        patientCase.patientId
                                .eq(patient.patientId)
                )

                // 의료진 JOIN
                .join(medicalStaff)
                .on(
                        patientCase.staffNo
                                .eq(medicalStaff.staffNo)
                )

                .where(
                        patientCase.caseId.eq(caseId),
                        patientCase.isDeleted.eq("N")
                )

                .fetchOne();
    }

    @Override
    public List<PatientCase> findByPatientId(Long patientId) {

        QPatientCase patientCase = QPatientCase.patientCase;

        return queryFactory
                .selectFrom(patientCase)
                .where(
                        patientCase.patientId.eq(patientId),
                        patientCase.isDeleted.eq("N")
                )
                .orderBy(
                        patientCase.startDate.desc()
                )
                .fetch();
    }
}