package com.springboot.caretrace.api.medicalstaff.service;

import com.springboot.caretrace.api.department.entity.Department;
import com.springboot.caretrace.api.department.entity.DepartmentStatus;
import com.springboot.caretrace.api.department.repository.QDepartmentRepository;
import com.springboot.caretrace.api.medicalstaff.entity.AccountStatus;
import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import com.springboot.caretrace.api.medicalstaff.entity.StaffRole;
import com.springboot.caretrace.api.medicalstaff.repository.MedicalStaffRepositoryCustom;
import com.springboot.caretrace.api.medicalstaff.repository.QMedicalStaffRepository;
import com.springboot.caretrace.api.medicalstaff.vo.MedicalStaffVO;
import com.springboot.caretrace.page.PageObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional(readOnly = true)
public class MedicalStaffServiceImpl implements MedicalStaffService {

    private final MedicalStaffRepositoryCustom medicalStaffRepositoryCustom;
    private final QMedicalStaffRepository qMedicalStaffRepository;
    private final QDepartmentRepository qDepartmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<MedicalStaffVO> list(
            PageObject pageObject,
            Long departmentNo,
            StaffRole role,
            AccountStatus status
    ) {
        pageObject.setTotalRow(
                medicalStaffRepositoryCustom.getCount(
                        pageObject,
                        departmentNo,
                        role,
                        status
                )
        );

        return medicalStaffRepositoryCustom
                .getList(pageObject, departmentNo, role, status)
                .stream()
                .map(this::medicalStaffToMedicalStaffVO)
                .toList();
    }

    @Override
    public MedicalStaffVO view(Long staffNo) {
        return medicalStaffToMedicalStaffVO(
                findActiveMedicalStaff(staffNo)
        );
    }

    @Override
    @Transactional
    public MedicalStaffVO write(MedicalStaffVO vo) {
        String employeeNo = required(vo.getEmployeeNo());
        String loginId = required(vo.getLoginId());
        String email = required(vo.getEmail());
        String licenseNo = optional(vo.getLicenseNo());

        validateCreateDuplicates(
                employeeNo,
                loginId,
                email,
                licenseNo
        );

        Department department = findActiveDepartment(vo.getDepartmentNo());

        MedicalStaff medicalStaff = MedicalStaff.builder()
                .employeeNo(employeeNo)
                .loginId(loginId)
                .password(passwordEncoder.encode(required(vo.getPassword())))
                .staffName(required(vo.getStaffName()))
                .department(department)
                .jobTitle(required(vo.getJobTitle()))
                .licenseNo(licenseNo)
                .email(email)
                .phone(optional(vo.getPhone()))
                .role(
                        vo.getRole() == null
                                ? StaffRole.MEDICAL_STAFF
                                : vo.getRole()
                )
                .accountStatus(AccountStatus.ACTIVE)
                .isDeleted("N")
                .build();

        return medicalStaffToMedicalStaffVO(
                medicalStaffRepositoryCustom.writeMedicalStaff(medicalStaff)
        );
    }

    @Override
    @Transactional
    public Long update(MedicalStaffVO vo) {
        MedicalStaff medicalStaff = findActiveMedicalStaff(vo.getStaffNo());
        Department department = findActiveDepartment(vo.getDepartmentNo());
        String email = required(vo.getEmail());
        String licenseNo = optional(vo.getLicenseNo());

        if (qMedicalStaffRepository.existsByEmailAndStaffNoNot(
                email,
                medicalStaff.getStaffNo()
        )) {
            throw conflict("이미 사용 중인 이메일입니다.");
        }

        if (licenseNo != null
                && qMedicalStaffRepository
                .existsByLicenseNoAndStaffNoNot(
                        licenseNo,
                        medicalStaff.getStaffNo()
                )) {
            throw conflict("이미 등록된 면허번호입니다.");
        }

        medicalStaff.updateInformation(
                required(vo.getStaffName()),
                department,
                required(vo.getJobTitle()),
                licenseNo,
                email,
                optional(vo.getPhone())
        );

        medicalStaffRepositoryCustom.updateMedicalStaff(medicalStaff);
        return 1L;
    }

