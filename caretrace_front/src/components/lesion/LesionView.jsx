import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function LesionView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lesionId = searchParams.get("lesionId");
  const [lesion, setLesion] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/lesion/view.do", { params: { lesionId } })
      .then(({ data }) => { if (active) setLesion(data); })
      .catch(() => { if (active) setErrorMessage("병변 정보를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [lesionId]);

  return (
    <main className="lesion-page">
      <div className="lesion-container">
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
                <div className="lesion-detail-item"><span>림프절 여부</span><strong>{lesion.isLymphNode ? "예" : "아니오"}</strong></div>
                <div className="lesion-detail-item lesion-full-width"><span>설명</span><strong>{lesion.description || "-"}</strong></div>
              </div>

              <div className="lesion-form-actions">
                <button className="lesion-edit-button" onClick={() => navigate(`/lesion/update?lesionId=${lesionId}`)}>수정</button>
                <button className="lesion-delete-button" onClick={() => navigate(`/lesion/delete?lesionId=${lesionId}`)}>삭제</button>
                <button className="lesion-secondary-button" onClick={() => navigate(`/lesion/list?caseId=${lesion.caseId}`)}>목록</button>
              </div>

              <div className="lesion-measurement-links">
                <h3>측정값</h3>
                <div className="lesion-form-actions">
                  <button
                    className="lesion-primary-button"
                    onClick={() => navigate(`/lesion/measurement/capture?lesionId=${lesionId}`)}
                  >
                    측정값 등록(미니뷰어)
                  </button>
                  <button
                    className="lesion-secondary-button"
                    onClick={() => navigate(`/lesion/measurement/list?lesionId=${lesionId}`)}
                  >
                    측정값 목록
                  </button>
                  <button
                    className="lesion-secondary-button"
                    onClick={() => navigate(`/lesion/measurement/trend?lesionId=${lesionId}`)}
                  >
                    변화 추세 보기
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
