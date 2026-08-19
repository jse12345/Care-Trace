function MedicalStaffForm({ form, setForm, departments, createMode, onSubmit, submitLabel }) {
  const change = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit}><div className="form-grid">
      {createMode && <><label>사번<input name="employeeNo" value={form.employeeNo} onChange={change} required /></label><label>로그인 아이디<input name="loginId" value={form.loginId} onChange={change} required /></label><label>비밀번호<input type="password" name="password" value={form.password} onChange={change} required minLength="8" /></label></>}
      <label>이름<input name="staffName" value={form.staffName} onChange={change} required /></label>
      <label>진료과<select name="departmentNo" value={form.departmentNo} onChange={change} required><option value="">진료과 선택</option>{departments.map((department) => <option key={department.departmentNo} value={department.departmentNo}>{department.departmentName}</option>)}</select></label>
      <label>직책<input name="jobTitle" value={form.jobTitle} onChange={change} required /></label>
      <label>면허번호<input name="licenseNo" value={form.licenseNo} onChange={change} /></label>
      <label>이메일<input type="email" name="email" value={form.email} onChange={change} required /></label>
      <label>연락처<input name="phone" value={form.phone} onChange={change} /></label>
      {createMode && <label>권한<select name="role" value={form.role} onChange={change}><option value="ADMIN">관리자</option><option value="MEDICAL_STAFF">의료진</option></select></label>}
    </div><div className="form-actions"><button className="primary-button">{submitLabel}</button></div></form>
  );
}

export default MedicalStaffForm;
