import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function MedicalStaffRoleStatus() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const staffNo = Number(searchParams.get("staffNo"));
  const [form, setForm] = useState({ role: "MEDICAL_STAFF", accountStatus: "ACTIVE" });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/medical-staff/view.do", { params: { staffNo } })
      .then(({ data }) => { if (active) setForm({ role: data.role, accountStatus: data.accountStatus }); })
      .catch(() => { if (active) setErrorMessage("의료진 정보를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [staffNo]);

  const change = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/medical-staff/role-status.do", { staffNo, ...form });
      alert("권한과 계정 상태가 수정되었습니다.");
      navigate(`/medical-staff/view?staffNo=${staffNo}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "권한 및 상태 수정에 실패했습니다.");
    }
  };

  return <main className="department-page"><div className="department-container"><section className="form-card"><div className="form-card-header"><h2>권한 및 계정 상태 수정</h2><button className="close-button" onClick={() => navigate(-1)}>×</button></div>{errorMessage && <div className="error-message">{errorMessage}</div>}<form onSubmit={submit}><div className="form-grid"><label>권한<select name="role" value={form.role} onChange={change}><option value="ADMIN">관리자</option><option value="MEDICAL_STAFF">의료진</option></select></label><label>계정 상태<select name="accountStatus" value={form.accountStatus} onChange={change}><option value="ACTIVE">활성</option><option value="INACTIVE">비활성</option><option value="LOCKED">잠김</option></select></label></div><div className="form-actions"><button className="primary-button">수정</button></div></form></section></div></main>;
}

export default MedicalStaffRoleStatus;
