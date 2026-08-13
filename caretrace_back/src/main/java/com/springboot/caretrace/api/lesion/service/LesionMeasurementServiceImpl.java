package com.springboot.caretrace.api.lesion.service;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.springboot.caretrace.api.lesion.entity.Lesion;
import com.springboot.caretrace.api.lesion.entity.LesionMeasurement;
import com.springboot.caretrace.api.lesion.entity.RoiType;
import com.springboot.caretrace.api.lesion.repository.LesionMeasurementRepositoryCustom;
import com.springboot.caretrace.api.lesion.repository.LesionRepositoryCustom;
import com.springboot.caretrace.api.lesion.repository.QLesionMeasurementRepository;
import com.springboot.caretrace.api.lesion.vo.LesionMeasurementTrendVO;
import com.springboot.caretrace.api.lesion.vo.LesionMeasurementVO;
import com.springboot.caretrace.api.lesion.vo.RoiPointVO;
import com.springboot.caretrace.page.PageObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional(readOnly = true)
public class LesionMeasurementServiceImpl implements LesionMeasurementService {

    private static final Type ROI_POINTS_TYPE =
            new TypeToken<List<RoiPointVO>>() {}.getType();

    private final LesionMeasurementRepositoryCustom repositoryCustom;
    private final QLesionMeasurementRepository qLesionMeasurementRepository;
    private final LesionRepositoryCustom lesionRepositoryCustom;
    private final Gson gson = new Gson();

    @Override
    public List<LesionMeasurementVO> list(
            PageObject pageObject,
            Long lesionId,
            Long examinationId
    ) {
        pageObject.setTotalRow(
                repositoryCustom.getCount(pageObject, lesionId, examinationId)
        );

        return repositoryCustom
                .getList(pageObject, lesionId, examinationId)
                .stream()
                .map(this::measurementToVO)
                .toList();
    }

    @Override
    public LesionMeasurementVO view(Long measurementId) {
        return measurementToVO(findActiveMeasurement(measurementId));
    }

    @Override
    @Transactional
    public LesionMeasurementVO write(LesionMeasurementVO vo, Long measuredBy) {
        Lesion lesion = findActiveLesion(vo.getLesionId());
        Long examinationId = requiredLong(vo.getExaminationId());
        RoiType roiType = requiredRoiType(vo.getRoiType());
        List<RoiPointVO> points = requiredPoints(roiType, vo.getRoiPoints());

        if (qLesionMeasurementRepository
                .existsByLesion_LesionIdAndExaminationIdAndIsDeleted(
                        lesion.getLesionId(), examinationId, "N"
                )) {
            throw conflict("해당 검사에 대한 측정값이 이미 등록되어 있습니다.");
        }

        RoiCalculator.Result result = RoiCalculator.calculate(
                roiType, points, vo.getPixelSpacingX(), vo.getPixelSpacingY()
        );

        LesionMeasurement measurement = LesionMeasurement.builder()
                .lesion(lesion)
                .examinationId(examinationId)
                .measuredBy(measuredBy)
                .studyInstanceUid(optional(vo.getStudyInstanceUid()))
                .seriesInstanceUid(optional(vo.getSeriesInstanceUid()))
                .sopInstanceUid(optional(vo.getSopInstanceUid()))
                .instanceNumber(vo.getInstanceNumber())
                .frameNumber(vo.getFrameNumber() == null ? 1 : vo.getFrameNumber())
                .roiType(roiType)
                .roiPoints(gson.toJson(points))
                .pixelSpacingX(vo.getPixelSpacingX())
                .pixelSpacingY(vo.getPixelSpacingY())
                .sliceThickness(vo.getSliceThickness())
                .longAxisMm(result.longAxisMm())
                .shortAxisMm(result.shortAxisMm())
                .areaMm2(result.areaMm2())
                .windowCenter(vo.getWindowCenter())
                .windowWidth(vo.getWindowWidth())
                .memo(optional(vo.getMemo()))
                .measuredAt(vo.getMeasuredAt() == null ? LocalDateTime.now() : vo.getMeasuredAt())
                .isDeleted("N")
                .build();

        return measurementToVO(repositoryCustom.saveMeasurement(measurement));
    }

    @Override
    @Transactional
    public Long update(LesionMeasurementVO vo) {
        LesionMeasurement measurement = findActiveMeasurement(vo.getMeasurementId());
        RoiType roiType = requiredRoiType(vo.getRoiType());
        List<RoiPointVO> points = requiredPoints(roiType, vo.getRoiPoints());

        RoiCalculator.Result result = RoiCalculator.calculate(
                roiType, points, vo.getPixelSpacingX(), vo.getPixelSpacingY()
        );

        measurement.update(
                optional(vo.getStudyInstanceUid()),
                optional(vo.getSeriesInstanceUid()),
                optional(vo.getSopInstanceUid()),
                vo.getInstanceNumber(),
                vo.getFrameNumber() == null ? measurement.getFrameNumber() : vo.getFrameNumber(),
                roiType,
                gson.toJson(points),
                vo.getPixelSpacingX(),
                vo.getPixelSpacingY(),
                vo.getSliceThickness(),
                result.longAxisMm(),
                result.shortAxisMm(),
                result.areaMm2(),
                vo.getWindowCenter(),
                vo.getWindowWidth(),
                optional(vo.getMemo()),
                vo.getMeasuredAt() == null ? measurement.getMeasuredAt() : vo.getMeasuredAt()
        );

        repositoryCustom.saveMeasurement(measurement);
        return 1L;
    }

