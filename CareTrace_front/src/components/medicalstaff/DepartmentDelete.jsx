import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function DepartmentDelete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const departmentNo = Number(searchParams.get("departmentNo"));
  const [errorMessage, setErrorMessage] = useState("");

  const remove = async () => {
    try {
      await api.post("/department/delete.do", { departmentNo });
      alert("진료과가 삭제되었습니다.");
      navigate("/medical-staff/department/list");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "진료과 삭제에 실패했습니다.");
    }
  };

  return (
    <main className="department-page"><div className="department-container"><section className="form-card text-center">
      <h2>진료과를 삭제하시겠습니까?</h2>
      <p>소속 의료진이 있는 진료과는 삭제할 수 없습니다.</p>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="form-actions justify-content-center"><button className="delete-button" onClick={remove}>삭제</button><button className="secondary-button" onClick={() => navigate(-1)}>취소</button></div>
    </section></div></main>
  );
}

export default DepartmentDelete;
