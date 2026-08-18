package com.springboot.caretrace.api.patientcase.vo;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientCaseVO {

    private Long caseId;

    private Long patientId;

    // 화면 표시용
    private String patientCode;
    private String patientName;

    private Long staffNo;

    // 화면 표시용
    private String staffName;

    private String diagnosis;

    private String bodyPart;

    private String caseStatus;

    private LocalDate startDate;

    private LocalDate endDate;

    private String memo;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String isDeleted;
}