    @Override
    @Transactional
    public Long delete(Long measurementId) {
        LesionMeasurement measurement = findActiveMeasurement(measurementId);
        measurement.softDelete();
        repositoryCustom.saveMeasurement(measurement);
        return 1L;
    }

    @Override
    public Map<String, Object> trend(Long lesionId) {
        Lesion lesion = findActiveLesion(lesionId);
        List<LesionMeasurement> measurements = repositoryCustom.getTrendList(lesionId);

        // 요구사항: 림프절이면 단축(shortAxisMm), 아니면 장축(longAxisMm) 기준으로 추세를 계산한다.
        boolean useShortAxis = Boolean.TRUE.equals(lesion.getIsLymphNode());
        String metric = useShortAxis ? "SHORT_AXIS" : "LONG_AXIS";

        BigDecimal baselineValue = null;
        List<LesionMeasurementTrendVO> list = new java.util.ArrayList<>();

        for (int i = 0; i < measurements.size(); i++) {
            LesionMeasurement measurement = measurements.get(i);
            BigDecimal value = useShortAxis
                    ? measurement.getShortAxisMm()
                    : measurement.getLongAxisMm();

            if (i == 0) {
                baselineValue = value;
            }

            BigDecimal changeRatePercent = null;
            if (value != null && baselineValue != null
                    && baselineValue.compareTo(BigDecimal.ZERO) != 0) {
                changeRatePercent = value.subtract(baselineValue)
                        .divide(baselineValue, 6, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP);
            }

            list.add(LesionMeasurementTrendVO.builder()
                    .measurementId(measurement.getMeasurementId())
                    .examinationId(measurement.getExaminationId())
                    .measuredAt(measurement.getMeasuredAt())
                    .longAxisMm(measurement.getLongAxisMm())
                    .shortAxisMm(measurement.getShortAxisMm())
                    .areaMm2(measurement.getAreaMm2())
                    .trendValueMm(value)
                    .changeRatePercent(changeRatePercent)
                    .baseline(i == 0)
                    .build());
        }

        Map<String, Object> map = new HashMap<>();
        map.put("list", list);
        map.put("metric", metric);
        return map;
    }

    private Lesion findActiveLesion(Long lesionId) {
        if (lesionId == null) {
            throw notFound("병변을 찾을 수 없습니다.");
        }

        Lesion lesion = lesionRepositoryCustom.getLesion(lesionId);

        if (lesion == null) {
            throw notFound("병변을 찾을 수 없습니다.");
        }
        return lesion;
    }

    private LesionMeasurement findActiveMeasurement(Long measurementId) {
        if (measurementId == null) {
            throw notFound("측정값을 찾을 수 없습니다.");
        }

        LesionMeasurement measurement = repositoryCustom.getMeasurement(measurementId);

        if (measurement == null) {
            throw notFound("측정값을 찾을 수 없습니다.");
        }
        return measurement;
    }

    private LesionMeasurementVO measurementToVO(LesionMeasurement measurement) {
        return LesionMeasurementVO.builder()
                .measurementId(measurement.getMeasurementId())
                .lesionId(measurement.getLesion().getLesionId())
                .examinationId(measurement.getExaminationId())
                .measuredBy(measurement.getMeasuredBy())
                .studyInstanceUid(measurement.getStudyInstanceUid())
                .seriesInstanceUid(measurement.getSeriesInstanceUid())
                .sopInstanceUid(measurement.getSopInstanceUid())
                .instanceNumber(measurement.getInstanceNumber())
                .frameNumber(measurement.getFrameNumber())
                .roiType(measurement.getRoiType())
                .roiPoints(gson.fromJson(measurement.getRoiPoints(), ROI_POINTS_TYPE))
                .pixelSpacingX(measurement.getPixelSpacingX())
                .pixelSpacingY(measurement.getPixelSpacingY())
                .sliceThickness(measurement.getSliceThickness())
                .longAxisMm(measurement.getLongAxisMm())
                .shortAxisMm(measurement.getShortAxisMm())
                .areaMm2(measurement.getAreaMm2())
                .windowCenter(measurement.getWindowCenter())
                .windowWidth(measurement.getWindowWidth())
                .memo(measurement.getMemo())
                .measuredAt(measurement.getMeasuredAt())
                .regDate(measurement.getRegDate())
                .updateDate(measurement.getUpdateDate())
                .build();
    }

    private RoiType requiredRoiType(RoiType roiType) {
        if (roiType == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "ROI 유형을 확인해 주세요."
            );
        }
        return roiType;
    }

    // 함정#8: RECTANGLE/ELLIPSE는 정확히 4점이 아니라 대각선 2점(bounding box)으로 처리
    private List<RoiPointVO> requiredPoints(RoiType roiType, List<RoiPointVO> points) {
        int minPoints = switch (roiType) {
            case POINT -> 1;
            case LENGTH, RECTANGLE, ELLIPSE -> 2;
            case POLYGON -> 3;
        };

        if (points == null || points.size() < minPoints) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "ROI 좌표가 부족합니다. 최소 " + minPoints + "개의 점이 필요합니다."
            );
        }
        return points;
    }

    private Long requiredLong(Long value) {
        if (value == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "필수 입력값을 확인해 주세요."
            );
        }
        return value;
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
