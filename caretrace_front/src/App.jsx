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
import CompareSetComp from "./components/CompareSet/CompareSetComp";
import LesionComp from "./components/lesion/LesionComp";
import ExaminationComp from "./components/examination/ExaminationComp";
import PatientList from "./components/patient/PatientList";
import PatientView from "./components/patient/PatientView";
import PatientWrite from "./components/patient/PatientWrite";
import PatientUpdate from "./components/patient/PatientUpdate";
import PatientCaseList from "./components/patientcase/PatientCaseList";
import PatientCaseView from "./components/patientcase/PatientCaseView";
import PatientCaseWrite from "./components/patientcase/PatientCaseWrite";
import PatientCaseUpdate from "./components/patientcase/PatientCaseUpdate";

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

// 로그인 사용자 공통 보호
function RequireLogin({ children }) {
  const { isLoggedIn } =
    getAuthenticationInformation();

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/medical-staff/login"
        replace
      />
    );
  }

  return children;
}

// 로그인한 사용자가 로그인 화면에 다시 접근하는 것 방지
function MedicalLoginRoute() {
  const { isLoggedIn } =
    getAuthenticationInformation();

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
            path="/compare-set/*"
            element={
              <RequireLogin>
                <CompareSetComp />
              </RequireLogin>
            }
          />

          <Route
            path="/consultation/*"
            element={
              <RequireLogin>
                <ConsultationComp />
              </RequireLogin>
            }
          />

          <Route
            path="/treatmentreport/*"
            element={
              <RequireLogin>
                <TreatmentReportComp />
              </RequireLogin>
            }
          />

          <Route
            path="/lesion/*"
            element={
              <RequireLogin>
                <LesionComp />
              </RequireLogin>
            }
          />

          <Route
            path="/examination/*"
            element={
              <RequireLogin>
                <ExaminationComp />
              </RequireLogin>
            }
          />

          <Route
            path="/patients"
            element={
              <RequireLogin>
                <PatientList />
              </RequireLogin>
            }
          />

          <Route
            path="/patients/write"
            element={
              <RequireLogin>
                <PatientWrite />
              </RequireLogin>
            }
          />

          <Route
            path="/patients/:patientId"
            element={
              <RequireLogin>
                <PatientView />
              </RequireLogin>
            }
          />

          <Route
            path="/patients/:patientId/update"
            element={
              <RequireLogin>
                <PatientUpdate />
              </RequireLogin>
            }
          />

          <Route
            path="/patient-cases"
            element={
              <RequireLogin>
                <PatientCaseList />
              </RequireLogin>
            }
          />

          <Route
            path="/patient-cases/write"
            element={
              <RequireLogin>
                <PatientCaseWrite />
              </RequireLogin>
            }
          />

          <Route
            path="/patient-cases/:caseId"
            element={
              <RequireLogin>
                <PatientCaseView />
              </RequireLogin>
            }
          />

          <Route
            path="/patient-cases/:caseId/update"
            element={
              <RequireLogin>
                <PatientCaseUpdate />
              </RequireLogin>
            }
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