package com.springboot.caretrace.api.medicalstaff.repository;

import com.springboot.caretrace.api.medicalstaff.entity.AccountStatus;
import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import com.springboot.caretrace.api.medicalstaff.entity.StaffRole;
import com.springboot.caretrace.page.PageObject;

import java.util.List;

public interface MedicalStaffRepositoryCustom {

    List<MedicalStaff> getList(
            PageObject pageObject,
            Long departmentNo,
            StaffRole role,
            AccountStatus status
    );

    Long getCount(
            PageObject pageObject,
            Long departmentNo,
            StaffRole role,
            AccountStatus status
    );

    MedicalStaff getMedicalStaff(Long staffNo);

    MedicalStaff writeMedicalStaff(MedicalStaff medicalStaff);

    MedicalStaff updateMedicalStaff(MedicalStaff medicalStaff);
}
