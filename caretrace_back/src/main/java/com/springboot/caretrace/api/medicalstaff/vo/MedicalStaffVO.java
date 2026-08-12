package com.springboot.caretrace.api.medicalstaff.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.springboot.caretrace.api.medicalstaff.entity.AccountStatus;
import com.springboot.caretrace.api.medicalstaff.entity.StaffRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalStaffVO {

    private Long staffNo;
    private String employeeNo;
    private String loginId;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String staffName;
    private Long departmentNo;
    private String departmentCode;
    private String departmentName;
    private String jobTitle;
    private String licenseNo;
    private String email;
    private String phone;
    private StaffRole role;
    private AccountStatus accountStatus;
    private LocalDateTime regDate;
    private LocalDateTime updateDate;
}
