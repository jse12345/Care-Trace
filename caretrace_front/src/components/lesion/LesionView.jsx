import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiEdit2,
  FiTrash2,
  FiList,
  FiPlusCircle,
  FiClipboard,
  FiTrendingUp,
} from "react-icons/fi";
import api from "../common/api";
import Breadcrumb from "../common/Breadcrumb";

function LesionView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lesionId = searchParams.get("lesionId");
  const [lesion, setLesion] = useState(null);
  const [caseInfo, setCaseInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/lesion/view.do", { params: { lesionId } })
      .then(({ data }) => { if (active) setLesion(data); })
      .catch(() => { if (active) setErrorMessage("병변 정보를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [lesionId]);

  useEffect(() => {
    if (!lesion?.caseId) return;

    let active = true;

    api.get(`/patient-cases/${lesion.caseId}`)
      .then(({ data }) => {
        if (active) setCaseInfo(data);
      })
      .catch(() => {
        if (active) setCaseInfo(null);
      });

    return () => { active = false; };
  }, [lesion?.caseId]);

  return (
    <main className="lesion-page">
      <div className="lesion-container">
        <Breadcrumb
          items={[
            ...(lesion
              ? [{
                  label: caseInfo ? (caseInfo.patientName || `환자 ${caseInfo.patientId}`) : `환자 #${lesion.caseId}`,
                  to: `/lesion/list?caseId=${lesion.caseId}`,
                }]
              : [{ label: "병변 목록", to: "/lesion/list" }]),
            { label: "병변 상세" },
          ]}
        />
        <section className="lesion-form-card">
          <div className="lesion-form-card-header">
            <h2>병변 상세</h2>
            <button className="lesion-close-button" onClick={() => navigate(-1)}>×</button>
          </div>
          {errorMessage && <div className="lesion-error-message">{errorMessage}</div>}

          {lesion && (
            <>
              <div className="lesion-detail-grid">
                <div className="lesion-detail-item"><span>증례 번호</span><strong>{lesion.caseId}</strong></div>
                <div className="lesion-detail-item"><span>병변 라벨</span><strong>{lesion.lesionLabel}</strong></div>
                <div className="lesion-detail-item"><span>장기</span><strong>{lesion.organ || "-"}</strong></div>
                <div className="lesion-detail-item"><span>구분</span><strong>{lesion.lesionType || "-"}</strong></div>
                <div className="lesion-detail-item"><span>림프절 여부</span><strong>{lesion.isLymphNode ? "O" : "X"}</strong></div>
                <div className="lesion-detail-item lesion-full-width"><span>설명</span><strong>{lesion.description || "-"}</strong></div>
              </div>

              <div className="lesion-action-group">
                <h3 className="lesion-action-group-title">병변 관리</h3>
                <div className="lesion-form-actions">
                  <button className="lesion-edit-button" onClick={() => navigate(`/lesion/update?lesionId=${lesionId}`)}>
                    <FiEdit2 aria-hidden="true" /> 수정
                  </button>
                  <button className="lesion-delete-button" onClick={() => navigate(`/lesion/delete?lesionId=${lesionId}`)}>
                    <FiTrash2 aria-hidden="true" /> 삭제
                  </button>
                  <button className="lesion-secondary-button" onClick={() => navigate(`/lesion/list?caseId=${lesion.caseId}`)}>
                    <FiList aria-hidden="true" /> 목록
                  </button>
                </div>
              </div>

              <div className="lesion-measurement-links">
                <h3 className="lesion-action-group-title">측정값</h3>
                <div className="lesion-form-actions">
                  <button
                    className="lesion-primary-button"
                    onClick={() => navigate(`/lesion/measurement/capture?lesionId=${lesionId}`)}
                  >
                    <FiPlusCircle aria-hidden="true" /> 측정값 등록(미니뷰어)
                  </button>
                  <button
                    className="lesion-secondary-button"
                    onClick={() => navigate(`/lesion/measurement/list?lesionId=${lesionId}`)}
                  >
                    <FiClipboard aria-hidden="true" /> 측정값 목록
                  </button>
                  <button
                    className="lesion-secondary-button"
                    onClick={() => navigate(`/lesion/measurement/trend?lesionId=${lesionId}`)}
                  >
                    <FiTrendingUp aria-hidden="true" /> 변화 추세 보기
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default LesionView;
