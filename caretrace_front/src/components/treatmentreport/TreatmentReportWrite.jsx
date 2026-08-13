import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../common/api";
import TreatmentReportForm from "./TreatmentReportForm";

const initialForm = {
  caseId: "",
  evaluationCriteria: "",
  evaluationDate: "",
  responseResult: "",
  sizeChangeRate: "",
  reportContent: "",
  status: "draft"
};

function TreatmentReportWrite() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/treatment-report/write.do", form);
      alert("치료 반응 보고서가 임시저장(DRAFT) 상태로 등록되었습니다.");
      navigate("/medical-staff/treatment-report/list");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="department-page">
      <div className="department-container">
        <section className="form-card">
          <div className="form-card-header">
            <h2>치료 반응 보고서 등록</h2>
            <button className="close-button" onClick={() => navigate(-1)}>×</button>
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <TreatmentReportForm form={form} setForm={setForm} onSubmit={submit} submitLabel="보고서 등록" />
        </section>
      </div>
    </main>
  );
}

export default TreatmentReportWrite;