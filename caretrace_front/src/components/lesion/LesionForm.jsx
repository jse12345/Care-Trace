function LesionForm({ form, setForm, onSubmit, submitLabel, caseIdEditable, caseOptions }) {
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
          케이스 번호
          {caseIdEditable ? (
            <select
              name="caseId"
              value={form.caseId}
              onChange={change}
              required
              disabled={!caseOptions}
            >
              {!caseOptions && (
                <option value={form.caseId}>불러오는 중...</option>
              )}
              {caseOptions && caseOptions.map((c) => (
                <option key={c.caseId} value={c.caseId}>
                  #{c.caseId} · {c.diagnosis} ({c.startDate})
                </option>
              ))}
            </select>
          ) : (
            <input
              name="caseId"
              type="number"
              value={form.caseId}
              onChange={change}
              required
              disabled
            />
          )}
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
          장기
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
          림프절 여부
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
