package com.springboot.caretrace.api.department.repository;

import com.springboot.caretrace.api.department.entity.Department;
import com.springboot.caretrace.api.department.entity.DepartmentStatus;
import com.springboot.caretrace.page.PageObject;

import java.util.List;

public interface DepartmentRepositoryCustom {

    List<Department> getList(
            PageObject pageObject,
            DepartmentStatus status
    );

    Long getCount(
            PageObject pageObject,
            DepartmentStatus status
    );

    Department getDepartment(Long departmentNo);

    Department writeDepartment(Department department);

    Department updateDepartment(Department department);
}
