import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageNation from "../common/PageNation";
import api from "../common/api";

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

  useEffect(() => {
    if (!caseId) return;

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

  const goToCase = (event) => {
    event.preventDefault();
    if (!caseIdInput) return;
    navigate(`/lesion/list?caseId=${caseIdInput}`);
  };

  const search = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.set("caseId", caseId);
    if (lesionType) params.set("lesionType", lesionType);
    navigate(`/lesion/list?${params}`);
  };

  if (!caseId) {
    return (
      <main className="lesion-page">
        <div className="lesion-container">
          <section className="lesion-list-card">
            <h1 className="lesion-title">병변·측정 기록</h1>
            <p className="lesion-description">
              증례(2번 검사 모듈) 연동 전까지는 증례 번호를 직접 입력해 조회합니다.
            </p>
            <form className="lesion-search-bar" onSubmit={goToCase}>
              <input
                type="number"
                placeholder="증례 번호를 입력해 주세요"
                value={caseIdInput}
                onChange={(event) => setCaseIdInput(event.target.value)}
              />
              <button className="lesion-primary-button">조회</button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="lesion-page">
      <div className="lesion-container">
        <header className="lesion-header">
          <div>
            <p className="lesion-eyebrow">CareTrace</p>
            <h1 className="lesion-title">병변 목록 (증례 #{caseId})</h1>
            <p className="lesion-description">병변을 등록하고 시기별 측정값을 기록합니다.</p>
          </div>
          <button
            className="lesion-primary-button"
            onClick={() => navigate(`/lesion/write?caseId=${caseId}`)}
          >
            + 병변 등록
          </button>
        </header>

        {errorMessage && <div className="lesion-error-message">{errorMessage}</div>}

        <section className="lesion-list-card">
          <form className="lesion-search-bar" onSubmit={search}>
            <select value={lesionType} onChange={(event) => setLesionType(event.target.value)}>
              <option value="">전체 구분</option>
              <option value="TARGET">TARGET</option>
              <option value="NON_TARGET">NON_TARGET</option>
              <option value="NEW">NEW</option>
            </select>
            <button className="lesion-search-button">검색</button>
            <button
              type="button"
              className="lesion-secondary-button"
              onClick={() => navigate("/lesion/list")}
            >
              다른 증례 조회
            </button>
          </form>

          <p className="lesion-table-summary">총 {pageObject?.totalRow || 0}개 병변</p>
          <div className="lesion-table-wrapper">
            <table className="lesion-table">
              <thead>
                <tr>
                  <th>라벨</th>
                  <th>장기</th>
                  <th>구분</th>
                  <th>림프절</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {lesions.map((lesion) => (
                  <tr key={lesion.lesionId}>
                    <td>{lesion.lesionLabel}</td>
                    <td>{lesion.organ || "-"}</td>
                    <td>{LESION_TYPE_LABEL[lesion.lesionType] || "-"}</td>
                    <td>{lesion.isLymphNode ? "예" : "아니오"}</td>
                    <td className="lesion-action-buttons">
                      <button
                        className="lesion-detail-button"
                        onClick={() => navigate(`/lesion/view?lesionId=${lesion.lesionId}`)}
                      >
                        상세
                      </button>
                      <button
                        className="lesion-edit-button"
                        onClick={() => navigate(`/lesion/update?lesionId=${lesion.lesionId}`)}
                      >
                        수정
                      </button>
                      <button
                        className="lesion-delete-button"
                        onClick={() => navigate(`/lesion/delete?lesionId=${lesion.lesionId}`)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
                {!lesions.length && (
                  <tr>
                    <td colSpan="5" className="lesion-empty-cell">등록된 병변이 없습니다.</td>
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
