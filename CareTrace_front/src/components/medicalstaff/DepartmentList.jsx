import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageNation from "../common/PageNation";
import api from "../common/api";

function DepartmentList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [departments, setDepartments] = useState([]);
  const [pageObject, setPageObject] = useState(null);
  const [word, setWord] = useState(searchParams.get("word") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    const params = Object.fromEntries(searchParams.entries());

    api.get("/department/list.do", { params })
      .then(({ data }) => {
        if (!active) return;
        setDepartments(data.list || []);
        setPageObject(data.pageObject || null);
      })
      .catch(() => {
        if (active) setErrorMessage("진료과 목록을 불러오지 못했습니다.");
      });

    return () => { active = false; };
  }, [searchParams]);

  const search = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.set("key", "nc");
    if (word.trim()) params.set("word", word.trim());
    if (status) params.set("status", status);
    navigate(`/medical-staff/department/list?${params}`);
  };

  const reset = () => {
    setWord("");
    setStatus("");
    navigate("/medical-staff/department/list");
  };

  return (
    <main className="department-page">
      <div className="department-container">
        <header className="department-header">
          <div>
            <p className="department-eyebrow">CareTrace Admin</p>
            <h1 className="department-title">진료과 관리</h1>
            <p className="department-description">진료과를 등록하고 상태와 기본 정보를 관리합니다.</p>
          </div>
          <button className="primary-button" onClick={() => navigate("/medical-staff/department/write")}>
            + 진료과 등록
          </button>
        </header>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <section className="list-card">
          <form className="search-bar" onSubmit={search}>
            <input value={word} onChange={(event) => setWord(event.target.value)} placeholder="진료과명 또는 코드 검색" />
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">전체 상태</option>
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
            </select>
            <button className="search-button">검색</button>
            <button type="button" className="secondary-button" onClick={reset}>초기화</button>
          </form>

          <p className="table-summary">총 {pageObject?.totalRow || 0}개 진료과</p>
          <div className="table-wrapper">
            <table className="department-table">
              <thead><tr><th>코드</th><th>진료과명</th><th>설명</th><th>상태</th><th>관리</th></tr></thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.departmentNo}>
                    <td className="code-cell">{department.departmentCode}</td>
                    <td>{department.departmentName}</td>
                    <td className="description-cell">{department.description || "-"}</td>
                    <td><span className={`status-badge ${department.status.toLowerCase()}`}>{department.status === "ACTIVE" ? "활성" : "비활성"}</span></td>
                    <td className="action-buttons">
                      <button className="detail-button" onClick={() => navigate(`/medical-staff/department/view?departmentNo=${department.departmentNo}`)}>상세</button>
                      <button className="edit-button" onClick={() => navigate(`/medical-staff/department/update?departmentNo=${department.departmentNo}`)}>수정</button>
                      <button className="delete-button" onClick={() => navigate(`/medical-staff/department/delete?departmentNo=${department.departmentNo}`)}>삭제</button>
                    </td>
                  </tr>
                ))}
                {!departments.length && <tr><td colSpan="5" className="empty-cell">등록된 진료과가 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          {pageObject && (
            <PageNation
              pageObject={pageObject}
              listPath="/medical-staff/department/list"
              extraParams={{ status: searchParams.get("status") || "" }}
            />
          )}
        </section>
      </div>
    </main>
  );
}

export default DepartmentList;
