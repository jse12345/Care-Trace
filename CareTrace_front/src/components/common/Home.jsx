import { Link } from "react-router-dom";

const modules = [
  {
    number: "01",
    title: "의료진·진료과 관리",
    description:
      "의료진 계정, 소속 진료과, 권한과 계정 상태를 관리합니다.",
    available: true,
    adminOnly: true,
    path: "/medical-staff/list",
  },
  {
    number: "02",
    title: "환자 추적 관찰",
    description:
      "환자별 추적 케이스와 시기별 검사 이력을 관리합니다.",
    available: false,
  },
  {
    number: "03",
    title: "의료영상 비교",
    description:
      "과거·현재 DICOM 영상을 한 화면에서 비교합니다.",
    available: false,
  },
  {
    number: "04",
    title: "병변·측정 기록",
    description:
      "병변 위치와 크기, 시기별 변화 이력을 기록합니다.",
    available: false,
  },
  {
    number: "05",
    title: "협진·반응 보고서",
    description:
      "의료진 의견을 공유하고 치료 반응 보고서를 작성합니다.",
    available: false,
  },
];

function getLoginInformation() {
  const token = localStorage.getItem("token");
  const loginData = localStorage.getItem("login");

  if (!token || !loginData) {
    return {
      isLoggedIn: false,
      login: null,
    };
  }

  try {
    return {
      isLoggedIn: true,
      login: JSON.parse(loginData),
    };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("login");

    return {
      isLoggedIn: false,
      login: null,
    };
  }
}

function Home() {
  const { isLoggedIn, login } =
    getLoginInformation();

  const isAdmin =
    login?.roles?.includes("ROLE_ADMIN");

  const isMedicalStaff =
    login?.roles?.includes("ROLE_MEDICAL_STAFF");

  const isViewer =
    login?.roles?.includes("ROLE_VIEWER");

  const getModuleState = (module) => {
    if (!module.available) {
      return "연동 예정";
    }

    if (module.adminOnly && !isAdmin) {
      return "관리자 전용";
    }

    return "사용 가능";
  };

  const canAccessModule = (module) => {
    if (!module.available) {
      return false;
    }

    if (module.adminOnly) {
      return Boolean(isAdmin);
    }

    return isLoggedIn;
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <section className="clinical-hero">
          <div>
            <p className="hero-kicker">
              Longitudinal Imaging Collaboration
            </p>

            <h1>
              DICOM 의료영상 기반
              <br />
              병변 변화 추적 플랫폼
            </h1>

            <p className="hero-description">
              반복 검사된 의료영상을 시기별로 비교하고,
              병변의 변화와 치료 반응을 의료진이 함께
              기록·검토하는 임상 협업 시스템입니다.
            </p>

            <div className="hero-actions">
              {!isLoggedIn && (
                <a
                  className="clinical-primary-link"
                  href="/medical-staff/login"
                >
                  의료진 로그인
                </a>
              )}

              {isLoggedIn && isAdmin && (
                <>
                  <Link
                    className="clinical-primary-link"
                    to="/medical-staff/list"
                  >
                    의료진 관리
                  </Link>

                  <Link
                    className="clinical-secondary-link"
                    to="/medical-staff/department/list"
                  >
                    진료과 관리
                  </Link>
                </>
              )}

              {isLoggedIn && isMedicalStaff && (
                <span className="clinical-secondary-link">
                  임상 업무 모듈 연동 예정
                </span>
              )}

              {isLoggedIn && isViewer && (
                <span className="clinical-secondary-link">
                  조회 업무 모듈 연동 예정
                </span>
              )}
            </div>
          </div>

          <div
            className="hero-monitor"
            aria-label="시스템 상태 요약"
          >
            <div className="monitor-header">
              <div>
                <span className="monitor-label">
                  Clinical workspace
                </span>

                <strong>
                  CareTrace Imaging Hub
                </strong>
              </div>

              <span className="monitor-status">
                CORE ACCESS READY
              </span>
            </div>

            <svg
              className="vital-wave"
              viewBox="0 0 360 90"
              role="img"
              aria-label="의료영상 추적 흐름"
            >
              <defs>
                <linearGradient
                  id="waveGradient"
                  x1="0"
                  x2="1"
                >
                  <stop
                    offset="0"
                    stopColor="#55d6b5"
                  />

                  <stop
                    offset="1"
                    stopColor="#4bb8de"
                  />
                </linearGradient>
              </defs>

              <path
                d="M0 50 H58 L77 50 L92 20 L112 73 L132 42 L148 50 H209 L226 50 L240 29 L258 62 L278 45 L294 50 H360"
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M0 75 H360"
                fill="none"
                stroke="rgba(255,255,255,.08)"
              />

              <path
                d="M0 25 H360"
                fill="none"
                stroke="rgba(255,255,255,.08)"
              />
            </svg>

            <div className="monitor-metrics">
              <div className="monitor-metric">
                <span>영상 저장</span>
                <strong>
                  Orthanc PACS 연동 예정
                </strong>
              </div>

              <div className="monitor-metric">
                <span>비교 방식</span>
                <strong>시기별 추적 설계</strong>
              </div>

              <div className="monitor-metric">
                <span>판독 주체</span>
                <strong>의료진 직접 입력</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="workflow-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">
                Clinical workflow
              </p>

              <h2>
                진료 흐름에 맞춘 통합 업무 모듈
              </h2>
            </div>
          </div>

          <div className="workflow-grid">
            {modules.map((module) => {
              const accessible =
                canAccessModule(module);

              const moduleState =
                getModuleState(module);

              return (
                <article
                  className={`workflow-card ${
                    accessible ? "available" : ""
                  }`}
                  key={module.number}
                >
                  <span className="workflow-number">
                    {module.number}
                  </span>

                  <h3>{module.title}</h3>

                  <p>{module.description}</p>

                  <span className="module-state">
                    {moduleState}
                  </span>

                  {accessible && (
                    <Link
                      className="workflow-card-link"
                      to={module.path}
                      aria-label={`${module.title} 이동`}
                    />
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section
          className="system-summary"
          aria-label="CareTrace 시스템 원칙"
        >
          <div className="summary-card">
            <span className="summary-icon">
              01
            </span>

            <div>
              <span>Patient safety</span>
              <strong>
                의료진 권한 기반 접근 제어
              </strong>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">
              02
            </span>

            <div>
              <span>Longitudinal care</span>
              <strong>
                검사 시기별 변화 추적
              </strong>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">
              03
            </span>

            <div>
              <span>Clinical collaboration</span>
              <strong>
                협진 의견과 반응 기록 통합
              </strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;