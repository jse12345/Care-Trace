import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageNation from "../common/PageNation";
import api from "../common/api";

function ConsultationList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get("caseId") || searchParams.get("case_id");
  const [opinions, setOpinions] = useState([]);
  const [pageObject, setPageObject] = useState(null);
  
  const [filters, setFilters] = useState({
    opinionType: searchParams.get("opinionType") || "",
    status: searchParams.get("status") || "",
  });

  useEffect(() => {
    let active = true;
    const params = Object.fromEntries(searchParams.entries());
    
    api.get("/consultation/list.do", { params })
      .then(({ data }) => {
        if (!active) return;
        setOpinions(data.list || []);
        setPageObject(data.pageObject || null);
      })
      .catch((error) => console.error("협진 목록 조회 실패:", error));
    return () => { active = false; };
  }, [searchParams]);

  const change = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const search = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({ caseId });
    if (filters.opinionType) params.set("opinionType", filters.opinionType);
    if (filters.status) params.set("status", filters.status);
    navigate(`/consultation/list?${params}`);
  };

  return (
    <main className="department-page">
      <div className="department-container">
        <header className="department-header">
          <div>
            <p className="department-eyebrow">CareTrace Consultation</p>
            <h1 className="department-title">협진 의견 목록</h1>
            <p className="department-description">해당 증례에 대한 협진 진행 경과를 한눈에 파악할 수 있습니다.</p>
          </div>
          <button className="primary-button" onClick={() => navigate(`/consultation/write?caseId=${caseId}`)}>
            + 협진 요청
          </button>
        </header>

        <section className="list-card">
          <form className="search-bar" onSubmit={search}>
            <select name="opinionType" value={filters.opinionType} onChange={change}>
              <option value="">전체 구분</option>
              <option value="REQUEST">요청 (REQUEST)</option>
              <option value="RESPONSE">응답 (RESPONSE)</option>
            </select>
            <select name="status" value={filters.status} onChange={change}>
              <option value="">전체 상태</option>
              <option value="OPEN">대기중 (OPEN)</option>
              <option value="ANSWERED">답변완료 (ANSWERED)</option>
              <option value="CLOSED">종료/철회 (CLOSED)</option>
            </select>
            <button className="search-button">검색</button>
          </form>

          <div className="table-wrapper" style={{ marginTop: '20px' }}>
            <table className="department-table">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>작성자 (의료진)</th>
                  <th>내용</th>
                  <th>상태</th>
                  <th>작성일시</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {opinions.map((op) => {
                  const opId = op.opinionId || op.opinion_id;
                  const type = op.opinionType || op.opinion_type;
                  const content = op.opinionContent || op.opinion_content;
                  const date = op.createdAt || op.created_at;
                  
                  return (
                    <tr key={opId}>
                      {/* 1. 구분(Type) 뱃지 적용: type-badge와 badge-request/response 조합 */}
                      <td className="code-cell">
                        <span className={`type-badge badge-${type?.toLowerCase()}`}>
                          {type}
                        </span>
                      </td>
                      <td>{op.staffName || "이름 없음"}</td>
                      <td className="description-cell">{content}</td>
                      {/* 2. 상태(Status) 뱃지 적용: status-badge와 badge-open/answered/closed 조합 */}
                      <td>
                        <span className={`status-badge badge-${op.status?.toLowerCase()}`}>
                          {op.status}
                        </span>
                      </td>
                      <td>{date ? new Date(date).toLocaleDateString() : ""}</td>
                      <td className="action-buttons">
                        <button 
                          className="detail-button" 
                          onClick={() => navigate(`/consultation/view?opinionId=${opId}`)}
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!opinions.length && <tr><td colSpan="6" className="empty-cell">등록된 협진 의견이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          
          {pageObject && (
            <PageNation pageObject={pageObject} listPath="/consultation/list" extraParams={filters} />
          )}
        </section>
      </div>
    </main>
  );
}

export default ConsultationList;