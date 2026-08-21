package com.springboot.caretrace.ImageCompareSet.vo; // 패키지 경로에 맞게 수정하세요

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageCompareSetVO {

    private Long id;                  // 비교 세트 고유 번호 (PK)
    private Long patientId;           // 환자 번호
    private Long doctorId;            // 담당 의료진 번호
    private String pastImageUrl;      // 과거 영상 URL
    private String currentImageUrl;   // 현재 영상 URL
    private String title;             // 제목
    private String description;       // 설명 / 메모
    private LocalDateTime regDate;    // 등록일시
    private LocalDateTime updatedAt;  // 수정일시
}