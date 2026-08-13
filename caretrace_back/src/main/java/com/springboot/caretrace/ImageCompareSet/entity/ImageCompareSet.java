package com.springboot.caretrace.ImageCompareSet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "image_compare_set")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageCompareSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id")
    private Long doctorId;

    @Column(name = "past_image_url", nullable = false)
    private String pastImageUrl;

    @Column(name = "current_image_url", nullable = false)
    private String currentImageUrl;

    @Column(length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate;
}