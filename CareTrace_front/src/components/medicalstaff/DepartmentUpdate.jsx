import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import DepartmentForm from "./DepartmentForm";

function DepartmentUpdate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const departmentNo = searchParams.get("departmentNo");
  const [form, setForm] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/department/view.do", { params: { departmentNo } })
      .then(({ data }) => {
        if (active) setForm({ ...data, description: data.description || "" });
      })
      .catch(() => { if (active) setErrorMessage("진료과 정보를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [departmentNo]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/department/update.do", form);
      alert("진료과 정보가 수정되었습니다.");
      navigate(`/medical-staff/department/view?departmentNo=${departmentNo}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "진료과 수정에 실패했습니다.");
    }
  };

  return (
    <main className="department-page"><div className="department-container"><section className="form-card">
      <div className="form-card-header"><h2>진료과 수정</h2><button className="close-button" onClick={() => navigate(-1)}>×</button></div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {form && <DepartmentForm form={form} setForm={setForm} onSubmit={submit} submitLabel="수정" />}
    </section></div></main>
  );
}

export default DepartmentUpdate;
