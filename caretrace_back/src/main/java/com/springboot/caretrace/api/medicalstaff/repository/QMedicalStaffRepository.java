package com.springboot.caretrace.api.medicalstaff.repository;

import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.Optional;

public interface QMedicalStaffRepository
        extends JpaRepository<MedicalStaff, Long>,
        QuerydslPredicateExecutor<MedicalStaff> {

    @EntityGraph(attributePaths = "department")
    Optional<MedicalStaff> findByLoginId(String loginId);

    @EntityGraph(attributePaths = "department")
    Optional<MedicalStaff> findByStaffNoAndIsDeleted(
            Long staffNo,
            String isDeleted
    );

    boolean existsByEmployeeNo(String employeeNo);

    boolean existsByLoginId(String loginId);

    boolean existsByEmail(String email);

    boolean existsByLicenseNo(String licenseNo);

    boolean existsByEmailAndStaffNoNot(String email, Long staffNo);

    boolean existsByLicenseNoAndStaffNoNot(
            String licenseNo,
            Long staffNo
    );

    boolean existsByDepartment_DepartmentNoAndIsDeleted(
            Long departmentNo,
            String isDeleted
    );
}
