import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import Breadcrumb from "../common/Breadcrumb";
import TrendChart from "./TrendChart";

function MeasurementTrend() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lesionId = searchParams.get("lesionId");

  const [trend, setTrend] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [caseId, setCaseId] = useState(null);
  const [caseInfo, setCaseInfo] = useState(null);

  useEffect(() => {
    if (!lesionId) return;
    let active = true;
    api.get("/lesion-measurement/trend.do", { params: { lesionId } })
      .then(({ data }) => { if (active) setTrend(data); })
      .catch(() => { if (active) setErrorMessage("추세 데이터를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [lesionId]);

  useEffect(() => {
    if (!lesionId) return;
    let active = true;
    api.get("/lesion/view.do", { params: { lesionId } })
      .then(({ data }) => { if (active) setCaseId(data.caseId); })
      .catch(() => { if (active) setCaseId(null); });
    return () => { active = false; };
  }, [lesionId]);

  useEffect(() => {
    if (!caseId) return;

    let active = true;

    api.get(`/patient-cases/${caseId}`)
      .then(({ data }) => {
        if (active) setCaseInfo(data);
      })
      .catch(() => {
        if (active) setCaseInfo(null);
      });

    return () => { active = false; };
  }, [caseId]);

  return (
    <main className="lesion-page">
      <div className="lesion-container">
        {caseId && (
          <Breadcrumb
            items={[
              {
                label: caseInfo ? (caseInfo.patientName || `환자 ${caseInfo.patientId}`) : `환자 #${caseId}`,
                to: `/lesion/list?caseId=${caseId}`,
              },
              { label: "병변 목록", to: `/lesion/list?caseId=${caseId}` },
              { label: "측정값 목록", to: `/lesion/measurement/list?lesionId=${lesionId}` },
              { label: "변화 추세" },
            ]}
          />
        )}
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
