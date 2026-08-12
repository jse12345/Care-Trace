import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

const labels = { ADMIN: "관리자", MEDICAL_STAFF: "의료진", VIEWER: "조회자", ACTIVE: "활성", INACTIVE: "비활성", LOCKED: "잠김" };

function MedicalStaffView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const staffNo = searchParams.get("staffNo");
  const [staff, setStaff] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/medical-staff/view.do", { params: { staffNo } })
      .then(({ data }) => { if (active) setStaff(data); })
      .catch(() => { if (active) setErrorMessage("의료진 정보를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [staffNo]);

  return <main className="department-page"><div className="department-container"><section className="form-card"><div className="form-card-header"><h2>의료진 상세</h2><button className="close-button" onClick={() => navigate(-1)}>×</button></div>{errorMessage && <div className="error-message">{errorMessage}</div>}{staff && <div className="detail-grid"><div className="detail-item"><span>사번</span><strong>{staff.employeeNo}</strong></div><div className="detail-item"><span>이름</span><strong>{staff.staffName}</strong></div><div className="detail-item"><span>로그인 아이디</span><strong>{staff.loginId}</strong></div><div className="detail-item"><span>진료과</span><strong>{staff.departmentName}</strong></div><div className="detail-item"><span>직책</span><strong>{staff.jobTitle}</strong></div><div className="detail-item"><span>면허번호</span><strong>{staff.licenseNo || "-"}</strong></div><div className="detail-item"><span>이메일</span><strong>{staff.email}</strong></div><div className="detail-item"><span>연락처</span><strong>{staff.phone || "-"}</strong></div><div className="detail-item"><span>권한</span><strong>{labels[staff.role]}</strong></div><div className="detail-item"><span>상태</span><strong>{labels[staff.accountStatus]}</strong></div></div>}<div className="form-actions"><button className="edit-button" onClick={() => navigate(`/medical-staff/update?staffNo=${staffNo}`)}>수정</button><button className="role-button" onClick={() => navigate(`/medical-staff/role-status?staffNo=${staffNo}`)}>권한·상태</button><button className="secondary-button" onClick={() => navigate("/medical-staff/list")}>목록</button></div></section></div></main>;
}

export default MedicalStaffView;
