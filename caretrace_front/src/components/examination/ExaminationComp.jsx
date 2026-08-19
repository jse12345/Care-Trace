import { Routes, Route } from "react-router-dom";
import ExaminationList from "./ExaminationList";
import ExaminationView from "./ExaminationView";
import NotFoundPage from "../error/NotFoundPage";
import "./ExaminationManagement.css";

function ExaminationComp() {
  return (
    <div className="examination-module-shell">
      <Routes>
        <Route path="list" element={<ExaminationList />} />
        <Route path="view" element={<ExaminationView />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default ExaminationComp;
