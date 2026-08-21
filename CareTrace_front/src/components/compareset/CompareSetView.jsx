import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../common/api";

function CompareSetView() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [compareData, setCompareData] = useState(null);

  // 오르탕크 서버 기본 주소 (팀 환경에 맞게 수정 필요)
  const ORTHANC_BASE_URL = "http://10.15.21.205:8042"; 
  // 사용하는 오르탕크 뷰어 플러그인 경로 (OSIV 예시)
  const VIEWER_PATH = "/osiv/app/index.html"; 

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/compare-set/view.do?id=${id}`);
        setCompareData(response.data);
      } catch (error) {
        console.error("상세 조회 실패:", error);
        alert("데이터를 불러오지 못했습니다.");
      }
    };
    fetchDetail();
  }, [id]);

  if (!compareData) {
    return <div className="text-center py-5">불러오는 중...</div>;
  }

  return (
    <div className="container-fluid mt-4 px-4">
      <div className="mb-4 pb-2 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold" style={{ color: "#0f4c5c" }}>의료영상 직접 비교</h2>
          <p className="text-secondary mb-0">
            비교 세트 제목: <span className="fw-semibold text-dark">{compareData.title}</span> | 
            환자 ID: <span className="fw-semibold text-dark">{compareData.patientId}</span>
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn text-white px-3"
            style={{ backgroundColor: "#1d8374" }}
            onClick={() => navigate(`/compare-set/update/${compareData.id}`)}
          >
            정보 수정
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            목록으로
          </button>
        </div>
      </div>

      {/* 직접 비교 뷰어 영역 (좌우 iframe 배치) */}
      <div className="row mb-4 g-4">
        {/* 과거 영상 뷰어 */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-header bg-light rounded-top-4 d-flex justify-content-between align-items-center py-3">
              <h5 className="card-title fw-bold mb-0 text-danger">과거 영상</h5>
              <span className="text-muted text-truncate" style={{ maxWidth: "250px", fontSize: "0.9rem" }}>
                UID: {compareData.pastImageUrl}
              </span>
            </div>
            <div className="card-body p-0 ratio ratio-16x9"> 
              {compareData.pastImageUrl ? (
                <iframe
                  src={`${ORTHANC_BASE_URL}${VIEWER_PATH}?study=${compareData.pastImageUrl}`}
                  width="100%"
                  height="100%"
                  title="Past Study Viewer"
                  className="rounded-bottom-4 border-0"
                  style={{ minHeight: "500px" }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center text-secondary bg-light rounded-bottom-4">
                  등록된 과거 영상 UID가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 현재 영상 뷰어 */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-header bg-light rounded-top-4 d-flex justify-content-between align-items-center py-3">
              <h5 className="card-title fw-bold mb-0 text-primary">현재 영상</h5>
              <span className="text-muted text-truncate" style={{ maxWidth: "250px", fontSize: "0.9rem" }}>
                UID: {compareData.currentImageUrl}
              </span>
            </div>
            <div className="card-body p-0 ratio ratio-16x9"> 
              {compareData.currentImageUrl ? (
                <iframe
                  src={`${ORTHANC_BASE_URL}${VIEWER_PATH}?study=${compareData.currentImageUrl}`}
                  width="100%"
                  height="100%"
                  title="Current Study Viewer"
                  className="rounded-bottom-4 border-0"
                  style={{ minHeight: "500px" }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center text-secondary bg-light rounded-bottom-4">
                  등록된 현재 영상 UID가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 정보 및 메모 영역 */}
      <div className="card p-4 shadow-sm border-0 rounded-4 mb-4">
        <div className="mb-3">
          <label className="form-label fw-semibold text-secondary">설명 및 메모</label>
          <div className="form-control bg-light rounded-3" style={{ minHeight: "60px" }}>
            {compareData.description || "등록된 설명이 없습니다."}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompareSetView;