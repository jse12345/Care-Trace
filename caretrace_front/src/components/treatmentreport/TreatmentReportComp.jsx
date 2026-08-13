import { Navigate, Route, Routes } from "react-router-dom";
import NotFoundPage from "../error/NotFoundPage";
import TreatmentReportList from "./TreatmentReportList";
import TreatmentReportView from "./TreatmentReportView";
import TreatmentReportWrite from "./TreatmentReportWrite";
import TreatmentReportUpdate from "./TreatmentReportUpdate";
import "../medicalstaff/DepartmentManagement.css";

function TreatmentReportComp() {
  return (
    <div className="medical-module-shell">
      <Routes>
        {/* 치료반응보고서 주요 라우트 */}
        <Route path="list" element={<TreatmentReportList />} />
        <Route path="view" element={<TreatmentReportView />} />
        <Route path="write" element={<TreatmentReportWrite />} />
        <Route path="update" element={<TreatmentReportUpdate />} />
        
        {/* 기본 경로 접근 시 목록으로 리다이렉트 */}
        <Route path="" element={<Navigate to="list" replace />} />
        
        {/* 잘못된 하위 경로 처리 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default TreatmentReportComp;