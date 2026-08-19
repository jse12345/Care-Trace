import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageNation from "../common/PageNation";
import api from "../common/api";

const roleNames = { ADMIN: "관리자", MEDICAL_STAFF: "의료진" };
const statusNames = { ACTIVE: "활성", INACTIVE: "비활성", LOCKED: "잠김" };

function MedicalStaffList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pageObject, setPageObject] = useState(null);
  const [filters, setFilters] = useState({
    word: searchParams.get("word") || "",
    departmentNo: searchParams.get("departmentNo") || "",
    role: searchParams.get("role") || "",
    status: searchParams.get("status") || "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    const params = Object.fromEntries(searchParams.entries());

    Promise.all([
      api.get("/medical-staff/list.do", { params }),
      api.get("/department/list.do", { params: { perPageNum: 100, status: "ACTIVE" } }),
    ]).then(([staffResponse, departmentResponse]) => {
      if (!active) return;
      setStaffList(staffResponse.data.list || []);
      setPageObject(staffResponse.data.pageObject || null);
      setDepartments(departmentResponse.data.list || []);
    }).catch(() => {
      if (active) setErrorMessage("의료진 정보를 불러오지 못했습니다.");
    });

    return () => { active = false; };
  }, [searchParams]);

  const change = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const search = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({ key: "ne" });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`/medical-staff/list?${params}`);
  };

  const reset = () => {
    setFilters({ word: "", departmentNo: "", role: "", status: "" });
    navigate("/medical-staff/list");
  };

  return (
    <main className="department-page"><div className="department-container">
      <header className="department-header"><div><p className="department-eyebrow">CareTrace Admin</p><h1 className="department-title">의료진 관리</h1><p className="department-description">의료진 정보와 진료과, 권한 및 계정 상태를 관리합니다.</p></div><button className="primary-button" onClick={() => navigate("/medical-staff/write")}>+ 의료진 등록</button></header>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <section className="list-card">
        <form className="staff-search-bar" onSubmit={search}>
          <input name="word" value={filters.word} onChange={change} placeholder="이름 또는 사번 검색" />
          <select name="departmentNo" value={filters.departmentNo} onChange={change}><option value="">전체 진료과</option>{departments.map((department) => <option key={department.departmentNo} value={department.departmentNo}>{department.departmentName}</option>)}</select>
          <select name="role" value={filters.role} onChange={change}><option value="">전체 권한</option>{Object.entries(roleNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select name="status" value={filters.status} onChange={change}><option value="">전체 상태</option>{Object.entries(statusNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <button className="search-button">검색</button><button type="button" className="secondary-button" onClick={reset}>초기화</button>
        </form>
        <p className="table-summary">총 {pageObject?.totalRow || 0}명의 의료진</p>
        <div className="table-wrapper"><table className="department-table staff-table"><thead><tr><th>사번</th><th>이름</th><th>진료과</th><th>직책</th><th>권한</th><th>상태</th><th>관리</th></tr></thead><tbody>
          {staffList.map((staff) => <tr key={staff.staffNo}><td className="code-cell">{staff.employeeNo}</td><td>{staff.staffName}</td><td>{staff.departmentName}</td><td>{staff.jobTitle}</td><td>{roleNames[staff.role]}</td><td>{statusNames[staff.accountStatus]}</td><td className="action-buttons"><button className="detail-button" onClick={() => navigate(`/medical-staff/view?staffNo=${staff.staffNo}`)}>상세</button><button className="edit-button" onClick={() => navigate(`/medical-staff/update?staffNo=${staff.staffNo}`)}>수정</button><button className="role-button" onClick={() => navigate(`/medical-staff/role-status?staffNo=${staff.staffNo}`)}>권한</button><button className="delete-button" onClick={() => navigate(`/medical-staff/delete?staffNo=${staff.staffNo}`)}>삭제</button></td></tr>)}
          {!staffList.length && <tr><td colSpan="7" className="empty-cell">등록된 의료진이 없습니다.</td></tr>}
        </tbody></table></div>
        {pageObject && (
          <PageNation
            pageObject={pageObject}
            listPath="/medical-staff/list"
            extraParams={{
              departmentNo: searchParams.get("departmentNo") || "",
              role: searchParams.get("role") || "",
              status: searchParams.get("status") || "",
            }}
          />
        )}
      </section>
    </div></main>
  );
}

export default MedicalStaffList;
