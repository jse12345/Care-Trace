import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function LesionDelete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lesionId = Number(searchParams.get("lesionId"));
  const [lesion, setLesion] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/lesion/view.do", { params: { lesionId } })
      .then(({ data }) => { if (active) setLesion(data); })
      .catch(() => { if (active) setErrorMessage("병변 정보를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [lesionId]);

  const remove = async () => {
    try {
      await api.post("/lesion/delete.do", { lesionId });
      alert("병변이 삭제되었습니다.");
      navigate(lesion ? `/lesion/list?caseId=${lesion.caseId}` : "/lesion/list");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "병변 삭제에 실패했습니다.");
    }
  };

  return (
    <main className="lesion-page">
      <div className="lesion-container">
        <section className="lesion-form-card lesion-text-center">
          <h2>병변을 삭제하시겠습니까?</h2>
          <p>{lesion?.lesionLabel && `"${lesion.lesionLabel}" `}병변의 하위 측정값도 함께 삭제됩니다.</p>
          {errorMessage && <div className="lesion-error-message">{errorMessage}</div>}
          <div className="lesion-form-actions lesion-justify-center">
            <button className="lesion-delete-button" onClick={remove}>삭제</button>
            <button className="lesion-secondary-button" onClick={() => navigate(-1)}>취소</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LesionDelete;
