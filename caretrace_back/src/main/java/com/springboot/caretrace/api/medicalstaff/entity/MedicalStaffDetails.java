package com.springboot.caretrace.api.medicalstaff.entity;

import org.springframework.security.core.GrantedAuthority;

import java.io.Serializable;
import java.util.Collection;

public interface MedicalStaffDetails extends Serializable {

    Collection<? extends GrantedAuthority> getAuthorities();

    String getLoginId();

    String getPassword();

    boolean isAccountNonExpired();

    boolean isAccountNonLocked();

    boolean isCredentialsNonExpired();

    boolean isEnabled();
}
