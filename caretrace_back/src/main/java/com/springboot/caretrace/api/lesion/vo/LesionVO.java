package com.springboot.caretrace.api.lesion.vo;

import com.springboot.caretrace.api.lesion.entity.LesionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LesionVO {

    private Long lesionId;
    private Long caseId;
    private Long createdBy;
    private String lesionLabel;
    private String organ;
    private LesionType lesionType;
    private Boolean isLymphNode;
    private String description;
    private LocalDateTime regDate;
    private LocalDateTime updateDate;
}
