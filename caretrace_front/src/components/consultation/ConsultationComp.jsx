import { Navigate, Route, Routes } from "react-router-dom";
import NotFoundPage from "../error/NotFoundPage";

// 앞서 작성한 컴포넌트들을 import 합니다. (경로는 실제 구조에 맞게 수정)
import ConsultationList from "./ConsultationList";
import ConsultationWrite from "./ConsultationWrite";
import ConsultationView from "./ConsultationView";

function ConsultationComp() {
  return (
    <div className="medical-module-shell">
      <Routes>
        <Route path="list" element={<ConsultationList />} />
        <Route path="write" element={<ConsultationWrite />} />
        <Route path="view" element={<ConsultationView />} />
        
        {/* /consultation 으로 접속 시 list로 자동 이동 */}
        <Route path="" element={<Navigate to="list" replace />} />
        
        {/* 잘못된 하위 경로 처리 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default ConsultationComp;