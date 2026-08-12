package com.springboot.caretrace.api.medicalstaff.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.springboot.caretrace.api.medicalstaff.entity.AccountStatus;
import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import com.springboot.caretrace.api.medicalstaff.entity.QMedicalStaff;
import com.springboot.caretrace.api.medicalstaff.entity.StaffRole;
import com.springboot.caretrace.page.PageObject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MedicalStaffRepositoryCustomImpl
        implements MedicalStaffRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QMedicalStaffRepository qMedicalStaffRepository;

    private final QMedicalStaff medicalStaff =
            QMedicalStaff.medicalStaff;

    @Override
    public List<MedicalStaff> getList(
            PageObject pageObject,
            Long departmentNo,
            StaffRole role,
            AccountStatus status
    ) {
        return queryFactory
                .selectFrom(medicalStaff)
                .join(medicalStaff.department()).fetchJoin()
                .where(search(
                        pageObject,
                        departmentNo,
                        role,
                        status
                ))
                .orderBy(medicalStaff.staffName.asc())
                .limit(pageObject.getPerPageNum())
                .offset(pageObject.getLimit())
                .fetch();
    }

    @Override
    public Long getCount(
            PageObject pageObject,
            Long departmentNo,
            StaffRole role,
            AccountStatus status
    ) {
        Long count = queryFactory
                .select(medicalStaff.count())
                .from(medicalStaff)
                .where(search(
                        pageObject,
                        departmentNo,
                        role,
                        status
                ))
                .fetchOne();

        return count == null ? 0L : count;
    }

    @Override
    public MedicalStaff getMedicalStaff(Long staffNo) {
        return queryFactory
                .selectFrom(medicalStaff)
                .join(medicalStaff.department()).fetchJoin()
                .where(
                        medicalStaff.staffNo.eq(staffNo),
                        medicalStaff.isDeleted.eq("N")
                )
                .fetchOne();
    }

    @Override
    public MedicalStaff writeMedicalStaff(
            MedicalStaff medicalStaff
    ) {
        return qMedicalStaffRepository.save(medicalStaff);
    }

    @Override
    public MedicalStaff updateMedicalStaff(
            MedicalStaff medicalStaff
    ) {
        return qMedicalStaffRepository.save(medicalStaff);
    }

    private BooleanBuilder search(
            PageObject pageObject,
            Long departmentNo,
            StaffRole role,
            AccountStatus status
    ) {
        BooleanBuilder builder = new BooleanBuilder();

        builder.and(medicalStaff.isDeleted.eq("N"));

        if (departmentNo != null) {
            builder.and(
                    medicalStaff
                            .department()
                            .departmentNo
                            .eq(departmentNo)
            );
        }

        if (role != null) {
            builder.and(medicalStaff.role.eq(role));
        }

        if (status != null) {
            builder.and(
                    medicalStaff.accountStatus.eq(status)
            );
        }

        String word = pageObject.getWord();

        if (word == null || word.trim().isEmpty()) {
            return builder;
        }

        String key = pageObject.getKey();
        String normalizedWord = word.trim();

        BooleanBuilder keywordBuilder =
                new BooleanBuilder();

        if (
                key == null
                        || key.isBlank()
                        || key.contains("n")
        ) {
            keywordBuilder.or(
                    medicalStaff.staffName
                            .containsIgnoreCase(normalizedWord)
            );
        }

        if (
                key == null
                        || key.isBlank()
                        || key.contains("e")
        ) {
            keywordBuilder.or(
                    medicalStaff.employeeNo
                            .containsIgnoreCase(normalizedWord)
            );
        }

        if (key != null && key.contains("i")) {
            keywordBuilder.or(
                    medicalStaff.loginId
                            .containsIgnoreCase(normalizedWord)
            );
        }

        builder.and(keywordBuilder);

        return builder;
    }
}