package com.springboot.caretrace.api.consultation.vo;

import com.springboot.caretrace.api.consultation.entity.OpinionStatus;
import com.springboot.caretrace.api.consultation.entity.OpinionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationOpinionVO {
    private Long opinionId;
    private Long caseId;
    private Long staffId;
    private String staffName;
    private Long parentOpinionId;
    private OpinionType opinionType;
    private String opinionContent;
    private OpinionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}