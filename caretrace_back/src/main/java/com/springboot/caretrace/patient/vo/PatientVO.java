package com.springboot.caretrace.patient.vo;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientVO {

    private Long patientId;

    private String patientCode;

    private String patientName;

    private LocalDate birthDate;

    private String gender;

    private String phone;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String isDeleted;
}