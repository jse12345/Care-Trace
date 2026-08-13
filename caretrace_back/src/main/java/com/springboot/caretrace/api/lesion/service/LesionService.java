package com.springboot.caretrace.api.lesion.service;

import com.springboot.caretrace.api.lesion.entity.LesionType;
import com.springboot.caretrace.api.lesion.vo.LesionVO;
import com.springboot.caretrace.page.PageObject;

import java.util.List;

public interface LesionService {

    List<LesionVO> list(
            PageObject pageObject,
            Long caseId,
            LesionType lesionType
    );

    LesionVO view(Long lesionId);

    LesionVO write(LesionVO vo, Long createdBy);

    Long update(LesionVO vo);

    Long delete(Long lesionId);
}
