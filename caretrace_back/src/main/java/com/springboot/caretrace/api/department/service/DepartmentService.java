package com.springboot.caretrace.api.department.service;

import com.springboot.caretrace.api.department.entity.DepartmentStatus;
import com.springboot.caretrace.api.department.vo.DepartmentVO;
import com.springboot.caretrace.page.PageObject;

import java.util.List;

public interface DepartmentService {

    List<DepartmentVO> list(
            PageObject pageObject,
            DepartmentStatus status
    );

    DepartmentVO view(Long departmentNo);

    DepartmentVO write(DepartmentVO vo);

    Long update(DepartmentVO vo);

    Long delete(Long departmentNo);
}
