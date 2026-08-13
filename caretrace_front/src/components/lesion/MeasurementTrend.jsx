import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import TrendChart from "./TrendChart";

function MeasurementTrend() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lesionId = searchParams.get("lesionId");

  const [trend, setTrend] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!lesionId) return;
    let active = true;
    api.get("/lesion-measurement/trend.do", { params: { lesionId } })
      .then(({ data }) => { if (active) setTrend(data); })
      .catch(() => { if (active) setErrorMessage("추세 데이터를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [lesionId]);

  return (
    <main className="lesion-page">
      <div className="lesion-container">
        <section className="lesion-form-card">
          <div className="lesion-form-card-header">
            <h2>병변 크기 변화 추세</h2>
            <button className="lesion-close-button" onClick={() => navigate(-1)}>×</button>
          </div>

          {errorMessage && <div className="lesion-error-message">{errorMessage}</div>}

          {trend && <TrendChart list={trend.list} metric={trend.metric} />}

          <div className="lesion-form-actions">
            <button className="lesion-secondary-button" onClick={() => navigate(`/lesion/measurement/list?lesionId=${lesionId}`)}>
              측정값 목록으로
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default MeasurementTrend;
