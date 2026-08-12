import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import MedicalStaffForm from "./MedicalStaffForm";

function MedicalStaffUpdate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const staffNo = Number(searchParams.get("staffNo"));
  const [form, setForm] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/medical-staff/view.do", { params: { staffNo } }), api.get("/department/list.do", { params: { perPageNum: 100, status: "ACTIVE" } })])
      .then(([staffResponse, departmentResponse]) => {
        if (!active) return;
        const staff = staffResponse.data;
        setForm({ staffNo, staffName: staff.staffName, departmentNo: String(staff.departmentNo), jobTitle: staff.jobTitle, licenseNo: staff.licenseNo || "", email: staff.email, phone: staff.phone || "" });
        setDepartments(departmentResponse.data.list || []);
      })
      .catch(() => { if (active) setErrorMessage("의료진 정보를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [staffNo]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/medical-staff/update.do", { ...form, staffNo, departmentNo: Number(form.departmentNo) });
      alert("의료진 정보가 수정되었습니다.");
      navigate(`/medical-staff/view?staffNo=${staffNo}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "의료진 수정에 실패했습니다.");
    }
  };

  return <main className="department-page"><div className="department-container"><section className="form-card"><div className="form-card-header"><h2>의료진 수정</h2><button className="close-button" onClick={() => navigate(-1)}>×</button></div>{errorMessage && <div className="error-message">{errorMessage}</div>}{form && <MedicalStaffForm form={form} setForm={setForm} departments={departments} createMode={false} onSubmit={submit} submitLabel="수정" />}</section></div></main>;
}

export default MedicalStaffUpdate;
