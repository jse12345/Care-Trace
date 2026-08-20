import { useNavigate } from "react-router-dom";

/**
 * items: [{ label, to? }] — 마지막 항목은 현재 페이지로 취급되어 링크 없이 강조 표시된다.
 */
function Breadcrumb({ items }) {
  const navigate = useNavigate();

  if (!items || !items.length) return null;

  return (
    <nav className="ct-breadcrumb" aria-label="breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span className="ct-breadcrumb-item" key={`${item.label}-${index}`}>
            {!isLast && item.to ? (
              <button
                type="button"
                className="ct-breadcrumb-link"
                onClick={() => navigate(item.to)}
              >
                {item.label}
              </button>
            ) : (
              <span className="ct-breadcrumb-current">{item.label}</span>
            )}
            {!isLast && <span className="ct-breadcrumb-separator">›</span>}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
