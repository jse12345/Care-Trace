import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function ConsultationWrite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // URL에서 caseId를 받아오면 초기값으로 설정
  const initialCaseId = searchParams.get("caseId") || searchParams.get("case_id");

  // --- [상태 관리] 환자 및 증례 검색 ---
  const [patientKeyword, setPatientKeyword] = useState("");
  const [patientList, setPatientList] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [caseList, setCaseList] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId || "");

  // --- [상태 관리] 폼 데이터 ---
  const [opinionContent, setOpinionContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // TODO: 실제 구현 시 로그인한 사용자 정보(Redux, Context 등)에서 가져와야 함
  const currentStaffId = 1;

  // 1. 환자 검색 로직 (실제 API 연동)
  const searchPatients = async () => {
    if (!patientKeyword.trim()) {
      alert("검색할 환자의 이름이나 환자번호를 입력해주세요.");
      return;
    }
    
    try {
      // 작성하신 백엔드의 환자 검색 API 호출
      const { data } = await api.get("/consultation/search-patient.do", { 
        params: { keyword: patientKeyword } 
      });
      
      setPatientList(data);
      setSelectedPatientId(""); // 새로운 검색 시 기존 환자 선택 초기화
      setCaseList([]);          // 새로운 검색 시 기존 증례 목록 초기화
      setSelectedCaseId("");    // 새로운 검색 시 기존 증례 선택 초기화

      if (data.length === 0) {
        alert("검색 결과가 없습니다.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("환자 검색 중 오류가 발생했습니다.");
    }
  };

  // 2. 특정 환자 선택 시 -> 해당 환자의 진료기록(Case) 목록 조회 (실제 API 연동)
  const handlePatientSelect = async (patientId) => {
    setSelectedPatientId(patientId);
    setSelectedCaseId(""); // 다른 환자를 선택하면 기존 선택된 증례 초기화
    
    if (!patientId) {
      setCaseList([]);
      return;
    }

    try {
      // 작성하신 백엔드의 특정 환자 증례 목록 API 호출
      const { data } = await api.get("/consultation/search-case.do", { 
        params: { patientId } 
      });
      
      setCaseList(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("증례 목록을 불러오는 중 오류가 발생했습니다.");
    }
  };

  // 3. 협진 요청 폼 제출
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedCaseId) {
      alert("협진을 요청할 환자의 진료기록(증례)을 먼저 선택해주세요.");
      return;
    }

    if (!opinionContent.trim()) {
      alert("협진 요청 내용을 입력해주세요.");
      return;
    }

    try {
      await api.post("/consultation/write.do", {
        caseId: selectedCaseId,
        opinionType: "REQUEST",
        opinionContent: opinionContent,
        staffId: currentStaffId,
      });

      alert("협진 요청이 성공적으로 등록되었습니다.");
      // 등록 완료 후 해당 증례의 협진 목록으로 이동
      navigate(`/consultation/list?caseId=${selectedCaseId}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "협진 요청 등록에 실패했습니다.");
    }
  };

  return (
    <main className="department-page">
      <div className="department-container">
        <section className="form-card">
          <div className="form-card-header">
            <h2>새 협진 요청 작성</h2>
            <button className="close-button" onClick={() => navigate(-1)}>×</button>
          </div>

          {errorMessage && <div className="error-message" style={{ marginBottom: '20px' }}>{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            {/* --- 1. 환자 및 증례 선택 영역 --- */}
            {!initialCaseId ? (
              <div className="selection-section" style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#343a40', marginBottom: '16px' }}>대상 환자 및 증례 선택</h3>
                
                {/* 1-1. 환자 검색바 */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    value={patientKeyword} 
                    onChange={(e) => setPatientKeyword(e.target.value)} 
                    placeholder="환자 이름 또는 등록번호 검색" 
                    style={{ flex: 1, padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchPatients())}
                  />
                  <button type="button" className="secondary-button" onClick={searchPatients}>
                    환자 검색
                  </button>
                </div>

                {/* 1-2. 환자 선택 Dropdown */}
                {patientList.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>환자 선택</label>
                    <select 
                      value={selectedPatientId} 
                      onChange={(e) => handlePatientSelect(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ced4da', borderRadius: '4px' }}
                    >
                      <option value="">환자를 선택해주세요</option>
                      {patientList.map(patient => (
                        <option key={patient.patientId} value={patient.patientId}>
                          {patient.patientName} (생년월일: {patient.birthDate})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 1-3. 진료기록(Case) 선택 Dropdown */}
                {selectedPatientId && caseList.length > 0 && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>진료기록(증례) 선택</label>
                    <select 
                      value={selectedCaseId} 
                      onChange={(e) => setSelectedCaseId(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #0056b3', borderRadius: '4px', backgroundColor: '#eef6fc' }}
                    >
                      <option value="">어떤 진료기록에 대해 협진을 요청하시겠습니까?</option>
                      {caseList.map(c => (
                        <option key={c.caseId} value={c.caseId}>
                          [Case ID: {c.caseId}] {c.diagnosisName} (추적시작일: {new Date(c.visitDate).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {selectedPatientId && caseList.length === 0 && (
                  <p style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '10px' }}>해당 환자의 등록된 진료기록이 없습니다.</p>
                )}
              </div>
            ) : (
              // URL에 caseId가 포함되어 바로 넘어온 경우 (특정 환자의 협진 목록에서 +버튼을 누른 경우)
              <div style={{ padding: '16px', backgroundColor: '#e9ecef', borderRadius: '8px', marginBottom: '24px', fontWeight: 'bold', color: '#495057' }}>
                선택된 진료기록 (Case ID) : {initialCaseId}
              </div>
            )}

            {/* --- 2. 협진 내용 작성 영역 --- */}
            <div className="form-grid">
              <label className="full-width">
                <span style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>협진 요청 내용 <span style={{ color: 'red' }}>*</span></span>
                <textarea 
                  value={opinionContent} 
                  onChange={(e) => setOpinionContent(e.target.value)} 
                  required 
                  maxLength="200" 
                  placeholder="협진을 의뢰하는 구체적인 사유와 환자의 상태, 판독이 필요한 부분 등을 상세히 작성해주세요."
                  style={{ minHeight: '150px', padding: '12px', border: '1px solid #ced4da', borderRadius: '6px', width: '100%' }}
                  disabled={!selectedCaseId} // Case가 선택되지 않으면 작성 불가
                />
              </label>
            </div>

            <div className="form-actions" style={{ marginTop: '30px' }}>
              <button type="button" className="secondary-button" onClick={() => navigate(-1)}>취소</button>
              <button 
                type="submit" 
                className="primary-button"
                disabled={!selectedCaseId || !opinionContent.trim()} // 필수값 누락 시 버튼 비활성화
              >
                협진 요청 등록
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default ConsultationWrite;