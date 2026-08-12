import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../common/api";
import MedicalStaffForm from "./MedicalStaffForm";

const initialForm = { employeeNo: "", loginId: "", password: "", staffName: "", departmentNo: "", jobTitle: "", licenseNo: "", email: "", phone: "", role: "MEDICAL_STAFF" };

function MedicalStaffWrite() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/department/list.do", { params: { perPageNum: 100, status: "ACTIVE" } })
      .then(({ data }) => { if (active) setDepartments(data.list || []); })
      .catch(() => { if (active) setErrorMessage("진료과 목록을 불러오지 못했습니다."); });
    return () => { active = false; };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/medical-staff/write.do", { ...form, departmentNo: Number(form.departmentNo) });
      alert("의료진이 등록되었습니다.");
      navigate("/medical-staff/list");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "의료진 등록에 실패했습니다.");
    }
  };

  return <main className="department-page"><div className="department-container"><section className="form-card"><div className="form-card-header"><h2>의료진 등록</h2><button className="close-button" onClick={() => navigate(-1)}>×</button></div>{errorMessage && <div className="error-message">{errorMessage}</div>}<MedicalStaffForm form={form} setForm={setForm} departments={departments} createMode onSubmit={submit} submitLabel="등록" /></section></div></main>;
}

export default MedicalStaffWrite;
