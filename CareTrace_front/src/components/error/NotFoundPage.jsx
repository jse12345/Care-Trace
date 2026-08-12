import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <section className="not-found-card">
        <div className="not-found-code">404</div>
        <h2>관리 페이지를 찾을 수 없습니다</h2>
        <p>요청하신 의료진 관리 주소가 존재하지 않습니다.</p>
        <Link className="clinical-primary-link" to="/medical-staff/list">의료진 목록으로 이동</Link>
      </section>
    </div>
  );
}

export default NotFoundPage;
