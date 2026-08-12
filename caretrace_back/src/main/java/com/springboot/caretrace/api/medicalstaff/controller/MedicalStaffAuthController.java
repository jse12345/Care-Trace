package com.springboot.caretrace.api.medicalstaff.controller;

import com.springboot.caretrace.api.data.dto.SignInResultDto;
import com.springboot.caretrace.api.medicalstaff.service.MedicalStaffAuthService;
import com.springboot.caretrace.api.medicalstaff.vo.LoginVO;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/medical-staff")
@RequiredArgsConstructor
@Log4j2
public class MedicalStaffAuthController {

    private final MedicalStaffAuthService medicalStaffAuthService;

    @PostMapping("/login.do")
    @Operation(summary = "의료진 로그인")
    public ResponseEntity<SignInResultDto> login(
            @RequestBody LoginVO vo
    ) {
        SignInResultDto response = medicalStaffAuthService.login(vo);

        return ResponseEntity
                .status(
                        response.isSuccess()
                                ? HttpStatus.OK
                                : HttpStatus.UNAUTHORIZED
                )
                .body(response);
    }
}
