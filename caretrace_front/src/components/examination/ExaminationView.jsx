import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiImage, FiList } from "react-icons/fi";
import api from "../common/api";
import Breadcrumb from "../common/Breadcrumb";

function displayValue(value) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string" && value.trim() === "") return "-";
  return value;
}

function formatDicomDate(date) {
  if (!date || date.length !== 8) return "-";
  return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
}

function formatDicomTime(time) {
  if (!time) return "-";
  const value = time.split(".")[0];
  if (value.length < 4) return value;
  const hour = value.substring(0, 2);
  const minute = value.substring(2, 4);
  const second = value.length >= 6 ? value.substring(4, 6) : "";
  return second ? `${hour}:${minute}:${second}` : `${hour}:${minute}`;
}

/**
 * 검사(Examination) 상세 화면. webjjang 프로젝트의 PacsView.jsx 구조를 참고했다.
 */
function ExaminationView() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();

  const [examination, setExamination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    let active = true;
    api.get("/examination/view.do", { params: { id } })
      .then(({ data }) => { if (active) setExamination(data); })
      .catch((err) => {
        console.error("검사 상세 조회 오류 : ", err);
        if (active) setErrorMessage("검사 정보를 불러오지 못했습니다.");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [id]);

  const handleViewer = () => {
    if (!examination?.studyInstanceUid) {
      alert("StudyInstanceUID가 없습니다.");
      return;
    }

    const viewerUrl =
      `${import.meta.env.VITE_OHIF_BASE_URL}/viewer?StudyInstanceUIDs=${encodeURIComponent(
        examination.studyInstanceUid
      )}`;

    window.open(viewerUrl, "_blank", "noopener,noreferrer");
  };

  if (!id) {
    return (
      <main className="examination-page">
        <div className="examination-container">
          <Breadcrumb items={[{ label: "검사 목록", to: "/examination/list" }, { label: "검사 상세" }]} />
          <section className="examination-form-card">
            <div className="examination-error-message">조회할 검사 id가 없습니다.</div>
            <button className="examination-secondary-button" onClick={() => navigate("/examination/list")}>
              <FiList aria-hidden="true" /> 목록으로
            </button>
          </section>
        </div>
      </main>
    );
  }

  const seriesList = examination?.seriesList || [];

  return (
    <main className="examination-page">
      <div className="examination-container">
        <Breadcrumb items={[{ label: "검사 목록", to: "/examination/list" }, { label: "검사 상세" }]} />
        <section className="examination-form-card">
          <div className="examination-form-card-header">
            <h2>검사 상세</h2>
            <div className="examination-header-actions">
              <button
                className="examination-primary-button"
                onClick={handleViewer}
                disabled={!examination?.studyInstanceUid}
              >
                <FiImage aria-hidden="true" /> 영상 보기
              </button>
              <button className="examination-secondary-button" onClick={() => navigate("/examination/list")}>
                <FiList aria-hidden="true" /> 목록으로
              </button>
            </div>
          </div>

          {errorMessage && <div className="examination-error-message">{errorMessage}</div>}

          {loading && !examination && !errorMessage && (
            <p className="examination-table-summary">불러오는 중...</p>
          )}

          {examination && (
            <>
              <div className="examination-summary-grid">
                <div className="examination-summary-item">
                  <span>상태</span>
                  <strong>
                    {examination.stable ? (
                      <span className="examination-status-badge stable">완료</span>
                    ) : (
                      <span className="examination-status-badge pending">대기</span>
                    )}
                  </strong>
                </div>
                <div className="examination-summary-item">
                  <span>Series 수</span>
                  <strong>{displayValue(examination.seriesCount)}</strong>
                </div>
                <div className="examination-summary-item">
                  <span>Instance 수</span>
                  <strong>{displayValue(examination.instanceCount)}</strong>
                </div>
                <div className="examination-summary-item">
                  <span>Care-Trace 환자ID</span>
                  <strong>{displayValue(examination.patientId)}</strong>
                </div>
              </div>

              <div className="examination-detail-grid">
                <div className="examination-detail-item">
                  <span>환자ID (DICOM)</span>
                  <strong>{displayValue(examination.dicomPatientId)}</strong>
                </div>
                <div className="examination-detail-item">
                  <span>환자명 (DICOM)</span>
                  <strong>{displayValue(examination.dicomPatientName)}</strong>
                </div>
                <div className="examination-detail-item">
                  <span>성별</span>
                  <strong>{displayValue(examination.dicomPatientSex)}</strong>
                </div>
                <div className="examination-detail-item">
                  <span>생년월일</span>
                  <strong>{formatDicomDate(examination.dicomPatientBirthDate)}</strong>
                </div>
                <div className="examination-detail-item">
                  <span>검사일</span>
                  <strong>{formatDicomDate(examination.studyDate)}</strong>
                </div>
                <div className="examination-detail-item">
                  <span>검사시간</span>
                  <strong>{formatDicomTime(examination.studyTime)}</strong>
                </div>
                <div className="examination-detail-item">
                  <span>Accession Number</span>
                  <strong>{displayValue(examination.accessionNumber)}</strong>
                </div>
                <div className="examination-detail-item">
                  <span>Study ID</span>
                  <strong>{displayValue(examination.studyID)}</strong>
                </div>
                <div className="examination-detail-item full-width">
                  <span>검사설명</span>
                  <strong>{displayValue(examination.studyDescription)}</strong>
                </div>
                <div className="examination-detail-item full-width">
                  <span>판독의</span>
                  <strong>{displayValue(examination.referringPhysicianName)}</strong>
                </div>
                <div className="examination-detail-item full-width">
                  <span>StudyInstanceUID</span>
                  <strong>{displayValue(examination.studyInstanceUid)}</strong>
                </div>
              </div>

              <h3 className="examination-section-title">Series 목록</h3>
              <div className="examination-table-wrapper">
                <table className="examination-table">
                  <thead>
                    <tr>
                      <th>번호</th>
                      <th>Modality</th>
                      <th>설명</th>
                      <th>Series Number</th>
                      <th>Instance 수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seriesList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="examination-empty-cell">Series 정보가 없습니다.</td>
                      </tr>
                    ) : (
                      seriesList.map((series, index) => (
                        <tr key={series.id}>
                          <td>{index + 1}</td>
                          <td>{displayValue(series.modality)}</td>
                          <td>{displayValue(series.seriesDescription)}</td>
                          <td>{displayValue(series.seriesNumber)}</td>
                          <td>{displayValue(series.instanceCount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default ExaminationView;
