package com.springboot.caretrace.api.medicalstaff.service;

import com.springboot.caretrace.api.data.dto.SignInResultDto;
import com.springboot.caretrace.api.medicalstaff.vo.LoginVO;

public interface MedicalStaffAuthService {

    SignInResultDto login(LoginVO vo);
}
