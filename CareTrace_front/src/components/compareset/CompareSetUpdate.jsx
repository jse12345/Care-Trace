import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../common/api";

function CompareSetUpdate() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    patientId: "",
    title: "",
    pastImageUrl: "",
    currentImageUrl: "",
    description: ""
  });

  // 페이지가 처음 열릴 때 기존 데이터 단건 조회 (/compare-set/view.do)
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/compare-set/view.do?id=${id}`);
        if (response.data) {
          setFormData(response.data);
        }
      } catch (error) {
        console.error("상세 정보 조회 실패:", error);
      }
    };
    fetchDetail();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/compare-set/update.do/${id}`, formData);
      alert("비교 세트가 성공적으로 수정되었습니다.");
      navigate("/compare-set/list");
    } catch (error) {
      console.error("수정 실패:", error);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container pt-5 mt-4" style={{ maxWidth: "800px" }}>
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold" style={{ color: "#0f4c5c" }}>의료영상 비교 세트 수정</h2>
        <p className="text-secondary mb-0">등록된 비교 세트의 정보와 영상 경로를 수정합니다.</p>
      </div>

      <form onSubmit={handleUpdate} className="card p-4 shadow-sm border-0 rounded-4">
        <div className="mb-3">
          <label className="form-label fw-semibold">환자 ID</label>
          <input
            type="number"
            name="patientId"
            className="form-control rounded-3 bg-light"
            value={formData.patientId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">비교 세트 제목</label>
          <input
            type="text"
            name="title"
            className="form-control rounded-3"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">과거 영상 경로 (StudyInstanceUID)</label>
          <input
            type="text"
            name="pastImageUrl"
            className="form-control rounded-3"
            value={formData.pastImageUrl}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">현재 영상 경로 (StudyInstanceUID)</label>
          <input
            type="text"
            name="currentImageUrl"
            className="form-control rounded-3"
            value={formData.currentImageUrl}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">설명 및 메모</label>
          <textarea
            name="description"
            className="form-control rounded-3"
            rows="3"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn text-white flex-fill py-2 fw-semibold rounded-3"
            style={{ backgroundColor: "#1d8374" }}
          >
            수정 완료
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary flex-fill py-2 fw-semibold rounded-3"
            onClick={() => navigate(-1)}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompareSetUpdate;