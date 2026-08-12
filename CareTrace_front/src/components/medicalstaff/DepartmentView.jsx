import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function DepartmentView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const departmentNo = searchParams.get("departmentNo");
  const [department, setDepartment] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/department/view.do", { params: { departmentNo } })
      .then(({ data }) => { if (active) setDepartment(data); })
      .catch(() => { if (active) setErrorMessage("진료과 정보를 불러오지 못했습니다."); });
    return () => { active = false; };
  }, [departmentNo]);

  return (
    <main className="department-page"><div className="department-container"><section className="form-card">
      <div className="form-card-header"><h2>진료과 상세</h2><button className="close-button" onClick={() => navigate(-1)}>×</button></div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {department && <div className="detail-grid">
        <div className="detail-item"><span>진료과 코드</span><strong>{department.departmentCode}</strong></div>
        <div className="detail-item"><span>진료과명</span><strong>{department.departmentName}</strong></div>
        <div className="detail-item"><span>상태</span><strong>{department.status === "ACTIVE" ? "활성" : "비활성"}</strong></div>
        <div className="detail-item"><span>설명</span><strong>{department.description || "-"}</strong></div>
      </div>}
      <div className="form-actions"><button className="edit-button" onClick={() => navigate(`/medical-staff/department/update?departmentNo=${departmentNo}`)}>수정</button><button className="secondary-button" onClick={() => navigate("/medical-staff/department/list")}>목록</button></div>
    </section></div></main>
  );
}

export default DepartmentView;
