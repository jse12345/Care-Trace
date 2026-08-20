import { useState } from "react";
import { useNavigate } from "react-router-dom"; // [수정] react-router-d -> react-router-dom 오타 교정
import api from "../common/api";

function CompareSetForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientId: "",  
    title: "",
    pastImageUrl: "",
    currentImageUrl: "",
    description: ""
  });

  // PACS 목록 데이터와 모달창 띄우기 상태 관리
  const [pacsStudyList, setPacsStudyList] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null); // 'past' 또는 'current'

  // 백엔드(/examination/list.do, MariaDB에 동기화된 검사 목록)에서 목록을 가져옵니다.
  // patientId가 입력되어 있으면 해당 환자의 검사만 조회합니다.
  const fetchExaminationList = async (patientId) => {
    try {
      const response = await api.get("/examination/list.do", {
        params: patientId ? { patientId } : undefined
      });
      if (Array.isArray(response.data)) {
        setPacsStudyList(response.data);
      } else {
        setPacsStudyList([]);
      }
    } catch (error) {
      console.error("검사 목록 조회 오류 : ", error);
      setPacsStudyList([]);
    }
  };

  // PACS 목록 조회 버튼 클릭 시, 현재 입력된 환자 ID로 목록을 필터링해서 다시 조회합니다.
  const openStudyPicker = (target) => {
    fetchExaminationList(formData.patientId || undefined);
    setSelectedTarget(target);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 모달창에서 특정 PACS 영상을 선택했을 때 실행되는 함수
  const handleSelectStudy = (study) => {
    const uid = study.studyInstanceUid;
    if (!uid) {
      alert("선택한 항목에 유효한 영상 UID가 없습니다.");
      return;
    }

    // 선택한 타겟이 과거 영상인지 현재 영상인지 판별하여 값 자동 입력
    // study.patientId는 DICOM PatientID로 매칭된 Care-Trace 환자ID(Long)이며, 매칭 안 되었으면 null이다.
    if (selectedTarget === 'past') {
      setFormData(prev => ({
        ...prev,
        pastImageUrl: uid,
        patientId: prev.patientId || study.patientId || ""
      }));
    } else if (selectedTarget === 'current') {
      setFormData(prev => ({
        ...prev,
        currentImageUrl: uid,
        patientId: prev.patientId || study.patientId || ""
      }));
    }
    // 선택 완료 후 모달창 닫기
    setSelectedTarget(null);
  };

  // 폼 제출 (비교 세트 등록)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/compare-set/register.do", formData);
      alert("의료영상 비교 세트가 성공적으로 등록되었습니다.");
      navigate("/compare-set/list");
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container pt-5 mt-4" style={{ maxWidth: "800px" }}>
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold" style={{ color: "#0f4c5c" }}>의료영상 비교 세트 등록</h2>
        <p className="text-secondary mb-0">Orthanc PACS 서버의 영상 목록을 조회하여 시기별 비교 대상을 지정합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0 rounded-4">
        <div className="mb-3">
          <label className="form-label fw-semibold">환자 ID</label>
          <input
            type="text"
            name="patientId"
            className="form-control rounded-3 bg-light"
            value={formData.patientId}
            onChange={handleChange}
            placeholder="PACS에서 선택 시 자동 입력됩니다"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">비교 세트 제목</label>
          <input
            type="text"
            name="title"
            className="form-control rounded-3"
            value={formData.title}
            onChange={handleChange}
            placeholder="예: 3개월 추적 검사 비교"
            required
          />
        </div>

        {/* 과거 영상 경로 + 검색 버튼 */}
        <div className="mb-3">
          <label className="form-label fw-semibold">과거 영상 경로 </label>
          <div className="input-group">
            <input
              type="text"
              name="pastImageUrl"
              className="form-control rounded-start-3"
              value={formData.pastImageUrl}
              onChange={handleChange}
              placeholder="우측 버튼을 눌러 목록에서 선택하세요"
              readOnly
              required
            />
            <button
              type="button"
              className="btn text-white px-3"
              style={{ backgroundColor: "#0f4c5c" }}
              onClick={() => openStudyPicker('past')}
            >
              PACS 목록 조회
            </button>
          </div>
        </div>

        {/* 현재 영상 경로 + 검색 버튼 */}
        <div className="mb-3">
          <label className="form-label fw-semibold">현재 영상 경로 </label>
          <div className="input-group">
            <input
              type="text"
              name="currentImageUrl"
              className="form-control rounded-start-3"
              value={formData.currentImageUrl}
              onChange={handleChange}
              placeholder="우측 버튼을 눌러 목록에서 선택하세요"
              readOnly
              required
            />
            <button
              type="button"
              className="btn text-white px-3"
              style={{ backgroundColor: "#0f4c5c" }}
              onClick={() => openStudyPicker('current')}
            >
              PACS 목록 조회
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">설명 및 메모</label>
          <textarea
            name="description"
            className="form-control rounded-3"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="비교 검토 목적이나 특이사항을 기록하세요"
          />
        </div>

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn text-white flex-fill py-2 fw-semibold rounded-3"
            style={{ backgroundColor: "#1d8374" }}
          >
            등록하기
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary flex-fill py-2 fw-semibold rounded-3"
            onClick={() => navigate(-1)}
          >
            취소
          </button>
        </div>
      </form>

      {selectedTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header text-white" style={{ backgroundColor: "#0f4c5c" }}>
                <h5 className="modal-title fw-bold">
                  PACS 영상 목록 조회 ({selectedTarget === 'past' ? '과거 영상 선택' : '현재 영상 선택'})
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTarget(null)}></button>
              </div>
              <div className="modal-body p-4">
                <table className="table table-hover table-bordered align-middle text-center">
                  <thead className="table-dark">
                    <tr>
                      <th>환자 ID</th>
                      <th>환자명</th>
                      <th>검사일 (Study Date)</th>
                      <th>검사 설명 (Study Description)</th>
                      <th>선택</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacsStudyList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-5 text-secondary">
                          조회된 검사 데이터가 없습니다. 검사 목록 화면에서 동기화해주세요.
                        </td>
                      </tr>
                    ) : (
                      pacsStudyList.map((study) => (
                        <tr key={study.id}>
                          <td className="fw-semibold">{study.dicomPatientId}</td>
                          <td>{study.dicomPatientName}</td>
                          <td>{study.studyDate}</td>
                          <td className="text-start">{study.studyDescription || '-'}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm text-white px-3"
                              style={{ backgroundColor: "#1d8374" }}
                              onClick={() => handleSelectStudy(study)}
                            >
                              적용
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer bg-light rounded-bottom-4">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setSelectedTarget(null)}>닫기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompareSetForm;