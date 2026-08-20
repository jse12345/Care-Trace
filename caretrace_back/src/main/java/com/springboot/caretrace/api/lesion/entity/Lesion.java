package com.springboot.caretrace.api.lesion.entity;

import com.springboot.caretrace.api.patientcase.entity.PatientCase;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "lesion")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Lesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lesion_id")
    private Long lesionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false, columnDefinition = "BIGINT UNSIGNED")
    private PatientCase patientCase;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "lesion_label", nullable = false, length = 50)
    private String lesionLabel;

    @Column(name = "organ", length = 100)
    private String organ;

    @Enumerated(EnumType.STRING)
    @Column(name = "lesion_type", length = 20)
    private LesionType lesionType;

    @Builder.Default
    @Column(name = "is_lymph_node", nullable = false)
    private Boolean isLymphNode = false;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false, length = 1)
    private String isDeleted = "N";

    @CreationTimestamp
    @Column(name = "reg_date", nullable = false, updatable = false)
    private LocalDateTime regDate;

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;

    public void update(
            String lesionLabel,
            String organ,
            LesionType lesionType,
            Boolean isLymphNode,
            String description
    ) {
        this.lesionLabel = lesionLabel;
        this.organ = organ;
        this.lesionType = lesionType;
        this.isLymphNode = isLymphNode == null ? this.isLymphNode : isLymphNode;
        this.description = description;
    }

    public void softDelete() {
        this.isDeleted = "Y";
    }
}