    @Override
    @Transactional
    public Long updateRoleStatus(MedicalStaffVO vo) {
        MedicalStaff medicalStaff = findActiveMedicalStaff(vo.getStaffNo());

        if (vo.getRole() == null || vo.getAccountStatus() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "권한과 계정 상태를 확인해 주세요."
            );
        }

        medicalStaff.changeRoleAndStatus(
                vo.getRole(),
                vo.getAccountStatus()
        );
        medicalStaffRepositoryCustom.updateMedicalStaff(medicalStaff);
        return 1L;
    }

    @Override
    @Transactional
    public Long delete(Long staffNo) {
        MedicalStaff medicalStaff = findActiveMedicalStaff(staffNo);
        medicalStaff.softDelete();
        medicalStaffRepositoryCustom.updateMedicalStaff(medicalStaff);
        return 1L;
    }

    private MedicalStaff findActiveMedicalStaff(Long staffNo) {
        if (staffNo == null) {
            throw notFound("의료진 정보를 찾을 수 없습니다.");
        }

        MedicalStaff medicalStaff =
                medicalStaffRepositoryCustom.getMedicalStaff(staffNo);

        if (medicalStaff == null) {
            throw notFound("의료진 정보를 찾을 수 없습니다.");
        }
        return medicalStaff;
    }

    private Department findActiveDepartment(Long departmentNo) {
        if (departmentNo == null) {
            throw notFound("진료과를 찾을 수 없습니다.");
        }

        Department department = qDepartmentRepository
                .findByDepartmentNoAndIsDeleted(departmentNo, "N")
                .orElseThrow(() -> notFound("진료과를 찾을 수 없습니다."));

        if (department.getStatus() != DepartmentStatus.ACTIVE) {
            throw conflict("비활성 진료과에는 의료진을 배정할 수 없습니다.");
        }
        return department;
    }

    private void validateCreateDuplicates(
            String employeeNo,
            String loginId,
            String email,
            String licenseNo
    ) {
        if (qMedicalStaffRepository.existsByEmployeeNo(employeeNo)) {
            throw conflict("이미 등록된 사번입니다.");
        }
        if (qMedicalStaffRepository.existsByLoginId(loginId)) {
            throw conflict("이미 사용 중인 로그인 아이디입니다.");
        }
        if (qMedicalStaffRepository.existsByEmail(email)) {
            throw conflict("이미 사용 중인 이메일입니다.");
        }
        if (licenseNo != null
                && qMedicalStaffRepository.existsByLicenseNo(licenseNo)) {
            throw conflict("이미 등록된 면허번호입니다.");
        }
    }

    private MedicalStaffVO medicalStaffToMedicalStaffVO(
            MedicalStaff medicalStaff
    ) {
        Department department = medicalStaff.getDepartment();

        return MedicalStaffVO.builder()
                .staffNo(medicalStaff.getStaffNo())
                .employeeNo(medicalStaff.getEmployeeNo())
                .loginId(medicalStaff.getLoginId())
                .staffName(medicalStaff.getStaffName())
                .departmentNo(department.getDepartmentNo())
                .departmentCode(department.getDepartmentCode())
                .departmentName(department.getDepartmentName())
                .jobTitle(medicalStaff.getJobTitle())
                .licenseNo(medicalStaff.getLicenseNo())
                .email(medicalStaff.getEmail())
                .phone(medicalStaff.getPhone())
                .role(medicalStaff.getRole())
                .accountStatus(medicalStaff.getAccountStatus())
                .regDate(medicalStaff.getRegDate())
                .updateDate(medicalStaff.getUpdateDate())
                .build();
    }

    private String required(String value) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "필수 입력값을 확인해 주세요."
            );
        }
        return value.trim();
    }

    private String optional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}
