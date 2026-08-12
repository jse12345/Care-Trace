function DepartmentForm({ form, setForm, onSubmit, submitLabel }) {
  const change = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: name === "departmentCode" ? value.toUpperCase() : value,
    }));
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <label>진료과 코드<input name="departmentCode" value={form.departmentCode} onChange={change} required maxLength="50" /></label>
        <label>진료과명<input name="departmentName" value={form.departmentName} onChange={change} required maxLength="50" /></label>
        <label>상태<select name="status" value={form.status} onChange={change}><option value="ACTIVE">활성</option><option value="INACTIVE">비활성</option></select></label>
        <label className="full-width">설명<textarea name="description" value={form.description} onChange={change} maxLength="255" rows="4" /></label>
      </div>
      <div className="form-actions"><button className="primary-button">{submitLabel}</button></div>
    </form>
  );
}

export default DepartmentForm;
