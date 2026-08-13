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
            <li className="nav-item">
              <NavLink
                to="/"
                className="nav-link"
              >
                대시보드
              </NavLink>
            </li>

            {isLoggedIn && isAdmin && (
              <>
                <li className="nav-item">
                  <a
                    href="/medical-staff/list"
                    className="nav-link medical-admin-link"
                  >
                    의료진 관리
                  </a>
                </li>

                <li className="nav-item">
                  <a
                    href="/medical-staff/department/list"
                    className="nav-link medical-admin-link"
                  >
                    진료과 관리
                  </a>
                </li>
              </>
            )}

            {isLoggedIn && (
              <li className="nav-item">
                <a
                  href="/lesion/list"
                  className="nav-link"
                >
                  병변·측정 기록
                </a>
              </li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto account-group">
            {!isLoggedIn && (
              <li className="nav-item">
                <a
                  className="nav-link login-link-medical"
                  href="/medical-staff/login"
                >
                  로그인
                </a>
              </li>
            )}

            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <span className="nav-link account-chip">
                    {login?.name || "사용자"}
                  </span>
                </li>

                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/"
                    onClick={logout}
                  >
                    로그아웃
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default TopNavi;