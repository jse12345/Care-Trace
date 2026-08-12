package com.springboot.caretrace.api.department.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.springboot.caretrace.api.department.entity.Department;
import com.springboot.caretrace.api.department.entity.DepartmentStatus;
import com.springboot.caretrace.api.department.entity.QDepartment;
import com.springboot.caretrace.page.PageObject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class DepartmentRepositoryCustomImpl
        implements DepartmentRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QDepartmentRepository qDepartmentRepository;

    private final QDepartment department = QDepartment.department;

    @Override
    public List<Department> getList(
            PageObject pageObject,
            DepartmentStatus status
    ) {
        return queryFactory
                .selectFrom(department)
                .where(search(pageObject, status))
                .orderBy(department.departmentName.asc())
                .limit(pageObject.getPerPageNum())
                .offset(pageObject.getLimit())
                .fetch();
    }

    @Override
    public Long getCount(
            PageObject pageObject,
            DepartmentStatus status
    ) {
        Long count = queryFactory
                .select(department.count())
                .from(department)
                .where(search(pageObject, status))
                .fetchOne();

        return count == null ? 0L : count;
    }

    @Override
    public Department getDepartment(Long departmentNo) {
        return queryFactory
                .selectFrom(department)
                .where(
                        department.departmentNo.eq(departmentNo),
                        department.isDeleted.eq("N")
                )
                .fetchOne();
    }

    @Override
    public Department writeDepartment(Department department) {
        return qDepartmentRepository.save(department);
    }

    @Override
    public Department updateDepartment(Department department) {
        return qDepartmentRepository.save(department);
    }

    private BooleanBuilder search(
            PageObject pageObject,
            DepartmentStatus status
    ) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(department.isDeleted.eq("N"));

        if (status != null) {
            builder.and(department.status.eq(status));
        }

        String word = pageObject.getWord();
        if (word == null || word.trim().isEmpty()) {
            return builder;
        }

        String key = pageObject.getKey();
        String normalizedWord = word.trim();
        BooleanBuilder keywordBuilder = new BooleanBuilder();

        if (key == null || key.isBlank() || key.contains("n")) {
            keywordBuilder.or(
                    department.departmentName.containsIgnoreCase(normalizedWord)
            );
        }
        if (key == null || key.isBlank() || key.contains("c")) {
            keywordBuilder.or(
                    department.departmentCode.containsIgnoreCase(normalizedWord)
            );
        }
        if (key != null && key.contains("d")) {
            keywordBuilder.or(
                    department.description.containsIgnoreCase(normalizedWord)
            );
        }

        builder.and(keywordBuilder);
        return builder;
    }
}
