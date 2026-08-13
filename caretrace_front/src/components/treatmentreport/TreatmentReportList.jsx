import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageNation from "../common/PageNation";
import api from "../common/api";

function TreatmentReportList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [pageObject, setPageObject] = useState(null);
  const [dateWord, setDateWord] = useState(searchParams.get("evaluationDate") || "");
  const [responseResult, setResponseResult] = useState(searchParams.get("responseResult") || "");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    const params = Object.fromEntries(searchParams.entries());
    // 목록 조회 API 호출
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

  const search = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (dateWord) params.set("evaluationDate", dateWord);
    if (responseResult) params.set("responseResult", responseResult);
    navigate(`/medical-staff/treatment-report/list?${params}`);
  };

  const reset = () => {
    setDateWord("");
    setResponseResult("");
    navigate("/medical-staff/treatment-report/list");
  };

  return (
    <main className="department-page">
      <div className="department-container">
        <header className="department-header">
          <div>
            <p className="department-eyebrow">CareTrace Report</p>
            <h1 className="department-title">치료 반응 보고서 목록</h1>
            <p className="department-description">증례별 치료 반응 평가 결과를 확인합니다.</p>
          </div>
          <button className="primary-button" onClick={() => navigate("/medical-staff/treatment-report/write")}>
            + 보고서 등록
          </button>
        </header>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <section className="list-card">
          <form className="search-bar" onSubmit={search}>
            <input type="date" value={dateWord} onChange={(e) => setDateWord(e.target.value)} placeholder="평가 기준일 검색" />
            <select value={responseResult} onChange={(e) => setResponseResult(e.target.value)}>
              <option value="">전체 결과</option>
              <option value="CR">완전관해 (CR)</option>
              <option value="PR">부분관해 (PR)</option>
              <option value="SD">안정병변 (SD)</option>
              <option value="PD">진행병변 (PD)</option>
            </select>
            <button className="search-button">검색</button>
            <button type="button" className="secondary-button" onClick={reset}>초기화</button>
          </form>

          <div className="table-wrapper">
            <table className="department-table">
              <thead>
                <tr>
                  <th>보고서 번호</th>
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
                    <td>{report.evaluationDate}</td>
                    <td>{report.evaluationCriteria}</td>
                    <td>{report.responseResult}</td>
                    <td>{report.staffName}</td>
                    <td>
                      <span className={`status-badge ${report.status.toLowerCase()}`}>
                        {report.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="detail-button" onClick={() => navigate(`/medical-staff/treatment-report/view?reportId=${report.reportId}`)}>조회</button>
                    </td>
                  </tr>
                ))}
                {!reports.length && <tr><td colSpan="7" className="empty-cell">등록된 치료 반응 보고서가 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
          {pageObject && (
            <PageNation pageObject={pageObject} listPath="/medical-staff/treatment-report/list" />
          )}
        </section>
      </div>
    </main>
  );
}

export default TreatmentReportList;