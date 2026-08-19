import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../common/api";

/**
 * 검사(Examination) 목록 화면.
 * MariaDB에 동기화된 Orthanc Study 목록을 보여준다. "동기화" 버튼으로 Orthanc 서버의
 * 최신 Study/Series를 다시 가져와 DB에 반영할 수 있다(webjjang 프로젝트의 PacsList.jsx 참고).
 */
function ExaminationList() {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api.get("/examination/list.do")
      .then((response) => { if (active) setExaminations(Array.isArray(response.data) ? response.data : []); })
      .catch((error) => {
        console.error("검사 목록 조회 오류 : ", error);
        if (active) setErrorMessage("검사 목록을 불러오지 못했습니다.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const displayValue = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "string" && value.trim() === "") return "-";
    return value;
  };

  // DICOM 날짜(YYYYMMDD) -> YYYY-MM-DD
  const formatDicomDate = (date) => {
    if (!date || date.length !== 8) return "-";
    return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
  };

  const handleSync = async () => {
    setSyncing(true);
    setErrorMessage("");
    try {
      const { data } = await api.post("/examination/sync.do");
      if (data.alreadyRunning) {
        alert("이미 동기화가 진행 중입니다. 잠시 후 다시 시도해 주세요.");
      } else {
        alert(
          `Orthanc 검사 동기화가 완료되었습니다.\n` +
          `(전체 ${data.totalCount} / 신규 ${data.savedCount} / 갱신 ${data.updatedCount} / 실패 ${data.failedCount})`
        );
        const response = await api.get("/examination/list.do");
        setExaminations(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("검사 동기화 오류 : ", error);
      setErrorMessage("검사 동기화에 실패했습니다. Orthanc 서버 연결을 확인해 주세요.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <main className="examination-page">
      <div className="examination-container">
        <header className="examination-header">
          <div>
            <p className="examination-eyebrow">CareTrace</p>
            <h1 className="examination-title">검사(Examination) 목록</h1>
            <p className="examination-description">
              Orthanc PACS 서버와 동기화된 검사 목록입니다. 총 {examinations.length}건.
            </p>
          </div>
          <div className="examination-header-actions">
            <button
              type="button"
              className="examination-primary-button"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? "동기화 중..." : "동기화"}
            </button>
          </div>
        </header>

        {errorMessage && <div className="examination-error-message">{errorMessage}</div>}

        <section className="examination-list-card">
          <div className="examination-table-wrapper">
            <table className="examination-table">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>환자ID</th>
                  <th>환자명</th>
                  <th>성별</th>
                  <th>검사일</th>
                  <th>검사설명</th>
                  <th>Series 수</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="examination-empty-cell">불러오는 중...</td>
                  </tr>
                ) : examinations.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="examination-empty-cell">
                      조회된 검사 데이터가 없습니다. "동기화" 버튼을 눌러 Orthanc에서 가져와 주세요.
                    </td>
                  </tr>
                ) : (
                  examinations.map((exam, index) => (
                    <tr key={exam.id}>
                      <td>{index + 1}</td>
                      <td>{displayValue(exam.dicomPatientId)}</td>
                      <td>{displayValue(exam.dicomPatientName)}</td>
                      <td>{displayValue(exam.dicomPatientSex)}</td>
                      <td>{formatDicomDate(exam.studyDate)}</td>
                      <td>{displayValue(exam.studyDescription)}</td>
                      <td>{displayValue(exam.seriesCount)}</td>
                      <td>
                        {exam.stable ? (
                          <span className="examination-status-badge stable">완료</span>
                        ) : (
                          <span className="examination-status-badge pending">대기</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="examination-detail-button"
                          onClick={() => navigate(`/examination/view?id=${exam.id}`)}
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ExaminationList;
