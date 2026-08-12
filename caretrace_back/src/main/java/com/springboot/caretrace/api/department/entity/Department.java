package com.springboot.caretrace.api.department.entity;

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
@Table(name = "department")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_no")
    private Long departmentNo;

    @Column(name = "department_code", nullable = false, unique = true, length = 50)
    private String departmentCode;

    @Column(name = "department_name", nullable = false, unique = true, length = 50)
    private String departmentName;

    @Column(name = "description", length = 255)
    private String description;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DepartmentStatus status = DepartmentStatus.ACTIVE;

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
            String departmentCode,
            String departmentName,
            String description,
            DepartmentStatus status
    ) {
        this.departmentCode = departmentCode;
        this.departmentName = departmentName;
        this.description = description;
        this.status = status;
    }

    public void softDelete() {
        this.isDeleted = "Y";
        this.status = DepartmentStatus.INACTIVE;
    }
}
