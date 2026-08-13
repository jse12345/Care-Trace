import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function ConsultationWrite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get("caseId") || searchParams.get("case_id");

  // TODO: 실제 환경에서는 로그인된 의료진 세션 정보를 가져와야 합니다.
  const currentStaffId = 1; 

  const [form, setForm] = useState({
    caseId: caseId,
    staffId: currentStaffId, // 누락된 필수 컬럼 추가
    opinionType: "REQUEST",
    opinionContent: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/consultation/write.do", form);
      alert("협진 요청이 등록되었습니다.");
      navigate(`/consultation/list?caseId=${caseId}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="department-page">
      <div className="department-container">
        <section className="form-card">
          <div className="form-card-header">
            <h2>협진 의견 요청</h2>
            <button className="close-button" onClick={() => navigate(-1)}>×</button>
          </div>
          
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          
          <form onSubmit={submit}>
            <div className="form-grid">
              <label className="full-width">
                의견 내용 {/* 오타 수정 (요견 -> 의견) */}
                <textarea 
                  name="opinionContent" 
                  value={form.opinionContent} 
                  onChange={(e) => setForm({ ...form, opinionContent: e.target.value })} 
                  required 
                  maxLength="200" 
                  rows="4" 
                  placeholder="병변에 대한 타 진료과의 소견을 요청하는 내용을 상세히 적어주세요."
                />
              </label>
            </div>
            <div className="form-actions">
              <button className="primary-button">요청 등록</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default ConsultationWrite;