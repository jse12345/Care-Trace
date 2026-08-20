import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import TreatmentReportForm from "./TreatmentReportForm";

const initialForm = {
  caseId: "",
  evaluationCriteria: "",
  evaluationDate: "",
  responseResult: "",
  sizeChangeRate: "",
  reportContent: "",
  status: "DRAFT"
};

function TreatmentReportWrite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL에서 caseId를 받아오면 초기값으로 설정
  const initialCaseId = searchParams.get("caseId") || searchParams.get("case_id") || "";

  // --- [상태 관리] 환자 및 증례 검색 ---
  const [patientKeyword, setPatientKeyword] = useState("");
  const [patientList, setPatientList] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [caseList, setCaseList] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId);

  // --- [상태 관리] 폼 데이터 ---
  // 초기 렌더링 시 파라미터에서 추출한 caseId를 기본값으로 삽입
  const [form, setForm] = useState({
    ...initialForm,
    caseId: initialCaseId
  });
  const [errorMessage, setErrorMessage] = useState("");

  // 증례(selectedCaseId)가 선택/변경될 때마다 form 데이터의 caseId를 동기화
  useEffect(() => {
    setForm((prev) => ({ ...prev, caseId: selectedCaseId }));
  }, [selectedCaseId]);

  // 1. 환자 검색 로직
  const searchPatients = async () => {
    if (!patientKeyword.trim()) {
      alert("검색할 환자의 이름이나 환자번호를 입력해주세요.");
      return;
    }

    try {
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

  // 2. 특정 환자 선택 시 -> 해당 환자의 진료기록(Case) 목록 조회
  const handlePatientSelect = async (patientId) => {
    setSelectedPatientId(patientId);
    setSelectedCaseId(""); // 다른 환자를 선택하면 기존 선택된 증례 초기화

    if (!patientId) {
      setCaseList([]);
      return;
    }

    try {
      const { data } = await api.get("/consultation/search-case.do", {
        params: { patientId }
      });

      setCaseList(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("증례 목록을 불러오는 중 오류가 발생했습니다.");
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    // 증례 선택 유효성 검증
    if (!form.caseId) {
      alert("보고서를 등록할 진료기록(증례)을 먼저 선택해주세요.");
      return;
    }

    // 1. 로컬 스토리지에서 현재 로그인한 의료진의 정보(ID/No) 추출
    let currentStaffNo = 1; // 정보를 못 찾을 경우를 대비한 기본값
    try {
      const loginData = JSON.parse(localStorage.getItem("login"));
      if (loginData) {
        // 프로젝트 설정에 따라 staffNo 또는 id를 사용합니다.
        currentStaffNo = loginData.staffNo || loginData.id || 1; 
      }
    } catch (e) {
      console.error("의료진 정보 확인 불가", e);
    }

    // 2. 백엔드로 전송할 최종 페이로드(Payload) 구성
    // 문자열로 되어 있을 수 있는 숫자 데이터들을 Number()로 안전하게 변환합니다.
    const payload = {
      ...form,
      caseId: Number(form.caseId),
      sizeChangeRate: form.sizeChangeRate ? Number(form.sizeChangeRate) : null,
      
      // 작성자 필수값 추가 (백엔드 VO 변수명에 맞게 전달)
      // VO에 staffNo로 선언되어 있을 확률이 높지만, 혹시 몰라 staffId도 함께 넣어줍니다.
      staffNo: currentStaffNo,
      staffId: currentStaffNo 
    };

try {
      await api.post("/treatment-report/write.do", payload);
      alert("치료 반응 보고서가 임시저장(DRAFT) 상태로 등록되었습니다.");
      navigate("/treatmentreport/list");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="department-page">
      <div className="department-container">
        <section className="form-card">
          <div className="form-card-header">
            <h2>치료 반응 보고서 등록</h2>
            <button className="close-button" onClick={() => navigate(-1)}>×</button>
          </div>

          {errorMessage && <div className="error-message" style={{ marginBottom: '20px' }}>{errorMessage}</div>}

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
                    <option value="">어떤 진료기록에 대해 보고서를 작성하시겠습니까?</option>
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
            // URL에 caseId가 포함되어 바로 넘어온 경우
            <div style={{ padding: '16px', backgroundColor: '#e9ecef', borderRadius: '8px', marginBottom: '24px', fontWeight: 'bold', color: '#495057' }}>
              선택된 진료기록 (Case ID) : {initialCaseId}
            </div>
          )}

          {/* --- 2. 보고서 작성 폼 영역 --- */}
          <TreatmentReportForm form={form} setForm={setForm} onSubmit={submit} submitLabel="보고서 등록" />
          
        </section>
      </div>
    </main>
  );
}

export default TreatmentReportWrite;