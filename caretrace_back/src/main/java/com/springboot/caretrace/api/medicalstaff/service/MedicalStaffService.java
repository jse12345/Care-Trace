package com.springboot.caretrace.api.medicalstaff.service;

import com.springboot.caretrace.api.medicalstaff.entity.AccountStatus;
import com.springboot.caretrace.api.medicalstaff.entity.StaffRole;
import com.springboot.caretrace.api.medicalstaff.vo.MedicalStaffVO;
import com.springboot.caretrace.page.PageObject;

import java.util.List;

public interface MedicalStaffService {

    List<MedicalStaffVO> list(
            PageObject pageObject,
            Long departmentNo,
            StaffRole role,
            AccountStatus status
    );

    MedicalStaffVO view(Long staffNo);

    MedicalStaffVO write(MedicalStaffVO vo);

    Long update(MedicalStaffVO vo);

    Long updateRoleStatus(MedicalStaffVO vo);

    Long delete(Long staffNo);
}
