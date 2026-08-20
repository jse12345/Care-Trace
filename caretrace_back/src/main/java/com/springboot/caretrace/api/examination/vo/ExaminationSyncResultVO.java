package com.springboot.caretrace.api.examination.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExaminationSyncResultVO {

    private int totalCount;
    private int savedCount;
    private int updatedCount;
    private int deletedCount;
    private int failedCount;

    @Builder.Default
    private List<String> failedStudyIds = new ArrayList<>();

    private boolean alreadyRunning;
}
