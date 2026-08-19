package com.springboot.caretrace.api.examination.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExaminationSeriesVO {

    private Long id;
    private String orthancSeriesId;
    private String seriesInstanceUid;
    private String modality;
    private String seriesDescription;
    private String seriesNumber;
    private Integer instanceCount;
}
