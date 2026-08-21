import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../common/api";

function CompareSetList(){
  const [compareList, setCompareList] = useState([]);
  const navigate = useNavigate();

  const fetchCompareList = async () => {
    try { 
      const response = await api.get("/compare-set/list.do");
      if (Array.isArray(response.data)) {
        setCompareList(response.data); 
      } else {
        setCompareList([]);
      }
    } catch (error) {
      console.error("비교 세트 목록 조회 오류 : ", error);
      setCompareList([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCompareList();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // 행 클릭 이벤트가 부모로 퍼지는 것 방지
    if (window.confirm("정말 이 비교 세트를 삭제하시겠습니까?")) {
      try {
        await api.delete(`/compare-set/delete.do/${id}`);
        alert("삭제되었습니다.");
        fetchCompareList();
      } catch (error) {
        console.error("삭제 실패:", error);
      }
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1 fw-bold" style={{ color: "#0f4c5c" }}>의료영상 비교 세트 목록</h3>
          <div className="text-secondary">총 {compareList.length}건</div>
        </div>

        <button
          type="button"
          className="btn text-white fw-semibold"
          style={{ backgroundColor: "#1d8374" }}
          onClick={() => navigate("/compare-set/register")}
        >
          새 비교 세트 등록
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle text-center shadow-sm rounded-3 overflow-hidden">
          <thead className="table-dark">
            <tr>
              <th>번호</th>
              <th>환자 ID</th>
              <th>제목</th>
              <th>과거 영상 경로 (UID)</th>
              <th>현재 영상 경로 (UID)</th>
              <th>등록일시</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {compareList.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-5 text-secondary">
                  등록된 의료영상 비교 세트가 없습니다.
                </td>
              </tr>
            ) : (
              compareList.map((item, index) => (
                <tr 
                  key={item.id} 
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/compare-set/view/${item.id}`)} // 행 클릭 시 상세/비교 페이지로 이동
                >
                  <td>{index + 1}</td>
                  <td>{item.patientId}</td>
                  <td className="fw-semibold text-primary">{item.title}</td>
                  <td className="text-truncate" style={{ maxWidth: "150px" }}>{item.pastImageUrl}</td>
                  <td className="text-truncate" style={{ maxWidth: "150px" }}>{item.currentImageUrl}</td>
                  <td>{item.regDate ? item.regDate.replace('T', ' ') : '-'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger px-3"
                      onClick={(e) => handleDelete(item.id, e)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompareSetList;