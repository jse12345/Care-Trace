import { Routes, Route } from "react-router-dom"; 
import CompareSetList from "./CompareSetList";
import CompareSetForm from "./CompareSetForm";
import NotFoundPage from "../error/NotFoundPage";

function CompareSetComp(){
  return (
    <div className="mt-4">
      <Routes>
        <Route path="list" element={<CompareSetList />} />
        <Route path="register" element={<CompareSetForm />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default CompareSetComp;