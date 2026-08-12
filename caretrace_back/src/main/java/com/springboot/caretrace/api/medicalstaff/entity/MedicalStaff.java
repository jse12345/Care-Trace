package com.springboot.caretrace.api.medicalstaff.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.springboot.caretrace.api.department.entity.Department;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "medical_staff")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class MedicalStaff implements MedicalStaffDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "staff_no")
    private Long staffNo;

    @Column(name = "employee_no", nullable = false, unique = true, length = 50)
    private String employeeNo;

    @Column(name = "login_id", nullable = false, unique = true, length = 50)
    private String loginId;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "staff_name", nullable = false, length = 50)
    private String staffName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_no", nullable = false)
    private Department department;

    @Column(name = "job_title", nullable = false, length = 50)
    private String jobTitle;

    @Column(name = "license_no", unique = true, length = 50)
    private String licenseNo;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    private StaffRole role = StaffRole.MEDICAL_STAFF;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false, length = 20)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false, length = 1)
    private String isDeleted = "N";

    @CreationTimestamp
    @Column(name = "reg_date", nullable = false, updatable = false)
    private LocalDateTime regDate;

    @UpdateTimestamp
    @Column(name = "update_date")
    private LocalDateTime updateDate;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == null) {
            return List.of();
        }

        String authority = role.name().startsWith("ROLE_")
                ? role.name()
                : "ROLE_" + role.name();

        return List.of(new SimpleGrantedAuthority(authority));
    }

    @Override
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return accountStatus == AccountStatus.ACTIVE
                && "N".equals(isDeleted);
    }

    public void updateInformation(
            String staffName,
            Department department,
            String jobTitle,
            String licenseNo,
            String email,
            String phone
    ) {
        this.staffName = staffName;
        this.department = department;
        this.jobTitle = jobTitle;
        this.licenseNo = licenseNo;
        this.email = email;
        this.phone = phone;
    }

    public void changeRoleAndStatus(
            StaffRole role,
            AccountStatus accountStatus
    ) {
        this.role = role;
        this.accountStatus = accountStatus;
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void softDelete() {
        this.isDeleted = "Y";
        this.accountStatus = AccountStatus.INACTIVE;
    }
}
