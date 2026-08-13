import { format } from "date-fns";

const WIDTH = 640;
const HEIGHT = 280;
const PADDING = { top: 20, right: 24, bottom: 40, left: 56 };

// 차팅 라이브러리를 새로 추가하지 않고 직접 그린 SVG 꺾은선 그래프.
function TrendChart({ list, metric }) {
  const points = (list || []).filter((item) => item.trendValueMm != null);

  if (!points.length) {
    return <p className="lesion-viewer-placeholder">표시할 추세 데이터가 없습니다.</p>;
  }

  const values = points.map((p) => Number(p.trendValueMm));
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(...values) || 1;

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const xFor = (index) =>
    points.length === 1
      ? PADDING.left + plotWidth / 2
      : PADDING.left + (index / (points.length - 1)) * plotWidth;

  const yFor = (value) =>
    PADDING.top + plotHeight - ((value - minValue) / (maxValue - minValue || 1)) * plotHeight;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(Number(p.trendValueMm))}`)
    .join(" ");

  const metricLabel = metric === "SHORT_AXIS" ? "단축(mm)" : "장축(mm)";

  return (
    <div className="lesion-trend-chart">
      <p className="lesion-trend-metric">기준 지표: {metricLabel}</p>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="병변 크기 변화 추세">
        <line
          x1={PADDING.left} y1={PADDING.top + plotHeight}
          x2={WIDTH - PADDING.right} y2={PADDING.top + plotHeight}
          stroke="var(--clinical-line)"
        />
        <line
          x1={PADDING.left} y1={PADDING.top}
          x2={PADDING.left} y2={PADDING.top + plotHeight}
          stroke="var(--clinical-line)"
        />

        <path d={linePath} fill="none" stroke="var(--clinical-cyan)" strokeWidth="2.5" />

        {points.map((p, i) => (
          <g key={p.measurementId}>
            <circle cx={xFor(i)} cy={yFor(Number(p.trendValueMm))} r="4" fill={p.baseline ? "var(--clinical-navy)" : "var(--clinical-blue)"} />
            <text x={xFor(i)} y={HEIGHT - PADDING.bottom + 20} textAnchor="middle" fontSize="11" fill="var(--clinical-muted)">
              {p.measuredAt ? format(new Date(p.measuredAt), "MM/dd") : ""}
            </text>
            <text x={xFor(i)} y={yFor(Number(p.trendValueMm)) - 10} textAnchor="middle" fontSize="11" fill="var(--clinical-ink)">
              {p.trendValueMm}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default TrendChart;
