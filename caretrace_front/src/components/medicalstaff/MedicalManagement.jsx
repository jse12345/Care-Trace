import { NavLink, useLocation } from "react-router-dom";

function MedicalManagement() {
  const location = useLocation();
  const departmentActive = location.pathname.includes("/department/");

  return (
    <div className="medical-management-bar">
      <div className="medical-management-inner">
        <div className="management-context">
          <span className="management-symbol" aria-hidden="true">+</span>
          <div>
            <strong>관리자 업무</strong>
            <span>조직 및 계정 관리</span>
          </div>
        </div>
        <nav className="medical-tabs" aria-label="의료진 관리 메뉴">
          <NavLink className={departmentActive ? "active" : ""} to="/medical-staff/department/list">진료과 관리</NavLink>
          <NavLink className={!departmentActive ? "active" : ""} to="/medical-staff/list">의료진 관리</NavLink>
        </nav>
      </div>
    </div>
  );
}

export default MedicalManagement;
