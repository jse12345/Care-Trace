import { Link } from "react-router-dom";

const modules = [
  {
    number: "01",
    title: "환자 추적 관찰",
    description:
      "환자별 추적 케이스와 시기별 검사 이력을 관리합니다.",
    available: true,
    path: "/patients",
  },
  {
    number: "02",
    title: "의료영상 비교",
    description:
      "Orthanc PACS의 과거·현재 DICOM 영상을 시기별로 비교합니다.",
    available: true,
    path: "/compare-set/list",
  },
  {
    number: "03",
    title: "병변·측정 기록",
    description:
      "병변 위치와 크기, 시기별 변화 이력을 기록합니다.",
    available: true,
    path: "/lesion/list",
  },
  {
    number: "04",
    title: "협진 의견",
    description:
      "의료진 간 협진 의견을 등록하고 조회합니다.",
    available: true,
    path: "/consultation/list",
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
  const { isLoggedIn } =
    getLoginInformation();

  const getModuleState = (module) => {
    if (!module.available) {
      return "연동 예정";
    }

    return "사용 가능";
  };

  const canAccessModule = (module) => {
    if (!module.available) {
      return false;
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

            {!isLoggedIn && (
              <div className="hero-actions">
                <Link
                  className="clinical-primary-link"
                  to="/medical-staff/login"
                >
                  포털 로그인
                </Link>
              </div>
            )}
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
                  Orthanc PACS 연동
                </strong>
              </div>

              <div className="monitor-metric">
                <span>비교 방식</span>
                <strong>시기별 영상 비교</strong>
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
