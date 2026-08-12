import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../common/api";
import DepartmentForm from "./DepartmentForm";

const initialForm = { departmentCode: "", departmentName: "", description: "", status: "ACTIVE" };

function DepartmentWrite() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/department/write.do", form);
      alert("진료과가 등록되었습니다.");
      navigate("/medical-staff/department/list");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "진료과 등록에 실패했습니다.");
    }
  };

  return (
    <main className="department-page"><div className="department-container"><section className="form-card">
      <div className="form-card-header"><h2>진료과 등록</h2><button className="close-button" onClick={() => navigate(-1)}>×</button></div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <DepartmentForm form={form} setForm={setForm} onSubmit={submit} submitLabel="등록" />
    </section></div></main>
  );
}

export default DepartmentWrite;
