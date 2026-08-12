package com.springboot.caretrace.api.department.repository;

import com.springboot.caretrace.api.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.Optional;

public interface QDepartmentRepository
        extends JpaRepository<Department, Long>,
        QuerydslPredicateExecutor<Department> {

    Optional<Department> findByDepartmentNoAndIsDeleted(
            Long departmentNo,
            String isDeleted
    );

    boolean existsByDepartmentCode(String departmentCode);

    boolean existsByDepartmentName(String departmentName);

    boolean existsByDepartmentCodeAndDepartmentNoNot(
            String departmentCode,
            Long departmentNo
    );

    boolean existsByDepartmentNameAndDepartmentNoNot(
            String departmentName,
            Long departmentNo
    );
}
