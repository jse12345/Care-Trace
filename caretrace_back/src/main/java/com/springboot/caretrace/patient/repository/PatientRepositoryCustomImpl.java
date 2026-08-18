package com.springboot.caretrace.patient.repository;

import com.springboot.caretrace.patient.entity.Patient;
import com.springboot.caretrace.patient.entity.QPatient;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PatientRepositoryCustomImpl implements PatientRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Patient> searchPatients(String keyword) {

        QPatient patient = QPatient.patient;

        BooleanBuilder builder = new BooleanBuilder();

        builder.and(patient.isDeleted.eq("N"));

        if (keyword != null && !keyword.trim().isEmpty()) {

            String searchKeyword = keyword.trim();

            builder.and(
                    patient.patientName.containsIgnoreCase(searchKeyword)
                            .or(patient.patientCode.containsIgnoreCase(searchKeyword))
            );
        }

        return queryFactory
                .selectFrom(patient)
                .where(builder)
                .orderBy(patient.patientId.desc())
                .fetch();
    }
}