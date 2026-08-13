import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function ConsultationView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const opinionId = searchParams.get("opinionId");
  
  const [opinion, setOpinion] = useState(null);
  const [responseContent, setResponseContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchOpinion();
  }, [opinionId]);

  const fetchOpinion = () => {
    api.get("/consultation/view.do", { params: { opinionId } })
      .then(({ data }) => setOpinion(data))
      .catch(() => setErrorMessage("협진 의견을 불러오는 중 오류가 발생했습니다."));
  };

  // 1-3. 협진 의견 응답 등록
  const handleResponseSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/consultation/reply.do", {
        caseId: opinion.caseId,
        parentOpinionId: opinion.opinionId,
        opinionType: "RESPONSE",
        opinionContent: responseContent
      });
      alert("응답이 등록되었습니다.");
      fetchOpinion(); // 원 상태(ANSWERED) 갱신을 위해 리로드
      setResponseContent("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "응답 등록 실패");
    }
  };

  // 1-4. 협진 의견 삭제 (철회)
  const handleDelete = async () => {
    if(!window.confirm("이 협진 의견을 철회(삭제) 하시겠습니까?")) return;
    
    try {
      await api.post("/consultation/delete.do", { opinionId });
      alert("협진 의견이 철회되었습니다.");
      navigate(`/consultation/list?caseId=${opinion.caseId}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "철회 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="department-page">
      <div className="department-container">
        <section className="form-card">
          <div className="form-card-header">
            <h2>협진 의견 상세</h2>
            <button className="close-button" onClick={() => navigate(-1)}>×</button>
          </div>
          
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          
          {opinion && (
            <>
              <div className="detail-grid">
                <div className="detail-item"><span>의견 구분</span><strong>{opinion.opinionType}</strong></div>
                <div className="detail-item"><span>상태</span><strong>{opinion.status}</strong></div>
                <div className="detail-item"><span>작성자</span><strong>{opinion.staffName}</strong></div>
                <div className="detail-item"><span>작성일시</span><strong>{new Date(opinion.createdAt).toLocaleString()}</strong></div>
                <div className="detail-item full-width" style={{ minHeight: '120px' }}>
                  <span>의견 내용</span>
                  <strong>{opinion.opinionContent}</strong>
                </div>
              </div>

              {/* 응답 등록 영역 (상태가 OPEN일 때만 노출) */}
              {opinion.opinionType === 'REQUEST' && opinion.status === 'OPEN' && (
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
                {/* 본인이 작성했거나 관리자 권한일 경우만 철회 가능하게 렌더링 해야함 */}
                <button className="delete-button" onClick={handleDelete}>철회(삭제)</button>
                <button className="secondary-button" onClick={() => navigate(`/consultation/list?caseId=${opinion.caseId}`)}>목록으로</button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default ConsultationView;