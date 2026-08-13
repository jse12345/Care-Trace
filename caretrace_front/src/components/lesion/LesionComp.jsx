import { Navigate, Route, Routes } from "react-router-dom";

import NotFoundPage from "../error/NotFoundPage";

import LesionList from "./LesionList";
import LesionView from "./LesionView";
import LesionWrite from "./LesionWrite";
import LesionUpdate from "./LesionUpdate";
import LesionDelete from "./LesionDelete";

import MeasurementList from "./MeasurementList";
import MeasurementView from "./MeasurementView";
import MeasurementDelete from "./MeasurementDelete";
import MeasurementTrend from "./MeasurementTrend";
import MiniViewer from "./MiniViewer";

import "./LesionManagement.css";

function LesionComp() {
  return (
    <div className="lesion-module-shell">
      <Routes>
        {/* 병변 관리 */}
        <Route path="list" element={<LesionList />} />
        <Route path="view" element={<LesionView />} />
        <Route path="write" element={<LesionWrite />} />
        <Route path="update" element={<LesionUpdate />} />
        <Route path="delete" element={<LesionDelete />} />

        {/* 측정값 관리 */}
        <Route path="measurement/list" element={<MeasurementList />} />
        <Route path="measurement/view" element={<MeasurementView />} />
        <Route path="measurement/delete" element={<MeasurementDelete />} />
        <Route path="measurement/capture" element={<MiniViewer />} />
        <Route path="measurement/trend" element={<MeasurementTrend />} />

        {/* 기본 진입 경로 */}
        <Route path="" element={<Navigate to="list" replace />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default LesionComp;
