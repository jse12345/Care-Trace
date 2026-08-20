import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import { resizeCanvasToImage, toDisplayPoint } from "./roiCoordinates";

// mm 값이 있으면 mm으로, 없으면(PixelSpacing 정보 부재) px 값으로 대체 표시한다.
function formatAxis(mmValue, pxValue, mmUnit, pxUnit) {
  if (mmValue != null) return `${mmValue} ${mmUnit}`;
  if (pxValue != null) return `${pxValue} ${pxUnit}`;
  return "-";
}

function MeasurementView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const measurementId = searchParams.get("measurementId");

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const [measurement, setMeasurement] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/lesion-measurement/view.do", { params: { measurementId } })
      .then(({ data }) => { if (active) setMeasurement(data); })
      .catch(() => { if (active) setErrorMessage("측정값 정보를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [measurementId]);

  // 저장된 sopInstanceUid -> 현재 Orthanc 인스턴스 ID로 변환 후 이미지 로딩
  useEffect(() => {
    if (!measurement?.sopInstanceUid) return;

    let active = true;
    let objectUrl = null;

    api.get("/lesion/dicom/resolve.do", { params: { uid: measurement.sopInstanceUid } })
      .then(({ data }) => {
        const match = Array.isArray(data)
          ? data.find((item) => item.Type === "Instance") || data[0]
          : null;
        if (!match?.ID) throw new Error("resolve-failed");

        return api.get("/lesion/dicom/preview.do", {
          params: { instanceId: match.ID },
          responseType: "blob",
        });
      })
      .then(({ data }) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(data);
        setImageUrl(objectUrl);
      })
      .catch(() => {
        if (active) setErrorMessage("원본 영상을 Orthanc에서 찾을 수 없습니다(재임포트 필요할 수 있음).");
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [measurement?.sopInstanceUid]);

  const drawOverlay = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !measurement?.roiPoints?.length) return;

    resizeCanvasToImage(canvas, img);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ff5a5f";
    ctx.fillStyle = "#ff5a5f";
    ctx.lineWidth = 2;

    const displayPoints = measurement.roiPoints.map((p) => toDisplayPoint(p.x, p.y, img));
    const roiType = measurement.roiType;

    if (roiType === "POINT") {
      displayPoints.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      return;
    }

    if (roiType === "RECTANGLE" || roiType === "ELLIPSE") {
      const [p1, p2] = displayPoints;
      if (!p1 || !p2) return;
      const x = Math.min(p1.x, p2.x);
      const y = Math.min(p1.y, p2.y);
      const w = Math.abs(p2.x - p1.x);
      const h = Math.abs(p2.y - p1.y);

      ctx.beginPath();
      if (roiType === "RECTANGLE") {
        ctx.rect(x, y, w, h);
      } else {
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      }
      ctx.stroke();
      return;
    }

    // LENGTH, POLYGON
    ctx.beginPath();
    displayPoints.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    if (roiType === "POLYGON" && displayPoints.length > 2) ctx.closePath();
    ctx.stroke();
  };

  return (
    <main className="lesion-page">
      <div className="lesion-container">
        <section className="lesion-viewer-card">
          <div className="lesion-form-card-header">
            <h2>측정값 상세</h2>
            <button className="lesion-close-button" onClick={() => navigate(-1)}>×</button>
          </div>

          {errorMessage && <div className="lesion-error-message">{errorMessage}</div>}

          {measurement && (
            <>
              <div className="lesion-detail-grid">
                <div className="lesion-detail-item"><span>측정 일시</span><strong>{measurement.measuredAt?.replace("T", " ").slice(0, 16)}</strong></div>
                <div className="lesion-detail-item"><span>ROI 유형</span><strong>{measurement.roiType}</strong></div>
                <div className="lesion-detail-item"><span>장축</span><strong>{formatAxis(measurement.longAxisMm, measurement.longAxisPx, "mm", "px")}</strong></div>
                <div className="lesion-detail-item"><span>단축</span><strong>{formatAxis(measurement.shortAxisMm, measurement.shortAxisPx, "mm", "px")}</strong></div>
                <div className="lesion-detail-item"><span>면적</span><strong>{formatAxis(measurement.areaMm2, measurement.areaPx2, "mm²", "px²")}</strong></div>
                {measurement.longAxisMm == null && measurement.shortAxisMm == null && measurement.areaMm2 == null
                  && (measurement.longAxisPx != null || measurement.shortAxisPx != null || measurement.areaPx2 != null) && (
                  <div className="lesion-detail-item lesion-full-width">
                    <span className="lesion-hint-text">이 영상에는 픽셀 간격(PixelSpacing) 정보가 없어 실제 크기(mm) 대신 픽셀(px) 값으로 표시됩니다.</span>
                  </div>
                )}
                <div className="lesion-detail-item lesion-full-width"><span>메모</span><strong>{measurement.memo || "-"}</strong></div>
              </div>

              <div className="lesion-viewer-stage">
                {imageUrl ? (
                  <div className="lesion-viewer-image-wrap">
                    <img
                      ref={imgRef}
                      src={imageUrl}
                      alt="DICOM 원본 + 측정값 오버레이"
                      onLoad={drawOverlay}
                      className="lesion-viewer-image"
                    />
                    <canvas ref={canvasRef} className="lesion-viewer-canvas lesion-readonly-canvas" />
                  </div>
                ) : (
                  <p className="lesion-viewer-placeholder">원본 영상을 불러오는 중이거나 찾을 수 없습니다.</p>
                )}
              </div>

              <div className="lesion-form-actions">
                <button
                  className="lesion-edit-button"
                  onClick={() => navigate(`/lesion/measurement/capture?lesionId=${measurement.lesionId}&measurementId=${measurementId}`)}
                >
                  수정
                </button>
                <button
                  className="lesion-delete-button"
                  onClick={() => navigate(`/lesion/measurement/delete?measurementId=${measurementId}&lesionId=${measurement.lesionId}`)}
                >
                  삭제
                </button>
                <button
                  className="lesion-secondary-button"
                  onClick={() => navigate(`/lesion/measurement/list?lesionId=${measurement.lesionId}`)}
                >
                  목록
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default MeasurementView;
