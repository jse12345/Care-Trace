import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageNation from "../common/PageNation";
import api from "../common/api";
import Breadcrumb from "../common/Breadcrumb";

// mm 값이 있으면 mm으로, 없으면(PixelSpacing 정보 부재) px 값으로 대체 표시한다.
function formatAxis(mmValue, pxValue, mmUnit, pxUnit) {
  if (mmValue != null) return `${mmValue} ${mmUnit}`;
  if (pxValue != null) return `${pxValue} ${pxUnit}`;
  return "-";
}

function MeasurementList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lesionId = searchParams.get("lesionId");

  const [measurements, setMeasurements] = useState([]);
  const [pageObject, setPageObject] = useState(null);
  const [changeRateByMeasurementId, setChangeRateByMeasurementId] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [caseId, setCaseId] = useState(null);
  const [caseInfo, setCaseInfo] = useState(null);

  useEffect(() => {
    if (!lesionId) return;
    let active = true;
    api.get("/lesion/view.do", { params: { lesionId } })
      .then(({ data }) => { if (active) setCaseId(data.caseId); })
      .catch(() => { if (active) setCaseId(null); });
    return () => { active = false; };
  }, [lesionId]);

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

  useEffect(() => {
    if (!lesionId) return;
    let active = true;
    const params = Object.fromEntries(searchParams.entries());

    // 목록(페이징)과 추세(변화율)를 병렬 호출해서 화면에서 merge
    Promise.all([
      api.get("/lesion-measurement/list.do", { params }),
      api.get("/lesion-measurement/trend.do", { params: { lesionId } }),
    ])
      .then(([listRes, trendRes]) => {
        if (!active) return;
        setMeasurements(listRes.data.list || []);
        setPageObject(listRes.data.pageObject || null);

        const map = {};
        (trendRes.data.list || []).forEach((item) => {
          map[item.measurementId] = item;
        });
        setChangeRateByMeasurementId(map);
      })
      .catch(() => {
        if (active) setErrorMessage("측정값 목록을 불러오지 못했습니다.");
      });

    return () => { active = false; };
  }, [lesionId, searchParams]);

  if (!lesionId) {
    return (
      <main className="lesion-page">
        <div className="lesion-container">
          <p className="lesion-description">lesionId가 없습니다. 병변 상세 화면에서 접근해 주세요.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="lesion-page">
      <div className="lesion-container">
        {caseId && (
          <Breadcrumb
            items={[
              {
                label: caseInfo ? (caseInfo.patientName || `환자 ${caseInfo.patientId}`) : `환자 #${caseId}`,
                to: `/lesion/list?caseId=${caseId}`,
              },
              { label: "병변 목록", to: `/lesion/list?caseId=${caseId}` },
              { label: "측정값 목록" },
            ]}
          />
        )}
        <header className="lesion-header">
          <div>
            <p className="lesion-eyebrow">CareTrace</p>
            <h1 className="lesion-title">측정값 목록</h1>
            <p className="lesion-description">시기별로 등록된 병변 측정값을 확인합니다.</p>
          </div>
          <div className="lesion-header-actions">
            <button className="lesion-primary-button" onClick={() => navigate(`/lesion/measurement/capture?lesionId=${lesionId}`)}>
              + 측정값 등록
            </button>
            <button className="lesion-secondary-button" onClick={() => navigate(`/lesion/measurement/trend?lesionId=${lesionId}`)}>
              변화 추세 보기
            </button>
            <button className="lesion-secondary-button" onClick={() => navigate(`/lesion/view?lesionId=${lesionId}`)}>
              병변 상세로
            </button>
          </div>
        </header>

        {errorMessage && <div className="lesion-error-message">{errorMessage}</div>}

        <section className="lesion-list-card">
          <p className="lesion-table-summary">총 {pageObject?.totalRow || 0}건</p>
          <div className="lesion-table-wrapper">
            <table className="lesion-table">
              <thead>
                <tr>
                  <th>측정 일시</th>
                  <th>ROI 유형</th>
                  <th>장축</th>
                  <th>단축</th>
                  <th>면적</th>
                  <th>변화율</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((measurement) => {
                  const trend = changeRateByMeasurementId[measurement.measurementId];
                  return (
                    <tr
                      key={measurement.measurementId}
                      className="lesion-row-clickable"
                      onClick={() => navigate(`/lesion/measurement/view?measurementId=${measurement.measurementId}`)}
                    >
                      <td>{measurement.measuredAt?.replace("T", " ").slice(0, 16)}</td>
                      <td>{measurement.roiType}</td>
                      <td>{formatAxis(measurement.longAxisMm, measurement.longAxisPx, "mm", "px")}</td>
                      <td>{formatAxis(measurement.shortAxisMm, measurement.shortAxisPx, "mm", "px")}</td>
                      <td>{formatAxis(measurement.areaMm2, measurement.areaPx2, "mm²", "px²")}</td>
                      <td>
                        {trend?.baseline
                          ? "기준값"
                          : trend?.changeRatePercent != null
                            ? `${trend.changeRatePercent > 0 ? "+" : ""}${trend.changeRatePercent}%`
                            : "-"}
                      </td>
                    </tr>
                  );
                })}
                {!measurements.length && (
                  <tr><td colSpan="6" className="lesion-empty-cell">등록된 측정값이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {pageObject && (
            <PageNation
              pageObject={pageObject}
              listPath="/lesion/measurement/list"
              extraParams={{ lesionId }}
            />
          )}
        </section>
      </div>
    </main>
  );
}

export default MeasurementList;
