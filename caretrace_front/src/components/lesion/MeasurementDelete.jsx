import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function MeasurementDelete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const measurementId = Number(searchParams.get("measurementId"));
  const lesionId = searchParams.get("lesionId");
  const [errorMessage, setErrorMessage] = useState("");

  const remove = async () => {
    try {
      await api.post("/lesion-measurement/delete.do", { measurementId });
      alert("측정값이 삭제되었습니다.");
      navigate(`/lesion/measurement/list?lesionId=${lesionId}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "측정값 삭제에 실패했습니다.");
    }
  };

  return (
    <main className="lesion-page">
      <div className="lesion-container">
        <section className="lesion-form-card lesion-text-center">
          <h2>측정값을 삭제하시겠습니까?</h2>
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

export default MeasurementDelete;
