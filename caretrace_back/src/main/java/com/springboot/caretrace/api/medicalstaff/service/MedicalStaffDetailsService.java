package com.springboot.caretrace.api.medicalstaff.service;

import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaffDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface MedicalStaffDetailsService {

    MedicalStaffDetails loadMedicalStaffByLoginId(String loginId)
            throws UsernameNotFoundException;
}
