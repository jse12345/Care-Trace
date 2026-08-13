package com.springboot.caretrace.api.lesion.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoiPointVO {

    private Double x;
    private Double y;
}
