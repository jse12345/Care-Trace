package com.springboot.caretrace.api.examination.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "examination_series")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExaminationSeries {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "examination_series_id")
    private Long id;

    @Column(name = "orthanc_series_id", unique = true, nullable = false, length = 100)
    private String orthancSeriesId;

    @Column(name = "series_instance_uid", unique = true, nullable = false, length = 128)
    private String seriesInstanceUid;

    @Column(length = 20)
    private String modality;

    @Column(name = "series_description", length = 500)
    private String seriesDescription;

    @Column(name = "series_number", length = 20)
    private String seriesNumber;

    @Builder.Default
    @Column(name = "instance_count", nullable = false)
    private Integer instanceCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "examination_id", nullable = false)
    private Examination examination;

    @CreationTimestamp
    @Column(name = "reg_date", nullable = false, updatable = false)
    private LocalDateTime regDate;

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;
}
