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
import CompareSetComp from "./components/compareSet/CompareSetComp";
import LesionComp from "./components/lesion/LesionComp";
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

// 로그인만 필요하고 관리자 권한은 필요 없는 화면 보호(병변·측정 기록은 일반 의료진도 사용)
function RequireLogin({ children }) {
  const { isLoggedIn } = getAuthenticationInformation();

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
          <Route path="/compare-set/*" element={<CompareSetComp />} />
          <Route path="/CompareSet/*" element={<CompareSetComp />} />
          <Route 
            path="/consultation/*" 
            element={<ConsultationComp />} 
          />

          <Route
            path="/treatmentreport/*"
            element={<TreatmentReportComp />}
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
            path="*"
            element={<NotFoundMenu />}
          />

          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/write" element={<PatientWrite />} />
          <Route path="/patients/:patientId" element={<PatientView />} />
          <Route path="/patients/:patientId/update" element={<PatientUpdate />} />

          <Route
              path="/patient-cases"
              element={<PatientCaseList />}
          />

          <Route
              path="/patient-cases/write"
              element={<PatientCaseWrite />}
          />

          <Route
              path="/patient-cases/:caseId"
              element={<PatientCaseView />}
          />

          <Route
              path="/patient-cases/:caseId/update"
              element={<PatientCaseUpdate />}
          />


        </Routes>
      </main>
    </div>
  );
}

export default App;