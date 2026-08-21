import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiList } from "react-icons/fi";
import PageNation from "../common/PageNation";
import api from "../common/api";
import Breadcrumb from "../common/Breadcrumb";

const LESION_TYPE_LABEL = {
  TARGET: "TARGET",
  NON_TARGET: "NON_TARGET",
  NEW: "NEW",
};

function LesionList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get("caseId");
  const [caseIdInput, setCaseIdInput] = useState(caseId || "");
  const [lesions, setLesions] = useState([]);
  const [pageObject, setPageObject] = useState(null);
  const [lesionType, setLesionType] = useState(searchParams.get("lesionType") || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [caseInfo, setCaseInfo] = useState(null);

  useEffect(() => {
    let active = true;
    const params = Object.fromEntries(searchParams.entries());

    api.get("/lesion/list.do", { params })
      .then(({ data }) => {
        if (!active) return;
        setLesions(data.list || []);
        setPageObject(data.pageObject || null);
      })
      .catch(() => {
        if (active) setErrorMessage("병변 목록을 불러오지 못했습니다.");
      });

    return () => { active = false; };
  }, [caseId, searchParams]);

  useEffect(() => {
    if (!caseId) return;

    let active = true;

    api.get(`/patient-cases/${caseId}`)
      .then(({ data }) => {
        if (active) setCaseInfo(data);
      })
      .catch(() => {
        if (active) setCaseInfo(null);
      });

    return () => { active = false; };
  }, [caseId]);

  const search = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (caseIdInput) params.set("caseId", caseIdInput);
    if (lesionType) params.set("lesionType", lesionType);
    navigate(`/lesion/list?${params}`);
  };

  const clearFilters = () => {
    setCaseIdInput("");
    setLesionType("");
    navigate("/lesion/list");
  };

  return (
    <main className="lesion-page">
      <div className="lesion-container">
        {caseId && (
          <Breadcrumb
            items={[
              {
                label: caseInfo ? (caseInfo.patientName || `환자 ${caseInfo.patientId}`) : `환자 #${caseId}`,
                to: `/patient-cases/${caseId}`,
              },
              { label: "병변 목록" },
            ]}
          />
        )}
        <header className="lesion-header">
          <div>
            <p className="lesion-eyebrow">CareTrace</p>
            <h1 className="lesion-title">병변 목록</h1>
            <p className="lesion-description"></p>
          </div>
          <button
            className="lesion-primary-button"
            onClick={() => navigate(caseId ? `/lesion/write?caseId=${caseId}` : "/lesion/write")}
          >
            + 병변 등록
          </button>
        </header>

        {caseId && caseInfo && (
          <section className="lesion-list-card">
            <div className="lesion-detail-grid">
              <div className="lesion-detail-item"><span>환자</span><strong>{caseInfo.patientName || `환자 ${caseInfo.patientId}`}</strong></div>
              <div className="lesion-detail-item"><span>담당의사</span><strong>{caseInfo.staffName || `의료진 ${caseInfo.staffNo}`}</strong></div>
              <div className="lesion-detail-item"><span>진단명</span><strong>{caseInfo.diagnosis}</strong></div>
              <div className="lesion-detail-item"><span>병변 부위</span><strong>{caseInfo.bodyPart || "-"}</strong></div>
              <div className="lesion-detail-item"><span>추적 시작일</span><strong>{caseInfo.startDate}</strong></div>
            </div>
          </section>
        )}

        {errorMessage && <div className="lesion-error-message">{errorMessage}</div>}

        <section className="lesion-list-card">
          <form className="lesion-search-bar" onSubmit={search}>
            <input
              type="number"
              placeholder="case_id"
              value={caseIdInput}
              onChange={(event) => setCaseIdInput(event.target.value)}
            />
            <select value={lesionType} onChange={(event) => setLesionType(event.target.value)}>
              <option value="">전체 구분</option>
              <option value="TARGET">TARGET</option>
              <option value="NON_TARGET">NON_TARGET</option>
              <option value="NEW">NEW</option>
            </select>
            <button className="lesion-search-button">검색</button>
            <button type="button" className="lesion-secondary-button" onClick={clearFilters}>
              필터 초기화
            </button>
          </form>

          <p className="lesion-table-summary">총 {pageObject?.totalRow || 0}개 병변</p>
          <div className="lesion-table-wrapper">
            <table className="lesion-table">
              <thead>
                <tr>
                  <th>환자</th>
                  <th>라벨</th>
                  <th>장기</th>
                  <th>구분</th>
                  <th>림프절</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {lesions.map((lesion) => (
                  <tr
                    key={lesion.lesionId}
                    className="lesion-row-clickable"
                    onClick={() => navigate(`/lesion/view?lesionId=${lesion.lesionId}`)}
                  >
                    <td>{lesion.patientName || "-"}</td>
                    <td>{lesion.lesionLabel}</td>
                    <td>{lesion.organ || "-"}</td>
                    <td>{LESION_TYPE_LABEL[lesion.lesionType] || "-"}</td>
                    <td>{lesion.isLymphNode ? "O" : "X"}</td>
                    <td className="lesion-action-buttons">
                      <button
                        className="lesion-measurement-button"
                        title="측정값 목록"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/lesion/measurement/list?lesionId=${lesion.lesionId}`);
                        }}
                      >
                        <FiList aria-hidden="true" /> 측정값 목록
                      </button>
                    </td>
                  </tr>
                ))}
                {!lesions.length && (
                  <tr>
                    <td colSpan="6" className="lesion-empty-cell">등록된 병변이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pageObject && (
            <PageNation
              pageObject={pageObject}
              listPath="/lesion/list"
              extraParams={{ caseId, lesionType }}
            />
          )}
        </section>
      </div>
    </main>
  );
}

export default LesionList;
