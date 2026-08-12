package com.springboot.caretrace.api.department.service;

import com.springboot.caretrace.api.department.entity.Department;
import com.springboot.caretrace.api.department.entity.DepartmentStatus;
import com.springboot.caretrace.api.department.repository.DepartmentRepositoryCustom;
import com.springboot.caretrace.api.department.repository.QDepartmentRepository;
import com.springboot.caretrace.api.department.vo.DepartmentVO;
import com.springboot.caretrace.api.medicalstaff.repository.QMedicalStaffRepository;
import com.springboot.caretrace.page.PageObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional(readOnly = true)
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepositoryCustom departmentRepositoryCustom;
    private final QDepartmentRepository qDepartmentRepository;
    private final QMedicalStaffRepository qMedicalStaffRepository;

    @Override
    public List<DepartmentVO> list(
            PageObject pageObject,
            DepartmentStatus status
    ) {
        pageObject.setTotalRow(
                departmentRepositoryCustom.getCount(pageObject, status)
        );

        return departmentRepositoryCustom
                .getList(pageObject, status)
                .stream()
                .map(this::departmentToDepartmentVO)
                .toList();
    }

    @Override
    public DepartmentVO view(Long departmentNo) {
        return departmentToDepartmentVO(
                findActiveDepartment(departmentNo)
        );
    }

    @Override
    @Transactional
    public DepartmentVO write(DepartmentVO vo) {
        String departmentCode = required(vo.getDepartmentCode());
        String departmentName = required(vo.getDepartmentName());

        if (qDepartmentRepository.existsByDepartmentCode(departmentCode)) {
            throw conflict("이미 사용 중인 진료과 코드입니다.");
        }
        if (qDepartmentRepository.existsByDepartmentName(departmentName)) {
            throw conflict("이미 등록된 진료과명입니다.");
        }

        Department department = Department.builder()
                .departmentCode(departmentCode)
                .departmentName(departmentName)
                .description(optional(vo.getDescription()))
                .status(
                        vo.getStatus() == null
                                ? DepartmentStatus.ACTIVE
                                : vo.getStatus()
                )
                .isDeleted("N")
                .build();

        return departmentToDepartmentVO(
                departmentRepositoryCustom.writeDepartment(department)
        );
    }

    @Override
    @Transactional
    public Long update(DepartmentVO vo) {
        Department department = findActiveDepartment(vo.getDepartmentNo());
        String departmentCode = required(vo.getDepartmentCode());
        String departmentName = required(vo.getDepartmentName());

        if (qDepartmentRepository
                .existsByDepartmentCodeAndDepartmentNoNot(
                        departmentCode,
                        department.getDepartmentNo()
                )) {
            throw conflict("이미 사용 중인 진료과 코드입니다.");
        }
        if (qDepartmentRepository
                .existsByDepartmentNameAndDepartmentNoNot(
                        departmentName,
                        department.getDepartmentNo()
                )) {
            throw conflict("이미 등록된 진료과명입니다.");
        }

        department.update(
                departmentCode,
                departmentName,
                optional(vo.getDescription()),
                vo.getStatus() == null
                        ? department.getStatus()
                        : vo.getStatus()
        );
        departmentRepositoryCustom.updateDepartment(department);
        return 1L;
    }

    @Override
    @Transactional
    public Long delete(Long departmentNo) {
        Department department = findActiveDepartment(departmentNo);

        if (qMedicalStaffRepository
                .existsByDepartment_DepartmentNoAndIsDeleted(
                        departmentNo,
                        "N"
                )) {
            throw conflict("소속 의료진이 있는 진료과는 삭제할 수 없습니다.");
        }

        department.softDelete();
        departmentRepositoryCustom.updateDepartment(department);
        return 1L;
    }

    private Department findActiveDepartment(Long departmentNo) {
        if (departmentNo == null) {
            throw notFound("진료과를 찾을 수 없습니다.");
        }

        Department department =
                departmentRepositoryCustom.getDepartment(departmentNo);

        if (department == null) {
            throw notFound("진료과를 찾을 수 없습니다.");
        }
        return department;
    }

    private DepartmentVO departmentToDepartmentVO(Department department) {
        return DepartmentVO.builder()
                .departmentNo(department.getDepartmentNo())
                .departmentCode(department.getDepartmentCode())
                .departmentName(department.getDepartmentName())
                .description(department.getDescription())
                .status(department.getStatus())
                .regDate(department.getRegDate())
                .updateDate(department.getUpdateDate())
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
