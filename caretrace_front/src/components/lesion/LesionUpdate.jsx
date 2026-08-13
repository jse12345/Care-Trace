import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import LesionForm from "./LesionForm";

function LesionUpdate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lesionId = searchParams.get("lesionId");
  const [form, setForm] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/lesion/view.do", { params: { lesionId } })
      .then(({ data }) => {
        if (active) {
          setForm({
            ...data,
            organ: data.organ || "",
            lesionType: data.lesionType || "",
            description: data.description || "",
            isLymphNode: Boolean(data.isLymphNode),
          });
        }
      })
      .catch(() => { if (active) setErrorMessage("병변 정보를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [lesionId]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/lesion/update.do", {
        ...form,
        lesionType: form.lesionType || null,
      });
      alert("병변 정보가 수정되었습니다.");
      navigate(`/lesion/view?lesionId=${lesionId}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "병변 수정에 실패했습니다.");
    }
  };

  return (
    <main className="lesion-page">
      <div className="lesion-container">
        <section className="lesion-form-card">
          <div className="lesion-form-card-header">
            <h2>병변 수정</h2>
            <button className="lesion-close-button" onClick={() => navigate(-1)}>×</button>
          </div>
          {errorMessage && <div className="lesion-error-message">{errorMessage}</div>}
          {form && (
            <LesionForm
              form={form}
              setForm={setForm}
              onSubmit={submit}
              submitLabel="수정"
              caseIdEditable={false}
            />
          )}
        </section>
      </div>
    </main>
  );
}

export default LesionUpdate;
