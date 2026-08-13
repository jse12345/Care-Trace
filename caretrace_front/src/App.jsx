import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./components/common/Home";
import TopNavi from "./components/common/TopNavi";
import NotFoundMenu from "./components/error/NotFoundMenu";
import MedicalStaffComp from "./components/medicalstaff/MedicalStaffComp";
import MedicalStaffLogin from "./components/medicalstaff/MedicalStaffLogin";
import ConsultationComp from "./components/consultation/ConsultationComp";
import TreatmentReportComp from "./components/treatmentreport/TreatmentReportComp";

import "./App.css";

function getAuthenticationInformation() {
  const token = localStorage.getItem("token");
  const loginData = localStorage.getItem("login");

  if (!token || !loginData) {
    return {
      isLoggedIn: false,
      isAdmin: false,
    };
  }

  try {
    const login = JSON.parse(loginData);

    return {
      isLoggedIn: true,
      isAdmin:
        login?.roles?.includes("ROLE_ADMIN"),
    };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("login");

    return {
      isLoggedIn: false,
      isAdmin: false,
    };
  }
}

// 관리자 전용 화면 보호
function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } =
    getAuthenticationInformation();

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/medical-staff/login"
        replace
      />
    );
  }

  if (!isAdmin) {

    return <Navigate to="/" replace />;
  }

  return children;
}

// 로그인한 사용자가 다시 로그인 화면에 접근하는 것 방지
function MedicalLoginRoute() {
  const { isLoggedIn, isAdmin } =
    getAuthenticationInformation();

  if (isLoggedIn && isAdmin) {
    return (
      <Navigate
        to="/medical-staff/list"
        replace
      />
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <MedicalStaffLogin />;
}

function App() {
  return (
    <div className="caretrace-app">
      <TopNavi />

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/medical-staff/login"
            element={<MedicalLoginRoute />}
          />

          <Route
            path="/medical-staff/*"
            element={
              <AdminRoute>
                <MedicalStaffComp />
              </AdminRoute>
            }
          />

          <Route 
            path="/consultation/*" 
            element={<ConsultationComp />} 
          />

          <Route 
            path="/treatmentreport/*" 
            element={<TreatmentReportComp />} 
          />

          <Route
            path="*"
            element={<NotFoundMenu />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;