import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function TreatmentReportView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/treatment-report/view.do", { params: { reportId } })
      .then(({ data }) => { if (active) setReport(data); })
      .catch(() => { if (active) setErrorMessage("데이터를 불러오는 중 오류가 발생했습니다."); });
    return () => { active = false; };
  }, [reportId]);

  const handleDelete = async () => {
    if (!window.confirm("이 보고서를 삭제하시겠습니까? (Archived 상태로 변경됩니다)")) return;
    try {
      await api.post("/treatment-report/delete.do", { reportId });
      alert("보고서가 성공적으로 삭제 처리되었습니다.");
      navigate("/medical-staff/treatment-report/list");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="department-page">
      <div className="department-container">
        <section className="form-card">
          <div className="form-card-header">
            <h2>치료 반응 보고서 상세</h2>
            <button className="close-button" onClick={() => navigate(-1)}>×</button>
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {report && (
            <div className="detail-grid">
              <div className="detail-item"><span>증례 번호</span><strong>{report.caseId}</strong></div>
              <div className="detail-item"><span>작성 의료진</span><strong>{report.staffName}</strong></div>
              <div className="detail-item"><span>평가 기준일</span><strong>{report.evaluationDate}</strong></div>
              <div className="detail-item"><span>평가 기준</span><strong>{report.evaluationCriteria}</strong></div>
              <div className="detail-item"><span>치료 반응 결과</span><strong>{report.responseResult}</strong></div>
              <div className="detail-item"><span>병변 크기 변화율</span><strong>{report.sizeChangeRate}%</strong></div>
              <div className="detail-item"><span>보고서 상태</span><strong>{report.status.toUpperCase()}</strong></div>
              <div className="detail-item full-width"><span>판독 소견</span><strong>{report.reportContent}</strong></div>
            </div>
          )}
          <div className="form-actions">
            <button className="edit-button" onClick={() => navigate(`/medical-staff/treatment-report/update?reportId=${reportId}`)}>수정/확정하기</button>
            <button className="delete-button" onClick={handleDelete}>삭제(철회)</button>
            <button className="secondary-button" onClick={() => navigate("/medical-staff/treatment-report/list")}>목록</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default TreatmentReportView;