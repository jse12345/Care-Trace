import { Link } from "react-router-dom";

function NotFoundMenu() {
  return (
    <div className="not-found-page">
      <section className="not-found-card">
        <div className="not-found-code">404</div>
        <h2>요청하신 메뉴를 찾을 수 없습니다</h2>
        <p>주소를 다시 확인하거나 CareTrace 대시보드로 이동해 주세요.</p>
        <Link className="clinical-primary-link" to="/">대시보드로 이동</Link>
      </section>
    </div>
  );
}

export default NotFoundMenu;
