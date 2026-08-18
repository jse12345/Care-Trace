import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import PageNation from "../common/PageNation";
import api from "../common/api";

function ConsultationList() {
  const navigate = useNavigate();
  const location = useLocation();
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
    
    if (!params.perPageNum) params.perPageNum = 5;

    api.get("/consultation/list.do", { params })
      .then(({ data }) => {
        if (!active) return;
        
        const rawList = data.list || [];

        const uniqueList = Array.from(
          new Map(rawList.map(item => [item.opinionId || item.opinion_id, item])).values()
        );

// [기존의 그룹화 로직 부분을 아래 코드로 교체해 주세요]
        const groupedData = [];
        const handledIds = new Set();

        // 1. 전체 목록(uniqueList)을 Map으로 만들어 ID로 빠른 조회가 가능하게 함
        const opinionMap = new Map();
        uniqueList.forEach(item => {
          const id = item.opinionId || item.opinion_id;
          opinionMap.set(id, { ...item, responses: [] });
        });

        // 2. 각 아이템을 최상위 원글(Root) 하위로 완벽하게 조립하는 함수 (재귀적 탐색)
        const rootMap = new Map(); // 원글 ID별로 자식들을 관리

        uniqueList.forEach(item => {
          const id = item.opinionId || item.opinion_id;
          if (handledIds.has(id)) return;

          let current = item;
          let parentId = current.parentOpinionId || current.parent_opinion_id;

          // 부모가 존재한다면 최상위 부모(Root)가 누구인지 끝까지 거슬러 올라감
          while (parentId && opinionMap.has(parentId)) {
            current = opinionMap.get(parentId);
            parentId = current.parentOpinionId || current.parent_opinion_id;
          }

          const rootId = current.opinionId || current.opinion_id;

          // 만약 최상위 원글이 현재 페이지 목록에 존재한다면 하나의 스레드로 묶어줌
          if (opinionMap.has(rootId)) {
            if (!rootMap.has(rootId)) {
              rootMap.set(rootId, opinionMap.get(rootId));
            }
          } else {
            // 최상위 원글이 현재 페이지에 아예 없다면 단독 응답으로 처리
            handledIds.add(id);
            groupedData.push({ ...item, isStandaloneResponse: true, responses: [] });
          }
        });

        // 3. 최상위 원글(Root)마다 딸려 있는 모든 하위 답변(대댓글 포함)들을 평탄화하여 수집
        rootMap.forEach((rootItem, rootId) => {
          handledIds.add(rootId);
          
          const collectDescendants = (targetParentId, acc) => {
            uniqueList.forEach(child => {
              const childParentId = child.parentOpinionId || child.parent_opinion_id;
              const childId = child.opinionId || child.opinion_id;
              if (childParentId === targetParentId && !handledIds.has(childId)) {
                handledIds.add(childId);
                acc.push(child);
                collectDescendants(childId, acc);
              }
            });
          };

          const allDescendants = [];
          collectDescendants(rootId, allDescendants);

          // 작성일 과거순(먼저 쓴 것이 위로) 정렬
          allDescendants.sort((a, b) => new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at));

          groupedData.push({
            ...rootItem,
            responses: allDescendants
          });
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
    params.set("perPageNum", "5"); 
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
          {/* [수정 1] disabled 제거 및 url 직접 라우팅 처리 */}
          <button 
            className="primary-button" 
            onClick={() => navigate(caseId ? `/consultation/write?caseId=${caseId}` : '/consultation/write')}
          >
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
                      {/* [수정 2] Case ID 대신 환자 이름 노출 (백엔드에서 patientName을 보내준다고 가정, 없을 경우 Case ID 폴백) */}
                      {!caseId && (
                        <span style={{ backgroundColor: '#e9ecef', color: '#495057', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          {group.patientName ? `${group.patientName} 환자` : `Case ID: ${group.caseId}`}
                        </span>
                      )}
                      {group.isStandaloneResponse && <span style={{ color: '#0056b3', fontWeight: 'bold' }}>[단독 응답]</span>}
                      <span className={`type-badge badge-${type?.toLowerCase()}`}>{type}</span>
                      <span className={`status-badge badge-${group.status?.toLowerCase()}`}>{group.status}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6c757d', display: 'flex', gap: '16px' }}>
                      {/* [수정 3] "작성자:" 텍스트 삭제. 응답(RESPONSE)과 형식 통일 */}
                      <span>{group.staffName || "이름 없음"}</span>
                      <span>{date ? new Date(date).toLocaleDateString() : ""}</span>
                    </div>
                  </div>

                  <div className="card-body" style={{ fontSize: '1rem', lineHeight: '1.6', color: '#333', marginBottom: '16px' }}>
                    {content}
                  </div>

                  <div className="card-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: group.responses?.length ? '24px' : '0' }}>
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
                                  {/* [수정 3] 여기도 작성자 이름만 노출되도록 유지 */}
                                  <span>{res.staffName || "이름 없음"}</span>
                                  <span>{resDate ? new Date(resDate).toLocaleDateString() : ""}</span>
                                </div>
                              </div>
                              <div style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#495057', marginBottom: '12px' }}>
                                {resContent}
                              </div>
                              <div style={{ textAlign: 'right' }}>
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