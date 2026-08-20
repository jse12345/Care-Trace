import { FiEye } from "react-icons/fi";

function DetailButton({ onClick, className = "lesion-detail-button" }) {
  return (
    <button className={className} title="상세" onClick={onClick}>
      <FiEye aria-hidden="true" /> 상세
    </button>
  );
}

export default DetailButton;
