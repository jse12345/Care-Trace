package com.springboot.caretrace.api.examination.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExaminationVO {

    private Long id;
    private String orthancStudyId;
    private String studyInstanceUid;

    private String dicomPatientId;
    private String dicomPatientName;
    private String dicomPatientSex;
    private String dicomPatientBirthDate;

    private Long patientId;

    private String accessionNumber;
    private String studyDate;
    private String studyTime;
    private String studyDescription;
    private String referringPhysicianName;
    private String studyID;

    private boolean stable;
    private Integer seriesCount;
    private Integer instanceCount;
    private LocalDateTime lastSyncedAt;

    @Builder.Default
    private List<ExaminationSeriesVO> seriesList = new ArrayList<>();
}
