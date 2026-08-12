import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../common/api";

function MedicalStaffLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    loginId: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const { data } = await api.post(
        "/medical-staff/login.do",
        form,
      );

      if (!data.success || !data.token) {
        setErrorMessage(
          data.msg
            || "아이디 또는 비밀번호를 확인해 주세요.",
        );
        return;
      }

      const loginInformation = jwtDecode(data.token);

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "login",
        JSON.stringify(loginInformation),
      );

      alert(
        `${loginInformation.name}님으로 로그인되었습니다.`,
      );

      const isAdmin =
        loginInformation.roles?.includes("ROLE_ADMIN");

      window.location.href = isAdmin
        ? "/medical-staff/list"
        : "/";
    } catch (error) {
      setErrorMessage(
        error.response?.data?.msg
          || error.response?.data?.message
          || "아이디 또는 비밀번호를 확인해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medical-login-page">
      <section className="medical-login-card">
        <div className="login-intro-panel">
          <span
            className="login-cross"
            aria-hidden="true"
          >
            +
          </span>

          <p className="login-kicker">
            Secure clinical access
          </p>

          <h1>
            CareTrace
            <br />
            임상 협업 포털
          </h1>

          <p>
            환자 의료영상과 임상 기록 보호를 위해
            승인된 계정으로 접속해 주세요.
          </p>

          <div className="login-security-note">
            <span aria-hidden="true">✓</span>
            JWT 기반 보안 인증
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-form-heading">
            <h2>로그인</h2>
            <span>
              계정 정보를 입력해 주세요.
            </span>
          </div>

          {errorMessage && (
            <div className="alert alert-danger">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label
              htmlFor="loginId"
              className="medical-login-label"
            >
              아이디
            </label>

            <input
              id="loginId"
              name="loginId"
              className="medical-login-input"
              placeholder="아이디를 입력해 주세요"
              value={form.loginId}
              onChange={handleChange}
              required
              autoComplete="username"
            />

            <label
              htmlFor="password"
              className="medical-login-label"
            >
              비밀번호
            </label>

            <input
              type="password"
              id="password"
              name="password"
              className="medical-login-input"
              placeholder="비밀번호를 입력해 주세요"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />

            <div className="medical-login-actions">
              <button
                type="submit"
                className="medical-login-button"
                disabled={loading}
              >
                {loading
                  ? "로그인 중..."
                  : "로그인"}
              </button>

              <button
                type="button"
                className="medical-cancel-button"
                onClick={() => navigate("/")}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default MedicalStaffLogin;