import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom"; // useLocation 추가
import PageNation from "../common/PageNation";
import api from "../common/api";

function ConsultationList() {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 URL 경로 및 쿼리스트링 정보를 가져오기 위함
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get("caseId") || searchParams.get("case_id");
  const [groupedOpinions, setGroupedOpinions] = useState([]);
  const [pageObject, setPageObject] = useState(null);
  
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    status: searchParams.get("status") || "",
  });

  useEffect(() => {
    let active = true;
    const params = Object.fromEntries(searchParams.entries());
    
    // [수정] 한 페이지에 5개씩 불러오도록 파라미터 강제 추가
    if (!params.perPageNum) params.perPageNum = 5;

    api.get("/consultation/list.do", { params })
      .then(({ data }) => {
        if (!active) return;
        
        const rawList = data.list || [];

        // 1. DB 중복 데이터 제거 (opinionId 기준)
        const uniqueList = Array.from(
          new Map(rawList.map(item => [item.opinionId || item.opinion_id, item])).values()
        );

        // 2. 카드 UI를 위한 데이터 그룹화 및 중복 렌더링 방지 버그 수정본
        const groupedData = [];
        const handledIds = new Set();

        const parentIdsInPage = new Set(
          uniqueList
            .filter(item => (item.opinionType || item.opinion_type) === 'REQUEST' || !(item.parentOpinionId || item.parent_opinion_id))
            .map(item => item.opinionId || item.opinion_id)
        );

        uniqueList.forEach(item => {
          const id = item.opinionId || item.opinion_id;
          if (handledIds.has(id)) return;

          const opType = item.opinionType || item.opinion_type;
          const parentId = item.parentOpinionId || item.parent_opinion_id;

          if (opType === 'REQUEST' || !parentId) {
            handledIds.add(id);

            const children = uniqueList.filter(child => {
              const childParentId = child.parentOpinionId || child.parent_opinion_id;
              return childParentId === id;
            });

            // 자식 답변들은 과거순(먼저 쓴 글이 위로)으로 정렬하여 대화 흐름을 자연스럽게 만듦
            children.sort((a, b) => new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at));
            children.forEach(child => handledIds.add(child.opinionId || child.opinion_id));
            
            groupedData.push({ ...item, responses: children });
          } 
          else if (opType === 'RESPONSE' && parentId && !parentIdsInPage.has(parentId)) {
            handledIds.add(id);
            groupedData.push({ ...item, isStandaloneResponse: true, responses: [] });
          }
        });

        setGroupedOpinions(groupedData);
        setPageObject(data.pageObject || null);
      })
      .catch((error) => console.error("협진 목록 조회 실패:", error));
    return () => { active = false; };
  }, [searchParams]);

  const change = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const search = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (caseId) params.set("caseId", caseId);
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);
    params.set("perPageNum", "5"); // 검색 시에도 5개 유지
    navigate(`/consultation/list?${params.toString()}`);
  };

  const reset = () => {
    setFilters({ type: "", status: "" });
    const url = caseId ? `/consultation/list?caseId=${caseId}&perPageNum=5` : `/consultation/list?perPageNum=5`;
    navigate(url);
  };

  return (
    <main className="department-page">
      <div className="department-container">
        <header className="department-header">
          <div>
            <p className="department-eyebrow">CareTrace Consultation</p>
            <h1 className="department-title">협진 의견 목록</h1>
            <p className="department-description">
              {caseId ? "해당 증례에 대한 협진 진행 경과를 한눈에 파악할 수 있습니다." : "전체 협진 요청 및 응답 내역을 확인합니다."}
            </p>
          </div>
          <button className="primary-button" onClick={() => navigate(caseId ? `/consultation/write?caseId=${caseId}` : '#')} disabled={!caseId}>
            + 협진 요청
          </button>
        </header>

        <section className="list-card">
          <form className="search-bar" onSubmit={search}>
            <select name="type" value={filters.type} onChange={change}>
              <option value="">전체 구분</option>
              <option value="REQUEST">요청 (REQUEST)</option>
              <option value="RESPONSE">응답 (RESPONSE)</option>
            </select>
            <select name="status" value={filters.status} onChange={change}>
              <option value="">전체 상태</option>
              <option value="OPEN">대기중 (OPEN)</option>
              <option value="ANSWERED">답변완료 (ANSWERED)</option>
              <option value="CLOSED">종료/철회 (CLOSED)</option>
            </select>
            <button className="search-button">검색</button>
            <button type="button" className="secondary-button" onClick={reset}>초기화</button>
          </form>

          <div className="card-list-wrapper" style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {groupedOpinions.map((group) => {
              const id = group.opinionId || group.opinion_id;
              const type = group.opinionType || group.opinion_type;
              const content = group.opinionContent || group.opinion_content;
              const date = group.createdAt || group.created_at;

              return (
                <article 
                  key={id} 
                  className="consultation-card" 
                  style={{ border: '1px solid #e0e4e8', borderRadius: '12px', padding: '24px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
                >
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f3f5', paddingBottom: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {/* [수정] 전체 목록일 때만 Case ID 표시 */}
                      {!caseId && group.caseId && (
                        <span style={{ backgroundColor: '#e9ecef', color: '#495057', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          Case ID: {group.caseId}
                        </span>
                      )}
                      {group.isStandaloneResponse && <span style={{ color: '#0056b3', fontWeight: 'bold' }}>[단독 응답]</span>}
                      <span className={`type-badge badge-${type?.toLowerCase()}`}>{type}</span>
                      <span className={`status-badge badge-${group.status?.toLowerCase()}`}>{group.status}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d', display: 'flex', gap: '16px' }}>
                      <span><strong>작성자:</strong> {group.staffName || "이름 없음"}</span>
                      <span>{date ? new Date(date).toLocaleDateString() : ""}</span>
                    </div>
                  </div>

                  <div className="card-body" style={{ fontSize: '1rem', lineHeight: '1.6', color: '#333', marginBottom: '16px' }}>
                    {content}
                  </div>

                  <div className="card-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: group.responses?.length ? '24px' : '0' }}>
                    {/* [수정] 상세 보기 버튼 클릭 시 현재 URL 상태를 같이 넘겨줌 */}
                    <button 
                      className="detail-button" 
                      onClick={() => navigate(`/consultation/view?opinionId=${id}`, { state: { returnUrl: location.pathname + location.search } })}
                    >
                      상세 보기
                    </button>
                  </div>

                  {group.responses && group.responses.length > 0 && (
                    <div className="responses-container" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#495057' }}>관련 답변 ({group.responses.length})</h4>
                      
                      {group.responses.map(res => {
                        const resId = res.opinionId || res.opinion_id;
                        const resType = res.opinionType || res.opinion_type;
                        const resContent = res.opinionContent || res.opinion_content;
                        const resDate = res.createdAt || res.created_at;

                        return (
                          <div key={resId} className="response-item" style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: '#ffffff', border: '1px solid #e9ecef', borderRadius: '6px' }}>
                            <div style={{ color: '#adb5bd', fontSize: '1.2rem', fontWeight: 'bold', paddingTop: '2px' }}>↳</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <span className={`type-badge badge-${resType?.toLowerCase()}`}>{resType}</span>
                                  <span className={`status-badge badge-${res.status?.toLowerCase()}`}>{res.status}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#6c757d', display: 'flex', gap: '12px' }}>
                                  <span>{res.staffName || "이름 없음"}</span>
                                  <span>{resDate ? new Date(resDate).toLocaleDateString() : ""}</span>
                                </div>
                              </div>
                              <div style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#495057', marginBottom: '12px' }}>
                                {resContent}
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                {/* [수정] 자식 글 상세 보기 시에도 동일하게 리턴 URL 넘김 */}
                                <button 
                                  className="secondary-button" 
                                  style={{ padding: '6px 12px', fontSize: '0.85rem' }} 
                                  onClick={() => navigate(`/consultation/view?opinionId=${resId}`, { state: { returnUrl: location.pathname + location.search } })}
                                >
                                  답변 상세
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            })}

            {!groupedOpinions.length && (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8f9fa', borderRadius: '12px', color: '#6c757d', border: '1px dashed #ced4da' }}>
                등록된 협진 의견이 없습니다.
              </div>
            )}
          </div>
          
          {pageObject && (
            <div style={{ marginTop: '30px' }}>
              <PageNation pageObject={pageObject} listPath="/consultation/list" extraParams={filters} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default ConsultationList;