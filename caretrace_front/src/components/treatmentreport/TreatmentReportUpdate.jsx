import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import TreatmentReportForm from "./TreatmentReportForm";

function TreatmentReportUpdate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");
  const [form, setForm] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/treatment-report/view.do", { params: { reportId } })
      .then(({ data }) => {
        if (active) setForm(data);
      })
      .catch(() => { if (active) setErrorMessage("데이터를 불러오는 중 오류가 발생했습니다."); });
    return () => { active = false; };
  }, [reportId]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/treatment-report/update.do", form);
      alert("보고서가 성공적으로 수정/확정되었습니다.");
      navigate(`/treatmentreport/view?reportId=${reportId}`); // 라우팅 주소는 하이픈 없음 (그대로 유지)
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="department-page">
      <div className="department-container">
        <section className="form-card">
          <div className="form-card-header">
            <h2>치료 반응 보고서 수정/확정</h2>
            <button className="close-button" onClick={() => navigate(-1)}>×</button>
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {form && (
            <TreatmentReportForm 
              form={form} 
              setForm={setForm} 
              onSubmit={submit} 
              submitLabel="보고서 수정/확정" 
              isUpdate={true} 
            />
          )}
        </section>
      </div>
    </main>
  );
}

export default TreatmentReportUpdate;