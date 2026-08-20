import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import api from "../common/api";

function ConsultationView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryOpinionId = searchParams.get("opinionId") || searchParams.get("opinion_id");
  
  const [threadParent, setThreadParent] = useState(null);
  const [threadResponses, setThreadResponses] = useState([]);
  
  const [replyTarget, setReplyTarget] = useState(null); 
  const [responseContent, setResponseContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [currentStaffId, setCurrentStaffId] = useState(null);

  useEffect(() => {
    try {
      const loginData = JSON.parse(localStorage.getItem("login"));
      if (loginData && (loginData.staffNo || loginData.id)) {
        setCurrentStaffId(loginData.staffNo || loginData.id);
      } else {
        setCurrentStaffId(1); 
      }
    } catch (e) {
      console.error("로그인 정보 파싱 실패", e);
      setCurrentStaffId(1);
    }
  }, []);

  useEffect(() => {
    if (queryOpinionId) {
      fetchOpinionAndThread();
    }
  }, [queryOpinionId]);

  const fetchOpinionAndThread = async () => {
    try {
      const { data: targetOp } = await api.get("/consultation/view.do", { params: { opinionId: queryOpinionId } });
      const cId = targetOp.caseId || targetOp.case_id;

      const { data: listData } = await api.get("/consultation/list.do", { params: { caseId: cId, perPageNum: 100 } });
      const allOps = listData.list || [];

      let rootId = targetOp.opinionId || targetOp.opinion_id;
      let currentIter = targetOp;
      
      while (currentIter.parentOpinionId || currentIter.parent_opinion_id) {
        const pId = currentIter.parentOpinionId || currentIter.parent_opinion_id;
        const parentOp = allOps.find(o => (o.opinionId || o.opinion_id) === pId);
        if (parentOp) {
          currentIter = parentOp;
          rootId = parentOp.opinionId || parentOp.opinion_id;
        } else {
          break; 
        }
      }

      const rootOp = allOps.find(o => (o.opinionId || o.opinion_id) === rootId) || targetOp;

      const descendants = [];
      const findChildren = (parentId, depth) => {
        const children = allOps.filter(o => (o.parentOpinionId || o.parent_opinion_id) === parentId);
        children.sort((a, b) => new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at));
        
        children.forEach(child => {
          descendants.push({ ...child, depth });
          findChildren(child.opinionId || child.opinion_id, depth + 1);
        });
      };
      
      findChildren(rootId, 1);

      setThreadParent(rootOp);
      setThreadResponses(descendants);
      setReplyTarget(rootOp); 
      
    } catch (error) {
      setErrorMessage("협진 의견 스레드를 불러오는 중 오류가 발생했습니다.");
    }
  };

  const goBackToList = () => {
    const cId = threadParent?.caseId || threadParent?.case_id;
    const returnUrl = location.state?.returnUrl || (cId ? `/consultation/list?caseId=${cId}` : "/consultation/list");
    navigate(returnUrl);
  };

  const handleResponseSubmit = async (event) => {
    event.preventDefault();
    if (!replyTarget || !currentStaffId) return;

    try {
      await api.post("/consultation/reply.do", {
        caseId: threadParent.caseId || threadParent.case_id,
        parentOpinionId: replyTarget.opinionId || replyTarget.opinion_id,
        opinionType: "RESPONSE",
        opinionContent: responseContent,
        staffId: currentStaffId
      });
      alert("답변이 성공적으로 등록되었습니다.");
      setResponseContent("");
      fetchOpinionAndThread(); 
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "답변 등록 실패");
    }
  };

  const handleDelete = async (opId) => {
    if(!window.confirm("이 의견을 철회(삭제) 하시겠습니까?")) return;
    
    try {
      await api.post("/consultation/delete.do", { opinionId: opId });
      alert("의견이 철회되었습니다.");
      
      if (opId === (threadParent.opinionId || threadParent.opinion_id)) {
        goBackToList();
      } else {
        fetchOpinionAndThread(); 
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "철회 중 오류가 발생했습니다.");
    }
  };

  if (!threadParent) return <div className="department-container">스레드 로딩 중...</div>;

  const renderOpinionCard = (op, isRoot) => {
    const opId = op.opinionId || op.opinion_id;
    const opType = op.opinionType || op.opinion_type;
    const opContent = op.opinionContent || op.opinion_content;
    const createdAt = op.createdAt || op.created_at;
    const authorId = op.staffId || op.staff_id;
    const depth = op.depth || 0;

    return (
      <div key={opId} style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        backgroundColor: isRoot ? '#ffffff' : '#f8f9fa', 
        border: isRoot ? '1px solid #ced4da' : '1px solid #e9ecef',
        borderRadius: '8px',
        marginLeft: isRoot ? '0' : `${(depth - 1) * 30}px`,
        boxShadow: isRoot ? '0 2px 4px rgba(0,0,0,0.02)' : 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!isRoot && depth > 1 && <span style={{ color: '#adb5bd', fontWeight: 'bold', fontSize: '1.2rem', marginRight: '5px' }}>↳</span>}
            <span className={`type-badge badge-${opType?.toLowerCase()}`}>{opType}</span>
            <span className={`status-badge badge-${op.status?.toLowerCase()}`}>{op.status}</span>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
            <span style={{ marginRight: '15px', fontWeight: '500', color: '#343a40' }}>{op.staffName || "이름 없음"}</span>
            <span>{new Date(createdAt).toLocaleString()}</span>
          </div>
        </div>
        
        <div style={{ fontSize: '1rem', lineHeight: '1.6', color: '#212529', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
          {opContent}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          {threadParent.status !== 'CLOSED' && (
            <button 
              type="button" 
              className="secondary-button" 
              style={{ padding: '6px 12px', fontSize: '0.85rem' }} 
              onClick={() => {
                setReplyTarget(op);
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); 
              }}
            >
              이 의견에 답변 달기
            </button>
          )}
          {Number(authorId) === Number(currentStaffId) && (
            <button 
              type="button" 
              className="delete-button" 
              style={{ padding: '6px 12px', fontSize: '0.85rem' }} 
              onClick={() => handleDelete(opId)}
            >
              철회(삭제)
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="department-page">
      <div className="department-container">
        <section className="form-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '30px' }}>
          <div className="form-card-header" style={{ marginBottom: '30px' }}>
            <h2>협진 의견 스레드</h2>
            <button className="close-button" onClick={goBackToList}>×</button>
          </div>
          
          {errorMessage && <div className="error-message" style={{ marginBottom: '20px' }}>{errorMessage}</div>}
          
          {/* 1. 최상위 원글 렌더링 (헤더 변경) */}
          <div style={{ marginBottom: '10px' }}>
            <h3 style={{ 
              fontSize: '1.15rem', 
              color: '#212529', 
              marginBottom: '15px', 
              borderBottom: '2px solid var(--clinical-blue, #176b87)', 
              paddingBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>📋</span>
              <strong>{threadParent.patientName ? `${threadParent.patientName} 환자` : "환자 정보"}</strong>
              <span style={{ color: '#adb5bd', fontWeight: 'normal', fontSize: '1rem' }}>|</span>
              <span style={{ color: '#495057', fontSize: '1rem' }}>
                진료기록 증례 (Case ID: {threadParent.caseId || threadParent.case_id})
              </span>
            </h3>
            {renderOpinionCard(threadParent, true)}
          </div>

          {/* 2. 하위 답변 스레드 렌더링 */}
          {threadResponses.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#495057', marginBottom: '15px', borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>진행 내역 ({threadResponses.length})</h3>
              <div style={{ paddingLeft: '10px', borderLeft: '3px solid var(--clinical-blue, #176b87)', marginLeft: '10px' }}>
                {threadResponses.map(res => renderOpinionCard(res, false))}
              </div>
            </div>
          )}

          {/* 3. 답변 작성 폼 */}
          {threadParent.status !== 'CLOSED' && replyTarget && (
            <form onSubmit={handleResponseSubmit} style={{ marginTop: '40px', padding: '24px', backgroundColor: '#eef6fc', borderRadius: '8px', border: '1px solid #cce5ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--clinical-blue, #176b87)', margin: 0 }}>
                  {replyTarget.opinionId === threadParent.opinionId 
                    ? "📌 원글에 대한 답변 작성" 
                    : `📌 [${replyTarget.staffName}] 님의 의견에 대한 추가 답변 작성`}
                </h3>
                {replyTarget.opinionId !== threadParent.opinionId && (
                  <button type="button" onClick={() => setReplyTarget(threadParent)} style={{ background: 'none', border: 'none', color: '#6c757d', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}>
                    원글에 답변하기로 전환
                  </button>
                )}
              </div>
              
              <div className="form-grid">
                <label className="full-width">
                  <textarea 
                    value={responseContent} 
                    onChange={(e) => setResponseContent(e.target.value)} 
                    required 
                    maxLength="300" 
                    placeholder="환자 상태, 판독 결과 등 전문적인 소견을 작성해 주세요."
                    style={{ minHeight: '120px', width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #b8daff' }}
                  />
                </label>
              </div>
              <div className="form-actions" style={{ borderTop: 'none', marginTop: '15px', padding: 0 }}>
                <button type="submit" className="primary-button">답변 등록 완료</button>
              </div>
            </form>
          )}

          <div className="form-actions" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e9ecef', justifyContent: 'center' }}>
            <button className="secondary-button" style={{ width: '200px' }} onClick={goBackToList}>목록으로 돌아가기</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ConsultationView;