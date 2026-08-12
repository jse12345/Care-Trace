package com.springboot.caretrace.api.department.vo;

import com.springboot.caretrace.api.department.entity.DepartmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentVO {

    private Long departmentNo;
    private String departmentCode;
    private String departmentName;
    private String description;
    private DepartmentStatus status;
    private LocalDateTime regDate;
    private LocalDateTime updateDate;
}
