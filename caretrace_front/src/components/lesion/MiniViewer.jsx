import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import {
  parsePixelSpacing,
  resizeCanvasToImage,
  toDicomPoint,
  toDisplayPoint,
} from "./roiCoordinates";

const TOOLS = [
  { value: "LENGTH", label: "선(장축)" },
  { value: "ELLIPSE", label: "타원" },
  { value: "RECTANGLE", label: "사각형" },
  { value: "POLYGON", label: "다각형" },
  { value: "POINT", label: "점" },
];

// PixelSpacing 외 WindowCenter/WindowWidth 등도 다중값("40\\400")으로 내려올 수 있어
// 첫 번째 값만 취해 숫자로 변환한다.
function firstNumeric(tagValue) {
  if (tagValue === undefined || tagValue === null) return null;
  const first = String(tagValue).split("\\")[0];
  const number = Number(first);
  return Number.isFinite(number) ? number : null;
}

function MiniViewer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lesionId = searchParams.get("lesionId");
  const measurementId = searchParams.get("measurementId");
  const isEditMode = Boolean(measurementId);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const imageUrlRef = useRef(null);
  const lastGoodSelectionRef = useRef({ examinationId: "", selectedSeriesId: "", sliceIndex: 0 });

  const [examinations, setExaminations] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [instances, setInstances] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [sliceIndex, setSliceIndex] = useState(0);

  const [imageUrl, setImageUrl] = useState(null);
  const [tags, setTags] = useState(null);

  const [tool, setTool] = useState("LENGTH");
  const [points, setPoints] = useState([]);
  const drawingRef = useRef(false);

  const [examinationId, setExaminationId] = useState("");
  const [memo, setMemo] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // 수정 모드에서 등록 당시 선택했던 검사/시리즈/슬라이스/ROI를 순차적으로 복원하기 위한 대기값.
  // 각 단계는 이전 단계의 비동기 로딩 결과에 의존하는 cascade 구조라, ref에 담아두고
  // 해당 데이터의 fetch 완료 콜백에서 소비한다.
  const pendingSeriesUidRef = useRef(null);
  const pendingInstanceRef = useRef(null);
  const pendingToolRef = useRef(null);
  const pendingPointsRef = useRef(null);
  const pendingMemoRef = useRef(null);

  // 0. 수정 모드: 기존 측정값 조회 후 검사 선택부터 순차 복원 시작
  useEffect(() => {
    if (!isEditMode) return;
    let active = true;
    api.get("/lesion-measurement/view.do", { params: { measurementId } })
      .then(({ data }) => {
        if (!active || !data) return;
        pendingSeriesUidRef.current = data.seriesInstanceUid || null;
        pendingInstanceRef.current = { sopUid: data.sopInstanceUid || null, instanceNumber: data.instanceNumber ?? null };
        pendingToolRef.current = data.roiType || null;
        pendingPointsRef.current = Array.isArray(data.roiPoints) ? data.roiPoints : null;
        pendingMemoRef.current = data.memo ?? null;
        setExaminationId(String(data.examinationId ?? ""));
      })
      .catch(() => { if (active) setErrorMessage("측정값 정보를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [isEditMode, measurementId]);

  // 1. 검사(Examination) 목록 로딩 - 해당 병변의 환자로 필터링된 DB(MariaDB) 목록
  useEffect(() => {
    if (!lesionId) return;
    let active = true;
    api.get("/examination/list.do", { params: { lesionId } })
      .then(({ data }) => { if (active) setExaminations(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setErrorMessage("검사 목록을 불러오지 못했습니다. 검사 목록 화면에서 동기화가 되어 있는지 확인해 주세요."); });
    return () => { active = false; };
  }, [lesionId]);

  // examinationId가 세팅되면(수동 선택 또는 수정모드 복원) studyId를 유도
  const selectedStudyId = useMemo(() => {
    const exam = examinations.find((e) => String(e.id) === String(examinationId));
    return exam?.orthancStudyId || "";
  }, [examinationId, examinations]);

  // 2. 시리즈 목록 로딩
  useEffect(() => {
    if (!selectedStudyId) return;
    let active = true;
    api.get("/lesion/dicom/series.do", { params: { studyId: selectedStudyId } })
      .then(({ data }) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setSeriesList(list);
        // 수정모드 복원: 시리즈 목록이 로딩되면 저장된 SeriesInstanceUID와 매칭
        if (pendingSeriesUidRef.current) {
          const match = list.find((s) => s.MainDicomTags?.SeriesInstanceUID === pendingSeriesUidRef.current);
          pendingSeriesUidRef.current = null;
          if (match) setSelectedSeriesId(match.ID);
        }
      })
      .catch(() => { if (active) setErrorMessage("시리즈 목록을 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [selectedStudyId]);

  // 3. 인스턴스(슬라이스) 목록 로딩 - IndexInSeries 순 정렬
  useEffect(() => {
    if (!selectedSeriesId) return;
    let active = true;
    api.get("/lesion/dicom/instances.do", { params: { seriesId: selectedSeriesId } })
      .then(({ data }) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setInstances(list);

        // 수정모드 복원: 인스턴스 목록이 로딩되면 저장된 SOPInstanceUID/InstanceNumber와 매칭
        let idx = 0;
        if (pendingInstanceRef.current) {
          const pending = pendingInstanceRef.current;
          pendingInstanceRef.current = null;
          const foundIdx = list.findIndex((inst) =>
            (pending.sopUid && inst.MainDicomTags?.SOPInstanceUID === pending.sopUid) ||
            (pending.instanceNumber != null && firstNumeric(inst.MainDicomTags?.InstanceNumber) === pending.instanceNumber)
          );
          if (foundIdx >= 0) idx = foundIdx;
        }
        setSliceIndex(idx);
      })
      .catch(() => { if (active) setErrorMessage("슬라이스 목록을 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [selectedSeriesId]);

  const currentInstance = instances[sliceIndex] || null;

  // 4. 현재 슬라이스의 이미지(blob)와 태그 로딩
  useEffect(() => {
    if (!currentInstance) return;

    let active = true;

    // 함정#3: <img src>는 인증 헤더가 안 붙으므로 blob으로 받아 objectURL로 변환한다.
    api.get("/lesion/dicom/preview.do", {
      params: { instanceId: currentInstance.ID },
      responseType: "blob",
    }).then(({ data }) => {
      if (!active) return;
      const newUrl = URL.createObjectURL(data);
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = newUrl;
      setImageUrl(newUrl);
      lastGoodSelectionRef.current = { examinationId, selectedSeriesId, sliceIndex };

      // 수정모드 복원: 이미지 로딩이 끝난 뒤 저장된 ROI/메모를 한 번만 적용
      if (pendingToolRef.current || pendingPointsRef.current || pendingMemoRef.current) {
        if (pendingToolRef.current) setTool(pendingToolRef.current);
        if (pendingPointsRef.current) setPoints(pendingPointsRef.current);
        if (pendingMemoRef.current) setMemo(pendingMemoRef.current);
        pendingToolRef.current = null;
        pendingPointsRef.current = null;
        pendingMemoRef.current = null;
      }
    }).catch(() => {
      if (!active) return;
      alert("영상을 불러오지 못했습니다.");
      const prev = lastGoodSelectionRef.current;
      setExaminationId(prev.examinationId);
      setSelectedSeriesId(prev.selectedSeriesId);
      setSliceIndex(prev.sliceIndex);
    });

    api.get("/lesion/dicom/tags.do", { params: { instanceId: currentInstance.ID } })
      .then(({ data }) => { if (active) setTags(data); })
      .catch(() => { if (active) setErrorMessage("DICOM 태그 정보를 불러오지 못했습니다."); });

    return () => { active = false; };
  }, [currentInstance]);

  // 컴포넌트 언마운트 시 마지막 objectURL 해제
  useEffect(() => {
    return () => {
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    };
  }, []);

  const pixelSpacing = parsePixelSpacing(tags?.PixelSpacing, tags?.ImagerPixelSpacing);

  // 캔버스를 이미지 표시 크기에 맞춰 재설정
  const handleImageLoad = () => {
    if (imgRef.current && canvasRef.current) {
      resizeCanvasToImage(canvasRef.current, imgRef.current);
      redraw();
    }
  };

  // 5. 캔버스 렌더링
  const redraw = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ff5a5f";
    ctx.fillStyle = "#ff5a5f";
    ctx.lineWidth = 2;

    if (!points.length) return;

    const displayPoints = points.map((p) => toDisplayPoint(p.x, p.y, img));

    if (tool === "POINT") {
      displayPoints.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      return;
    }

    if (tool === "LENGTH") {
      ctx.beginPath();
      displayPoints.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
      displayPoints.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      return;
    }

    if (tool === "RECTANGLE" || tool === "ELLIPSE") {
      if (displayPoints.length < 2) return;
      const [p1, p2] = displayPoints;
      const x = Math.min(p1.x, p2.x);
      const y = Math.min(p1.y, p2.y);
      const w = Math.abs(p2.x - p1.x);
      const h = Math.abs(p2.y - p1.y);

      ctx.beginPath();
      if (tool === "RECTANGLE") {
        ctx.rect(x, y, w, h);
      } else {
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      }
      ctx.stroke();
      return;
    }

    if (tool === "POLYGON") {
      ctx.beginPath();
      displayPoints.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      if (displayPoints.length > 2) ctx.closePath();
      ctx.stroke();
      displayPoints.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };

  useEffect(redraw, [points, tool]);

  const canvasPointFromEvent = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handleMouseDown = (event) => {
    if (!imgRef.current) return;
    const canvasPoint = canvasPointFromEvent(event);
    const dicomPoint = toDicomPoint(canvasPoint.x, canvasPoint.y, imgRef.current);

    if (tool === "POINT") {
      setPoints([dicomPoint]);
      return;
    }

    if (tool === "POLYGON") {
      setPoints((previous) => [...previous, dicomPoint]);
      return;
    }

    // LENGTH / RECTANGLE / ELLIPSE: 드래그 시작
    drawingRef.current = true;
    setPoints([dicomPoint, dicomPoint]);
  };

  const handleMouseMove = (event) => {
    if (!drawingRef.current || tool === "POINT" || tool === "POLYGON") return;
    if (!imgRef.current) return;
    const canvasPoint = canvasPointFromEvent(event);
    const dicomPoint = toDicomPoint(canvasPoint.x, canvasPoint.y, imgRef.current);
    setPoints((previous) => [previous[0], dicomPoint]);
  };

  const handleMouseUp = () => {
    drawingRef.current = false;
  };

  const handleDoubleClick = () => {
    // 다각형 그리기 종료(추가 동작 없음, 안내용)
  };

  const clearPoints = () => setPoints([]);

  const changeTool = (nextTool) => {
    setTool(nextTool);
    setPoints([]);
  };

  const save = async () => {
    if (!lesionId) {
      setErrorMessage("lesionId가 없습니다. 병변 상세 화면에서 다시 접근해 주세요.");
      return;
    }
    if (!examinationId) {
      setErrorMessage("검사를 선택해 주세요.");
      return;
    }
    if (!points.length) {
      setErrorMessage("ROI를 먼저 그려 주세요.");
      return;
    }

    const selectedExamination = examinations.find((e) => String(e.id) === String(examinationId));
    const studyUid = selectedExamination?.studyInstanceUid;
    const seriesUid = seriesList.find((s) => s.ID === selectedSeriesId)?.MainDicomTags?.SeriesInstanceUID;
    const sopUid = currentInstance?.MainDicomTags?.SOPInstanceUID;

    const payload = {
      lesionId: Number(lesionId),
      examinationId: Number(examinationId),
      studyInstanceUid: studyUid || null,
      seriesInstanceUid: seriesUid || null,
      sopInstanceUid: sopUid || null,
      instanceNumber: firstNumeric(currentInstance?.MainDicomTags?.InstanceNumber),
      frameNumber: 1,
      roiType: tool,
      roiPoints: points,
      pixelSpacingX: pixelSpacing.x,
      pixelSpacingY: pixelSpacing.y,
      sliceThickness: firstNumeric(tags?.SliceThickness),
      windowCenter: firstNumeric(tags?.WindowCenter),
      windowWidth: firstNumeric(tags?.WindowWidth),
      memo: memo || null,
    };

    setSaving(true);
    setErrorMessage("");
    try {
      if (isEditMode) {
        await api.post("/lesion-measurement/update.do", { ...payload, measurementId: Number(measurementId) });
        alert("측정값이 수정되었습니다.");
      } else {
        await api.post("/lesion-measurement/write.do", payload);
        alert("측정값이 저장되었습니다.");
      }
      navigate(`/lesion/measurement/list?lesionId=${lesionId}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "측정값 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="lesion-page">
      <div className="lesion-container">
        <section className="lesion-viewer-card">
          <div className="lesion-form-card-header">
            <h2>{isEditMode ? "측정값 수정" : "병변 측정값 등록"}</h2>
            <button className="lesion-close-button" onClick={() => navigate(-1)}>×</button>
          </div>

          {errorMessage && <div className="lesion-error-message">{errorMessage}</div>}

          <div className="lesion-viewer-toolbar">
            <label>
              검사 선택
              <select
                value={examinationId}
                onChange={(e) => {
                  setExaminationId(e.target.value);
                  setSelectedSeriesId("");
                  setSeriesList([]);
                  setInstances([]);
                  setSliceIndex(0);
                  setImageUrl(null);
                  setTags(null);
                  setPoints([]);
                }}
              >
                <option value="">선택</option>
                {examinations.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.studyDate || ""} · {exam.studyDescription || "설명 없음"}
                    {exam.seriesCount != null ? ` (Series ${exam.seriesCount})` : ""}
                  </option>
                ))}
              </select>
              {examinations.length === 0 && (
                <span className="lesion-hint-text">
                  등록된 검사가 없습니다. <a href="/examination/list" target="_blank" rel="noreferrer">검사 목록</a> 화면에서 동기화해 주세요.
                </span>
              )}
            </label>

            <label>
              시리즈(Series)
              <select
                value={selectedSeriesId}
                onChange={(e) => {
                  setSelectedSeriesId(e.target.value);
                  setInstances([]);
                  setSliceIndex(0);
                  setImageUrl(null);
                  setTags(null);
                  setPoints([]);
                }}
                disabled={!selectedStudyId}
              >
                <option value="">선택</option>
                {seriesList.map((series) => (
                  <option key={series.ID} value={series.ID}>
                    {series.MainDicomTags?.SeriesDescription || series.MainDicomTags?.Modality || series.ID}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {instances.length > 0 && (
            <div className="lesion-slice-nav">
              <button
                type="button"
                className="lesion-secondary-button"
                disabled={sliceIndex <= 0}
                onClick={() => { setSliceIndex((i) => Math.max(0, i - 1)); setPoints([]); }}
              >
                ◀ 이전 슬라이스
              </button>
              <span>슬라이스 {sliceIndex + 1} / {instances.length}</span>
              <button
                type="button"
                className="lesion-secondary-button"
                disabled={sliceIndex >= instances.length - 1}
                onClick={() => { setSliceIndex((i) => Math.min(instances.length - 1, i + 1)); setPoints([]); }}
              >
                다음 슬라이스 ▶
              </button>
            </div>
          )}

          <div className="lesion-viewer-stage">
            {imageUrl ? (
              <div className="lesion-viewer-image-wrap">
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="DICOM 미리보기"
                  onLoad={handleImageLoad}
                  className="lesion-viewer-image"
                />
                <canvas
                  ref={canvasRef}
                  className="lesion-viewer-canvas"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onDoubleClick={handleDoubleClick}
                />
              </div>
            ) : (
              <p className="lesion-viewer-placeholder">검사와 시리즈를 선택하면 영상이 표시됩니다.</p>
            )}
          </div>

          <div className="lesion-viewer-tools">
            {TOOLS.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`lesion-tool-button ${tool === t.value ? "active" : ""}`}
                onClick={() => changeTool(t.value)}
              >
                {t.label}
              </button>
            ))}
            <button type="button" className="lesion-secondary-button" onClick={clearPoints}>
              지우기
            </button>
          </div>

          <label className="lesion-memo-label">
            메모
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows="2" />
          </label>

          <div className="lesion-form-actions">
            <button className="lesion-primary-button" onClick={save} disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default MiniViewer;
