import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function MedicalStaffDelete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const staffNo = Number(searchParams.get("staffNo"));
  const [errorMessage, setErrorMessage] = useState("");

  const remove = async () => {
    try {
      await api.post("/medical-staff/delete.do", { staffNo });
      alert("의료진이 삭제되었습니다.");
      navigate("/medical-staff/list");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "의료진 삭제에 실패했습니다.");
    }
  };

  return <main className="department-page"><div className="department-container"><section className="form-card text-center"><h2>의료진을 삭제하시겠습니까?</h2><p>실제 데이터는 보존되고 계정은 비활성화됩니다.</p>{errorMessage && <div className="error-message">{errorMessage}</div>}<div className="form-actions justify-content-center"><button className="delete-button" onClick={remove}>삭제</button><button className="secondary-button" onClick={() => navigate(-1)}>취소</button></div></section></div></main>;
}

export default MedicalStaffDelete;
