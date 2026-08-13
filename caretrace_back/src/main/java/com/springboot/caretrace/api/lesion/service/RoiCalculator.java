package com.springboot.caretrace.api.lesion.service;

import com.springboot.caretrace.api.lesion.entity.RoiType;
import com.springboot.caretrace.api.lesion.vo.RoiPointVO;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * ROI 좌표(픽셀)를 PixelSpacing(mm/px)으로 환산해 장축·단축·면적을 계산하는 순수 정적 유틸.
 * pixelSpacing이 없으면(DICOM 태그 부재) 계산하지 않고 전부 null을 반환한다.
 */
public class RoiCalculator {

    private RoiCalculator() {
    }

    public record Result(
            BigDecimal longAxisMm,
            BigDecimal shortAxisMm,
            BigDecimal areaMm2
    ) {
        static final Result EMPTY = new Result(null, null, null);
    }

    public static Result calculate(
            RoiType roiType,
            List<RoiPointVO> points,
            BigDecimal pixelSpacingX,
            BigDecimal pixelSpacingY
    ) {
        if (pixelSpacingX == null || pixelSpacingY == null
                || points == null || points.isEmpty()) {
            return Result.EMPTY;
        }

        double psX = pixelSpacingX.doubleValue();
        double psY = pixelSpacingY.doubleValue();

        return switch (roiType) {
            case LENGTH -> calculateLength(points, psX, psY);
            case RECTANGLE -> calculateBoundingBox(points, psX, psY, false);
            case ELLIPSE -> calculateBoundingBox(points, psX, psY, true);
            case POLYGON -> calculatePolygon(points, psX, psY);
            case POINT -> Result.EMPTY;
        };
    }

    private static Result calculateLength(
            List<RoiPointVO> points,
            double psX,
            double psY
    ) {
        if (points.size() < 2) {
            return Result.EMPTY;
        }

        RoiPointVO p1 = points.get(0);
        RoiPointVO p2 = points.get(1);

        double dxMm = (p2.getX() - p1.getX()) * psX;
        double dyMm = (p2.getY() - p1.getY()) * psY;
        double distanceMm = Math.sqrt(dxMm * dxMm + dyMm * dyMm);

        return new Result(round(distanceMm), null, null);
    }

    private static Result calculateBoundingBox(
            List<RoiPointVO> points,
            double psX,
            double psY,
            boolean ellipse
    ) {
        double minX = points.stream().mapToDouble(RoiPointVO::getX).min().orElse(0);
        double maxX = points.stream().mapToDouble(RoiPointVO::getX).max().orElse(0);
        double minY = points.stream().mapToDouble(RoiPointVO::getY).min().orElse(0);
        double maxY = points.stream().mapToDouble(RoiPointVO::getY).max().orElse(0);

        double widthMm = (maxX - minX) * psX;
        double heightMm = (maxY - minY) * psY;

        double longAxisMm = Math.max(widthMm, heightMm);
        double shortAxisMm = Math.min(widthMm, heightMm);

        double areaMm2 = ellipse
                ? Math.PI * (widthMm / 2) * (heightMm / 2)
                : widthMm * heightMm;

        return new Result(round(longAxisMm), round(shortAxisMm), round(areaMm2));
    }

    private static Result calculatePolygon(
            List<RoiPointVO> points,
            double psX,
            double psY
    ) {
        if (points.size() < 3) {
            return Result.EMPTY;
        }

        double area = 0;
        int n = points.size();

        for (int i = 0; i < n; i++) {
            double x1Mm = points.get(i).getX() * psX;
            double y1Mm = points.get(i).getY() * psY;
            double x2Mm = points.get((i + 1) % n).getX() * psX;
            double y2Mm = points.get((i + 1) % n).getY() * psY;

            area += x1Mm * y2Mm - x2Mm * y1Mm;
        }

        double areaMm2 = Math.abs(area) / 2;

        return new Result(null, null, round(areaMm2));
    }

    private static BigDecimal round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }
}
