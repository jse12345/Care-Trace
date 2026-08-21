package com.springboot.caretrace.ImageCompareSet.service;

import com.springboot.caretrace.ImageCompareSet.entity.ImageCompareSet;
import com.springboot.caretrace.ImageCompareSet.repository.ImageCompareSetRepository;
import com.springboot.caretrace.ImageCompareSet.vo.ImageCompareSetVO;
import com.springboot.caretrace.api.medicalstaff.entity.MedicalStaff;
import com.springboot.caretrace.api.medicalstaff.repository.QMedicalStaffRepository;
import com.springboot.caretrace.api.patient.entity.Patient;
import com.springboot.caretrace.api.patient.repository.QPatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ImageCompareSetService {

    private final ImageCompareSetRepository imageCompareSetRepository;
    private final QPatientRepository patientRepository;
    private final QMedicalStaffRepository medicalStaffRepository;

    @Transactional
    public ImageCompareSetVO createImageCompareSet(ImageCompareSetVO vo) {
        Patient patient = patientRepository.findById(vo.getPatientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "환자를 찾을 수 없습니다."));

        MedicalStaff doctor = vo.getDoctorId() != null
                ? medicalStaffRepository.findById(vo.getDoctorId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "담당 의료진을 찾을 수 없습니다."))
                : null;

        ImageCompareSet imageCompareSet = ImageCompareSet.builder()
                .patient(patient)
                .doctor(doctor)
                .pastImageUrl(vo.getPastImageUrl())
                .currentImageUrl(vo.getCurrentImageUrl())
                .title(vo.getTitle())
                .description(vo.getDescription())
                .build();

        return toVO(imageCompareSetRepository.save(imageCompareSet));
    }

    public List<ImageCompareSetVO> getCompareSetsByPatient(Long patientId) {
        List<ImageCompareSet> list = patientId != null
                ? imageCompareSetRepository.findByPatient_PatientId(patientId)
                : imageCompareSetRepository.findAll();

        return list.stream().map(this::toVO).toList();
    }

    public ImageCompareSetVO getCompareSetById(Long id) {
        return toVO(findEntityById(id));
    }

    @Transactional
    public ImageCompareSetVO updateImageCompareSet(Long id, ImageCompareSetVO vo) {
        ImageCompareSet existingSet = findEntityById(id);

        if (vo.getPatientId() != null) {
            existingSet.setPatient(
                    patientRepository.findById(vo.getPatientId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "환자를 찾을 수 없습니다."))
            );
        }

        if (vo.getDoctorId() != null) {
            existingSet.setDoctor(
                    medicalStaffRepository.findById(vo.getDoctorId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "담당 의료진을 찾을 수 없습니다."))
            );
        }

        existingSet.setPastImageUrl(vo.getPastImageUrl());
        existingSet.setCurrentImageUrl(vo.getCurrentImageUrl());
        existingSet.setTitle(vo.getTitle());
        existingSet.setDescription(vo.getDescription());

        return toVO(existingSet);
    }

    @Transactional
    public void deleteImageCompareSet(Long id) {
        ImageCompareSet existingSet = findEntityById(id);
        imageCompareSetRepository.delete(existingSet);
    }

    private ImageCompareSet findEntityById(Long id) {
        return imageCompareSetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 비교 세트가 존재하지 않습니다. id=" + id));
    }

    private ImageCompareSetVO toVO(ImageCompareSet entity) {
        return ImageCompareSetVO.builder()
                .id(entity.getId())
                .patientId(entity.getPatient().getPatientId())
                .doctorId(entity.getDoctor() != null ? entity.getDoctor().getStaffNo() : null)
                .pastImageUrl(entity.getPastImageUrl())
                .currentImageUrl(entity.getCurrentImageUrl())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .regDate(entity.getRegDate())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
