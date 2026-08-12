import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import NotFoundPage from "../error/NotFoundPage";

import DepartmentDelete from "./DepartmentDelete";
import DepartmentList from "./DepartmentList";
import DepartmentUpdate from "./DepartmentUpdate";
import DepartmentView from "./DepartmentView";
import DepartmentWrite from "./DepartmentWrite";

import MedicalStaffDelete from "./MedicalStaffDelete";
import MedicalStaffList from "./MedicalStaffList";
import MedicalStaffRoleStatus from "./MedicalStaffRoleStatus";
import MedicalStaffUpdate from "./MedicalStaffUpdate";
import MedicalStaffView from "./MedicalStaffView";
import MedicalStaffWrite from "./MedicalStaffWrite";

import "./DepartmentManagement.css";

function MedicalStaffComp() {
  return (
    <div className="medical-module-shell">

      <Routes>
        {/* 의료진 관리 */}
        <Route
          path="list"
          element={<MedicalStaffList />}
        />

        <Route
          path="view"
          element={<MedicalStaffView />}
        />

        <Route
          path="write"
          element={<MedicalStaffWrite />}
        />

        <Route
          path="update"
          element={<MedicalStaffUpdate />}
        />

        <Route
          path="role-status"
          element={<MedicalStaffRoleStatus />}
        />

        <Route
          path="delete"
          element={<MedicalStaffDelete />}
        />

        {/* 진료과 관리 */}
        <Route
          path="department/list"
          element={<DepartmentList />}
        />

        <Route
          path="department/view"
          element={<DepartmentView />}
        />

        <Route
          path="department/write"
          element={<DepartmentWrite />}
        />

        <Route
          path="department/update"
          element={<DepartmentUpdate />}
        />

        <Route
          path="department/delete"
          element={<DepartmentDelete />}
        />

        {/* 기본 진입 경로 */}
        <Route
          path=""
          element={
            <Navigate
              to="list"
              replace
            />
          }
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </div>
  );
}

export default MedicalStaffComp;