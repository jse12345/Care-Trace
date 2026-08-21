import { Routes, Route } from "react-router-dom"; 
import CompareSetList from "./ComparetList";
import CompareSetForm from "./CompareSetForm";
import CompareSetView from "./CompareSetView";   // 추가 필요
import CompareSetUpdate from "./CompareSetUpdate"; // 추가 필요
import NotFoundPage from "../error/NotFoundPage";

function CompareSetComp(){
  return (
    <div className="mt-4">
      <Routes>
        <Route path="list" element={<CompareSetList />} />
        <Route path="register" element={<CompareSetForm />} />
        <Route path="view/:id" element={<CompareSetView />} />    
        <Route path="update/:id" element={<CompareSetUpdate />} /> 
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );  
}

export default CompareSetComp;