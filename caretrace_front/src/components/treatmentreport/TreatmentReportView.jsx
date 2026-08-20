import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function TreatmentReportView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [currentStaffNo, setCurrentStaffNo] = useState(null);

  const badgeClassMap = {
    DRAFT: "treatment",
    CONFIRMED: "active",
    ARCHIVED: "inactive"
  };

  useEffect(() => {
    try {
      const loginStr = localStorage.getItem("login");
      
      // 값이 아예 없거나 "undefined" 같은 잘못된 문자열이 들어있으면 파싱하지 않고 종료
      if (!loginStr || loginStr === "undefined" || loginStr === "null") {
        return;
      }

      const loginData = JSON.parse(loginStr);
      if (loginData) {
        setCurrentStaffNo(loginData.staffNo || loginData.id);
      }
    } catch (e) {
      console.error("의료진 정보 확인 불가:", e.message);
    }
  }, []);

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
      navigate("/treatmentreport/list");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  const isAuthor = currentStaffNo && report && 
    (Number(currentStaffNo) === Number(report.staffNo) || Number(currentStaffNo) === Number(report.staffId));

  return (
    <main className="department-page">
      <div className="department-container">
        <section className="form-card">
          <div className="form-card-header">
            <h2>치료 반응 보고서 상세</h2>
            <button className="close-button" onClick={() => navigate("/treatmentreport/list")}>×</button>
          </div>
          
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          
          {report && (
            <div className="detail-grid">
              <div className="detail-item"><span>환자명</span><strong>{report.patientName || "-"}</strong></div>
              <div className="detail-item"><span>증례 번호</span><strong>{report.caseId}</strong></div>
              <div className="detail-item"><span>증례명(진단명)</span><strong>{report.diagnosisName || "-"}</strong></div>
              
              <div className="detail-item"><span>작성 의료진</span><strong>{report.staffName}</strong></div>
              <div className="detail-item"><span>평가 기준일</span><strong>{report.evaluationDate}</strong></div>
              <div className="detail-item"><span>평가 기준</span><strong>{report.evaluationCriteria}</strong></div>
              <div className="detail-item"><span>치료 반응 결과</span><strong>{report.responseResult}</strong></div>
              <div className="detail-item"><span>병변 크기 변화율</span><strong>{report.sizeChangeRate}%</strong></div>
              
              <div className="detail-item">
                <span>보고서 상태</span>
                <div>
                  <span className={`status-badge ${badgeClassMap[report.status?.toUpperCase()] || ""}`}>
                    {report.status?.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="detail-item full-width"><span>판독 소견</span><strong>{report.reportContent}</strong></div>
            </div>
          )}
          
          <div className="form-actions">
            {isAuthor && (
              <>
                <button className="edit-button" onClick={() => navigate(`/treatmentreport/update?reportId=${reportId}`)}>수정/확정하기</button>
                <button className="delete-button" onClick={handleDelete}>삭제(철회)</button>
              </>
            )}
            <button className="secondary-button" onClick={() => navigate("/treatmentreport/list")}>목록</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default TreatmentReportView;