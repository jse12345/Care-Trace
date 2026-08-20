import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageNation from "../common/PageNation";
import api from "../common/api";

function TreatmentReportList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // URL에서 caseId 추출 (없을 경우 null)
  const caseId = searchParams.get("caseId"); 
  
  const [reports, setReports] = useState([]);
  const [pageObject, setPageObject] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ 변경/추가된 검색 조건 상태들
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [responseResult, setResponseResult] = useState(searchParams.get("responseResult") || "");
  const [searchKey, setSearchKey] = useState(searchParams.get("key") || "");
  const [searchWord, setSearchWord] = useState(searchParams.get("word") || "");

  const badgeClassMap = {
    DRAFT: "treatment",    // 주황색
    CONFIRMED: "active",   // 초록색
    ARCHIVED: "inactive"   // 회색
  };

  useEffect(() => {
    let active = true;
    const params = Object.fromEntries(searchParams.entries());
    
    api.get("/treatment-report/list.do", { params })
      .then(({ data }) => {
        if (!active) return;
        setReports(data.list || []);
        setPageObject(data.pageObject || null);
      })
      .catch(() => {
        if (active) setErrorMessage("보고서 목록을 불러오는 중 오류가 발생했습니다.");
      });
    return () => { active = false; };
  }, [searchParams]);

  // ✅ 검색 폼 제출 함수 (새로운 파라미터 매핑)
  const search = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    
    if (caseId) params.set("caseId", caseId); 
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (responseResult) params.set("responseResult", responseResult);
    if (searchWord.trim()) {
      params.set("word", searchWord.trim());
      if (searchKey) params.set("key", searchKey);
    }
    
    navigate(`/treatmentreport/list?${params.toString()}`);
  };

  // ✅ 검색 조건 초기화 함수
  const reset = () => {
    setStartDate("");
    setEndDate("");
    setResponseResult("");
    setSearchKey("");
    setSearchWord("");
    navigate(caseId ? `/treatmentreport/list?caseId=${caseId}` : `/treatmentreport/list`);
  };

  return (
    <main className="department-page">
      <div className="department-container">
        <header className="department-header">
          <div>
            <p className="department-eyebrow">CareTrace Report</p>
            <h1 className="department-title">치료 반응 보고서 목록</h1>
            <p className="department-description">
              {caseId 
                ? `증례(Case ID: ${caseId})에 대한 치료 반응 평가 결과를 확인합니다.` 
                : "전체 치료 반응 평가 결과를 확인합니다."}
            </p>
          </div>
          <button 
            className="primary-button" 
            onClick={() => navigate(caseId ? `/treatmentreport/write?caseId=${caseId}` : `/treatmentreport/write`)}
          >
            + 보고서 등록
          </button>
        </header>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <section className="list-card">
          {/* ✅ 검색 폼 구조 변경 (기존 CSS 유지 + Flexbox로 유연한 배치) */}
          <form 
            className="search-bar" 
            onSubmit={search}
            style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}
          >
            {/* 1. 기간 검색 */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                title="시작일"
                style={{ width: "135px" }}
              />
              <span style={{ color: "#7b899b", fontWeight: "bold" }}>~</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                title="종료일"
                style={{ width: "135px" }}
              />
            </div>

            {/* 2. 결과 필터 */}
            <select 
              value={responseResult} 
              onChange={(e) => setResponseResult(e.target.value)}
              style={{ width: "140px" }}
            >
              <option value="">전체 결과</option>
              <option value="CR">완전관해 (CR)</option>
              <option value="PR">부분관해 (PR)</option>
              <option value="SD">안정병변 (SD)</option>
              <option value="PD">진행병변 (PD)</option>
            </select>

            {/* 3. 이름 검색 (검색 대상 + 검색어) */}
            <div style={{ display: "flex", gap: "5px", flex: 1, minWidth: "220px" }}>
              <select 
                value={searchKey} 
                onChange={(e) => setSearchKey(e.target.value)} 
                style={{ width: "110px" }}
              >
                <option value="">이름 통합</option>
                <option value="p">환자명</option>
                <option value="s">의료진명</option>
              </select>
              <input 
                type="text" 
                value={searchWord} 
                onChange={(e) => setSearchWord(e.target.value)} 
                placeholder="검색어 입력" 
                style={{ flex: 1 }}
              />
            </div>

            <button type="submit" className="search-button">검색</button>
            <button type="button" className="secondary-button" onClick={reset}>초기화</button>
          </form>

          <div className="table-wrapper">
            <table className="department-table">
              <thead>
                <tr>
                  <th>보고서 번호</th>
                  {!caseId && <th>환자명</th>}
                  {!caseId && <th>증례 번호</th>}
                  <th>평가 기준일</th>
                  <th>평가 기준</th>
                  <th>치료 반응 결과</th>
                  <th>작성 의료진</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.reportId}>
                    <td className="code-cell">{report.reportId}</td>
                    {!caseId && <td>{report.patientName || "-"}</td>}
                    {!caseId && <td>{report.caseId}</td>}
                    <td>{report.evaluationDate}</td>
                    <td>{report.evaluationCriteria}</td>
                    <td>{report.responseResult}</td>
                    <td>{report.staffName || "이름 없음"}</td>
                    <td>
                      <span className={`status-badge ${badgeClassMap[report.status?.toUpperCase()] || ""}`}>
                        {report.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="detail-button" onClick={() => navigate(`/treatmentreport/view?reportId=${report.reportId}`)}>조회</button>
                    </td>
                  </tr>
                ))}
                
                {!reports.length && <tr><td colSpan={caseId ? "7" : "9"} className="empty-cell">등록된 치료 반응 보고서가 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          
          {pageObject && (
            <PageNation pageObject={pageObject} listPath="/treatmentreport/list" />
          )}
        </section>
      </div>
    </main>
  );
}

export default TreatmentReportList;