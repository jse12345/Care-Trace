package com.springboot.caretrace.api.lesion.service;

import com.springboot.caretrace.api.lesion.entity.RoiType;
import com.springboot.caretrace.api.lesion.vo.RoiPointVO;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * ROI 좌표(픽셀)를 PixelSpacing(mm/px)으로 환산해 장축·단축·면적을 계산하는 순수 정적 유틸.
 * pixelSpacing이 없으면(DICOM 태그 부재) mm 값은 계산하지 않고, 대신 픽셀(px) 단위 값을 채운다.
 */
public class RoiCalculator {

    private RoiCalculator() {
    }

    public record Result(
            BigDecimal longAxisMm,
            BigDecimal shortAxisMm,
            BigDecimal areaMm2,
            BigDecimal longAxisPx,
            BigDecimal shortAxisPx,
            BigDecimal areaPx2
    ) {
        static final Result EMPTY = new Result(null, null, null, null, null, null);
    }

    public static Result calculate(
            RoiType roiType,
            List<RoiPointVO> points,
            BigDecimal pixelSpacingX,
            BigDecimal pixelSpacingY
    ) {
        if (points == null || points.isEmpty()) {
            return Result.EMPTY;
        }

        Axes pxAxes = calculateAxes(roiType, points, 1.0, 1.0);

        if (pixelSpacingX == null || pixelSpacingY == null) {
            return new Result(null, null, null, pxAxes.longAxis(), pxAxes.shortAxis(), pxAxes.area());
        }

        Axes mmAxes = calculateAxes(roiType, points, pixelSpacingX.doubleValue(), pixelSpacingY.doubleValue());

        return new Result(
                mmAxes.longAxis(), mmAxes.shortAxis(), mmAxes.area(),
                pxAxes.longAxis(), pxAxes.shortAxis(), pxAxes.area()
        );
    }

    private record Axes(BigDecimal longAxis, BigDecimal shortAxis, BigDecimal area) {
        static final Axes EMPTY = new Axes(null, null, null);
    }

    private static Axes calculateAxes(
            RoiType roiType,
            List<RoiPointVO> points,
            double psX,
            double psY
    ) {
        return switch (roiType) {
            case LENGTH -> calculateLength(points, psX, psY);
            case RECTANGLE -> calculateBoundingBox(points, psX, psY, false);
            case ELLIPSE -> calculateBoundingBox(points, psX, psY, true);
            case POLYGON -> calculatePolygon(points, psX, psY);
            case POINT -> Axes.EMPTY;
        };
    }

    private static Axes calculateLength(
            List<RoiPointVO> points,
            double psX,
            double psY
    ) {
        if (points.size() < 2) {
            return Axes.EMPTY;
        }

        RoiPointVO p1 = points.get(0);
        RoiPointVO p2 = points.get(1);

        double dx = (p2.getX() - p1.getX()) * psX;
        double dy = (p2.getY() - p1.getY()) * psY;
        double distance = Math.sqrt(dx * dx + dy * dy);

        return new Axes(round(distance), null, null);
    }

    private static Axes calculateBoundingBox(
            List<RoiPointVO> points,
            double psX,
            double psY,
            boolean ellipse
    ) {
        double minX = points.stream().mapToDouble(RoiPointVO::getX).min().orElse(0);
        double maxX = points.stream().mapToDouble(RoiPointVO::getX).max().orElse(0);
        double minY = points.stream().mapToDouble(RoiPointVO::getY).min().orElse(0);
        double maxY = points.stream().mapToDouble(RoiPointVO::getY).max().orElse(0);

        double width = (maxX - minX) * psX;
        double height = (maxY - minY) * psY;

        double longAxis = Math.max(width, height);
        double shortAxis = Math.min(width, height);

        double area = ellipse
                ? Math.PI * (width / 2) * (height / 2)
                : width * height;

        return new Axes(round(longAxis), round(shortAxis), round(area));
    }

    private static Axes calculatePolygon(
            List<RoiPointVO> points,
            double psX,
            double psY
    ) {
        if (points.size() < 3) {
            return Axes.EMPTY;
        }

        double area = 0;
        int n = points.size();

        for (int i = 0; i < n; i++) {
            double x1 = points.get(i).getX() * psX;
            double y1 = points.get(i).getY() * psY;
            double x2 = points.get((i + 1) % n).getX() * psX;
            double y2 = points.get((i + 1) % n).getY() * psY;

            area += x1 * y2 - x2 * y1;
        }

        double areaAbs = Math.abs(area) / 2;

        return new Axes(null, null, round(areaAbs));
    }

    private static BigDecimal round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }
}
