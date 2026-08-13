import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import LesionForm from "./LesionForm";

function LesionWrite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get("caseId") || "";

  const [form, setForm] = useState({
    caseId,
    lesionLabel: "",
    organ: "",
    lesionType: "",
    isLymphNode: false,
    description: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/lesion/write.do", {
        ...form,
        caseId: Number(form.caseId),
        lesionType: form.lesionType || null,
      });
      alert("병변이 등록되었습니다.");
      navigate(`/lesion/list?caseId=${form.caseId}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "병변 등록에 실패했습니다.");
    }
  };

  return (
    <main className="lesion-page">
      <div className="lesion-container">
        <section className="lesion-form-card">
          <div className="lesion-form-card-header">
            <h2>병변 등록</h2>
            <button className="lesion-close-button" onClick={() => navigate(-1)}>×</button>
          </div>
          {errorMessage && <div className="lesion-error-message">{errorMessage}</div>}
          <LesionForm
            form={form}
            setForm={setForm}
            onSubmit={submit}
            submitLabel="등록"
            caseIdEditable
          />
        </section>
      </div>
    </main>
  );
}

export default LesionWrite;
