import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../common/api";

function CompareSetView() {
  const { id } = useParams(); // URL에서 전달된 id 추출
  const navigate = useNavigate();
  const [compareData, setCompareData] = useState(null);

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
    <div className="container pt-5 mt-4" style={{ maxWidth: "800px" }}>
      <div className="mb-4 pb-2 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold" style={{ color: "#0f4c5c" }}>의료영상 비교 세트 상세</h2>
          <p className="text-secondary mb-0">선택한 비교 세트의 상세 정보입니다.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          목록으로
        </button>
      </div>

      <div className="card p-4 shadow-sm border-0 rounded-4">
        <div className="mb-3">
          <label className="form-label fw-semibold text-secondary">환자 ID</label>
          <div className="form-control bg-light rounded-3">{compareData.patientId}</div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold text-secondary">비교 세트 제목</label>
          <div className="form-control bg-light rounded-3 fw-bold">{compareData.title}</div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold text-secondary">과거 영상 경로 (StudyInstanceUID)</label>
          <div className="form-control bg-light rounded-3 text-truncate">{compareData.pastImageUrl}</div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold text-secondary">현재 영상 경로 (StudyInstanceUID)</label>
          <div className="form-control bg-light rounded-3 text-truncate">{compareData.currentImageUrl}</div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-secondary">설명 및 메모</label>
          <div className="form-control bg-light rounded-3" style={{ minHeight: "80px" }}>
            {compareData.description || "등록된 설명이 없습니다."}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn text-white flex-fill py-2 fw-semibold rounded-3"
            style={{ backgroundColor: "#1d8374" }}
            onClick={() => navigate(`/compare-set/update/${compareData.id}`)}
          >
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompareSetView;