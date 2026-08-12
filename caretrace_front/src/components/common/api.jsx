import axios from "axios";

// 백엔드 API 통신 공용 객체
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL
    || "http://localhost:8081",
});

// 모든 API 요청에 JWT 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["X-AUTH-TOKEN"] = token;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// API 응답 공통 처리
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // 로그인 요청 자체가 실패한 경우에는
    // 로그인 화면에서 오류 메시지를 표시하도록 그대로 전달
    const isLoginRequest = requestUrl.includes(
      "/medical-staff/login.do",
    );

    // 토큰 없음, 토큰 만료, 잘못된 토큰
    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("login");

      if (window.location.pathname !== "/medical-staff/login") {
        window.location.href = "/medical-staff/login";
      }
    }

    // 403은 로그인 실패가 아니라 권한 부족이므로
    // 토큰을 삭제하지 않고 각 화면에서 처리
    return Promise.reject(error);
  },
);

export default api;
