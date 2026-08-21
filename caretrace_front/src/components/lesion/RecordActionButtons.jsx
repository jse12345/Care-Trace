import { FiEdit2, FiTrash2, FiList } from "react-icons/fi";

function RecordActionButtons({
  onEdit,
  onDelete,
  onList,
  editLabel = "수정",
  deleteLabel = "삭제",
  listLabel = "목록",
}) {
  return (
    <>
      <button className="lesion-edit-button" onClick={onEdit}>
        <FiEdit2 aria-hidden="true" /> {editLabel}
      </button>
      <button className="lesion-delete-button" onClick={onDelete}>
        <FiTrash2 aria-hidden="true" /> {deleteLabel}
      </button>
      <button className="lesion-secondary-button" onClick={onList}>
        <FiList aria-hidden="true" /> {listLabel}
      </button>
    </>
  );
}

export default RecordActionButtons;
