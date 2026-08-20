import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3v18M3 12h18"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M7.5 7.5 16.5 16.5M16.5 7.5 7.5 16.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity=".38"
        />
      </svg>
    </span>
  );
}

function TopNavi() {
  const [token, setToken] = useState(
    localStorage.getItem("token"),
  );

  const [login, setLogin] = useState(() => {
    const data = localStorage.getItem("login");

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data);
    } catch {
      localStorage.removeItem("login");
      return null;
    }
  });

  const isLoggedIn = Boolean(token && login);

  const isAdmin = login?.roles?.includes(
    "ROLE_ADMIN",
  );

  const roleLabel = isAdmin
    ? "관리자"
    : login?.roles?.includes("ROLE_MEDICAL_STAFF")
      ? "의료진"
      : "사용자";

  const logout = (event) => {
    event.preventDefault();

    localStorage.removeItem("token");
    localStorage.removeItem("login");

    setToken(null);
    setLogin(null);

    alert("로그아웃 되었습니다.");
    window.location.href = "/";
  };

  return (
    <nav
      className="navbar navbar-expand-lg fixed-top caretrace-navbar"
      aria-label="CareTrace 주요 메뉴"
    >
      <div className="container-fluid">
        <Link className="caretrace-brand" to="/">
          <BrandMark />

          <span className="brand-copy">
            <span className="brand-name">
              CareTrace
            </span>

            <span className="brand-subtitle">
              Clinical Imaging Collaboration
            </span>
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mynavbar"
          aria-controls="mynavbar"
          aria-expanded="false"
          aria-label="메뉴 열기"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className="collapse navbar-collapse"
          id="mynavbar"
        >
          <ul className="navbar-nav me-auto">
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/patients"
                    className="nav-link"
                  >
                    환자 목록
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/patient-cases"
                    className="nav-link"
                  >
                    환자 추적 관찰 목록
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/examination/list"
                    className="nav-link"
                  >
                    검사 목록
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/compare-set/list"
                    className="nav-link"
                  >
                    의료영상 비교
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/consultation/list"
                    className="nav-link"
                  >
                    협진 목록
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink
                    to="/treatmentreport/list"
                    className="nav-link"
                >
                  치료반응보고서
                </NavLink>

                </li>
                
              </>
            )}
          </ul>

          <ul className="navbar-nav ms-auto account-group">
            {!isLoggedIn && (
              <li className="nav-item">
                <NavLink
                  className="nav-link login-link-medical"
                  to="/medical-staff/login"
                >
                  로그인
                </NavLink>
              </li>
            )}

            {isLoggedIn && (
              <li className="nav-item dropdown account-dropdown">
                <button
                  className="nav-link account-chip dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span>{login?.name || "사용자"}</span>
                  <span className="account-role">
                    · {roleLabel}
                  </span>
                </button>

                <ul className="dropdown-menu dropdown-menu-end account-menu">
                  {isAdmin && (
                    <>
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/medical-staff/list"
                        >
                          의료진 관리
                        </Link>
                      </li>

                      <li>
                        <Link
                          className="dropdown-item"
                          to="/medical-staff/department/list"
                        >
                          진료과 관리
                        </Link>
                      </li>

                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                    </>
                  )}

                  <li>
                    <button
                      className="dropdown-item account-logout"
                      type="button"
                      onClick={logout}
                    >
                      로그아웃
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default TopNavi;