function LesionForm({ form, setForm, onSubmit, submitLabel, caseIdEditable }) {
  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="lesion-form-grid">
        <label>
          증례 번호(caseId)
          <input
            name="caseId"
            type="number"
            value={form.caseId}
            onChange={change}
            required
            disabled={!caseIdEditable}
          />
        </label>

        <label>
          병변 라벨
          <input
            name="lesionLabel"
            value={form.lesionLabel}
            onChange={change}
            required
            maxLength="50"
          />
        </label>

        <label>
          장기(organ)
          <input
            name="organ"
            value={form.organ}
            onChange={change}
            maxLength="100"
          />
        </label>

        <label>
          병변 구분
          <select name="lesionType" value={form.lesionType} onChange={change}>
            <option value="">선택 안 함</option>
            <option value="TARGET">TARGET</option>
            <option value="NON_TARGET">NON_TARGET</option>
            <option value="NEW">NEW</option>
          </select>
        </label>

        <label className="lesion-checkbox-label">
          <input
            name="isLymphNode"
            type="checkbox"
            checked={form.isLymphNode}
            onChange={change}
          />
          림프절 여부(림프절이면 추세 계산 기준이 단축이 됩니다)
        </label>

        <label className="lesion-full-width">
          설명
          <textarea
            name="description"
            value={form.description}
            onChange={change}
            rows="4"
          />
        </label>
      </div>

      <div className="lesion-form-actions">
        <button className="lesion-primary-button">{submitLabel}</button>
      </div>
    </form>
  );
}

export default LesionForm;
