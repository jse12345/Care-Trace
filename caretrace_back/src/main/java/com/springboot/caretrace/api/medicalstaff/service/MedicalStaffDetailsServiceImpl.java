package com.springboot.caretrace.api.medicalstaff.service;

import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaffDetails;
import com.springboot.caretrace.api.medicalstaff.repository.QMedicalStaffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Log4j2
public class MedicalStaffDetailsServiceImpl
        implements MedicalStaffDetailsService {

    private final QMedicalStaffRepository qMedicalStaffRepository;

    @Override
    public MedicalStaffDetails loadMedicalStaffByLoginId(String loginId)
            throws UsernameNotFoundException {

        MedicalStaff medicalStaff = qMedicalStaffRepository
                .findByLoginId(loginId)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "의료진 계정을 찾을 수 없습니다: " + loginId
                ));

        if (!medicalStaff.isEnabled()) {
            throw new UsernameNotFoundException(
                    "비활성화되었거나 삭제된 의료진 계정입니다: " + loginId
            );
        }

        log.info("의료진 인증 정보 조회 완료: {}", loginId);

        return medicalStaff;
    }
}
