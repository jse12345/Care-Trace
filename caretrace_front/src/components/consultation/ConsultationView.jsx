import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function ConsultationView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryOpinionId = searchParams.get("opinionId") || searchParams.get("opinion_id");
  
  const [opinion, setOpinion] = useState(null);
  const [responseContent, setResponseContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // TODO: 실제 구현 시 전역 상태(Redux, Context 등)에서 로그인한 의료진 정보를 가져와야 합니다.
  const currentStaffId = 1; 

  useEffect(() => {
    fetchOpinion();
  }, [queryOpinionId]);

  const fetchOpinion = () => {
    api.get("/consultation/view.do", { params: { opinionId: queryOpinionId } })
      .then(({ data }) => setOpinion(data))
      .catch(() => setErrorMessage("협진 의견을 불러오는 중 오류가 발생했습니다."));
  };

  const handleResponseSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/consultation/reply.do", {
        caseId: opinion.caseId || opinion.case_id,
        parentOpinionId: opinion.opinionId || opinion.opinion_id,
        opinionType: "RESPONSE",
        opinionContent: responseContent,
        staffId: currentStaffId // 누락되었던 작성자 ID 추가
      });
      alert("응답이 등록되었습니다.");
      fetchOpinion();
      setResponseContent("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "응답 등록 실패");
    }
  };

  const handleDelete = async () => {
    if(!window.confirm("이 협진 의견을 철회(삭제) 하시겠습니까?")) return;
    
    try {
      // 삭제 요청용 파라미터 전달
      const opId = opinion.opinionId || opinion.opinion_id;
      const cId = opinion.caseId || opinion.case_id;
      
      await api.post("/consultation/delete.do", { opinionId: opId });
      alert("협진 의견이 철회되었습니다.");
      navigate(`/consultation/list?caseId=${cId}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "철회 중 오류가 발생했습니다.");
    }
  };

  if (!opinion) return <div className="department-container">로딩 중...</div>;

  // 데이터 바인딩 Fallback
  const opType = opinion.opinionType || opinion.opinion_type;
  const opContent = opinion.opinionContent || opinion.opinion_content;
  const createdAt = opinion.createdAt || opinion.created_at;
  
  // 백엔드에서 넘어온 작성자 ID 추출
  const authorId = opinion.staffId || opinion.staff_id;

  return (
    <main className="department-page">
      <div className="department-container">
        <section className="form-card">
          <div className="form-card-header">
            <h2>협진 의견 상세</h2>
            <button className="close-button" onClick={() => navigate(-1)}>×</button>
          </div>
          
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          
          <div className="detail-grid">
            <div className="detail-item">
              <span>의견 구분</span>
              {/* 구분 뱃지 클래스 적용 */}
              <span className={`type-badge badge-${opType?.toLowerCase()}`}>{opType}</span>
            </div>
            <div className="detail-item">
              <span>상태</span>
              {/* 상태 뱃지 클래스 적용 */}
              <span className={`status-badge badge-${opinion.status?.toLowerCase()}`}>{opinion.status}</span>
            </div>
            <div className="detail-item"><span>작성자</span><strong>{opinion.staffName || "이름 없음"}</strong></div>
            <div className="detail-item"><span>작성일시</span><strong>{new Date(createdAt).toLocaleString()}</strong></div>
            <div className="detail-item full-width" style={{ minHeight: '120px' }}>
              <span>의견 내용</span>
              <strong>{opContent}</strong>
            </div>
          </div>

          {opType === 'REQUEST' && opinion.status === 'OPEN' && (
            <form onSubmit={handleResponseSubmit} style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e8eef3' }}>
              <h3 style={{ fontSize: '15px', color: 'var(--clinical-navy)', marginBottom: '15px' }}>응답 등록</h3>
              <div className="form-grid">
                <label className="full-width">
                  <textarea 
                    value={responseContent} 
                    onChange={(e) => setResponseContent(e.target.value)} 
                    required 
                    maxLength="200" 
                    placeholder="요청된 협진 의견에 대한 소견을 작성하세요."
                  />
                </label>
              </div>
              <div className="form-actions" style={{ borderTop: 'none', marginTop: '10px' }}>
                <button type="submit" className="primary-button">응답 등록</button>
              </div>
            </form>
          )}

          <div className="form-actions">
            {/* 현재 로그인한 사용자와 작성자가 일치할 때만 철회 버튼 렌더링 */}
            {authorId === currentStaffId && (
              <button className="delete-button" onClick={handleDelete}>철회(삭제)</button>
            )}
            <button className="secondary-button" onClick={() => navigate(`/consultation/list?caseId=${opinion.caseId || opinion.case_id}`)}>목록으로</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ConsultationView;