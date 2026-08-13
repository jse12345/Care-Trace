package com.springboot.caretrace.ImageCompareSet.service;

import com.springboot.caretrace.ImageCompareSet.entity.ImageCompareSet;
import com.springboot.caretrace.ImageCompareSet.repository.ImageCompareSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ImageCompareSetService {

    private final ImageCompareSetRepository imageCompareSetRepository;

    @Transactional
    public ImageCompareSet createImageCompareSet(ImageCompareSet imageCompareSet) {
        return imageCompareSetRepository.save(imageCompareSet);
    }

    public List<ImageCompareSet> getCompareSetsByPatient(Long patientId) {
        if (patientId != null) {
            return imageCompareSetRepository.findByPatientId(patientId);
        }
        return imageCompareSetRepository.findAll();
    }

    public ImageCompareSet getCompareSetById(Long id) {
        return imageCompareSetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 비교 세트가 존재하지 않습니다. id=" + id));
    }

    @Transactional
    public ImageCompareSet updateImageCompareSet(Long id, ImageCompareSet updatedInfo) {
        ImageCompareSet existingSet = getCompareSetById(id);

        existingSet.setPastImageUrl(updatedInfo.getPastImageUrl());
        existingSet.setCurrentImageUrl(updatedInfo.getCurrentImageUrl());
        existingSet.setTitle(updatedInfo.getTitle());
        existingSet.setDescription(updatedInfo.getDescription());

        return existingSet;
    }

    @Transactional
    public void deleteImageCompareSet(Long id) {
        ImageCompareSet existingSet = getCompareSetById(id);
        imageCompareSetRepository.delete(existingSet);
    }
}