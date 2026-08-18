package com.springboot.caretrace.api.medicalstaff.service;

import com.springboot.caretrace.api.data.dto.SignInResultDto;
import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import com.springboot.caretrace.api.medicalstaff.repository.QMedicalStaffRepository;
import com.springboot.caretrace.api.medicalstaff.vo.LoginVO;
import com.springboot.caretrace.common.CommonResponse;
import com.springboot.caretrace.config.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
public class MedicalStaffAuthServiceImpl
        implements MedicalStaffAuthService {

    private final QMedicalStaffRepository qMedicalStaffRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public SignInResultDto login(
            LoginVO vo
    ) {
        if (vo == null
                || vo.getLoginId() == null
                || vo.getLoginId().isBlank()
                || vo.getPassword() == null
                || vo.getPassword().isBlank()) {
            return loginFail();
        }

        Optional<MedicalStaff> optionalMedicalStaff =
                qMedicalStaffRepository.findByLoginId(vo.getLoginId());

        if (optionalMedicalStaff.isEmpty()) {
            return loginFail();
        }

        MedicalStaff medicalStaff = optionalMedicalStaff.get();

        if (!medicalStaff.isEnabled()) {
            return loginFail();
        }

        if (!passwordEncoder.matches(
                vo.getPassword(),
                medicalStaff.getPassword()
        )) {
            return loginFail();
        }

        List<String> roles = medicalStaff.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        String token = jwtTokenProvider.createToken(
                medicalStaff.getStaffNo(),
                medicalStaff.getLoginId(),
                medicalStaff.getStaffName(),
                roles
        );

        log.info("의료진 로그인 성공: {}", medicalStaff.getLoginId());

        return SignInResultDto.builder()
                .success(true)
                .code(CommonResponse.SUCCESS.getCode())
                .msg(CommonResponse.SUCCESS.getMsg())
                .token(token)
                .build();
    }

    private SignInResultDto loginFail() {
        return SignInResultDto.builder()
                .success(false)
                .code(CommonResponse.FAIL.getCode())
                .msg("아이디 또는 비밀번호를 확인해 주세요.")
                .token(null)
                .build();
    }
}
