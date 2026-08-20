package com.springboot.caretrace.api.lesion.repository;

import com.springboot.caretrace.api.lesion.entity.Lesion;
import com.springboot.caretrace.api.lesion.entity.LesionType;
import com.springboot.caretrace.api.lesion.vo.LesionVO;
import com.springboot.caretrace.page.PageObject;

import java.util.List;

public interface LesionRepositoryCustom {

    List<LesionVO> getList(
            PageObject pageObject,
            Long caseId,
            LesionType lesionType
    );

    Long getCount(
            PageObject pageObject,
            Long caseId,
            LesionType lesionType
    );

    Lesion getLesion(Long lesionId);

    Lesion writeLesion(Lesion lesion);

    Lesion updateLesion(Lesion lesion);
}
