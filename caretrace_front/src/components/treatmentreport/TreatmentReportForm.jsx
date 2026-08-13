import React from "react";

function TreatmentReportForm({ form, setForm, onSubmit, submitLabel, isUpdate = false }) {
  const change = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        {!isUpdate && (
          <label> 증례 번호
            <input type="number" name="caseId" value={form.caseId} onChange={change} required />
          </label>
        )}
        <label> 평가 기준
          <input name="evaluationCriteria" value={form.evaluationCriteria} onChange={change} required placeholder="ex) RECIST 1.1" maxLength="50" />
        </label>
        <label> 평가 기준일
          <input type="date" name="evaluationDate" value={form.evaluationDate} onChange={change} required />
        </label>
        <label> 치료 반응 결과
          <select name="responseResult" value={form.responseResult} onChange={change} required>
            <option value="">선택하세요</option>
            <option value="CR">완전관해 (CR)</option>
            <option value="PR">부분관해 (PR)</option>
            <option value="SD">안정병변 (SD)</option>
            <option value="PD">진행병변 (PD)</option>
          </select>
        </label>
        <label> 병변 크기 변화율 (%)
          <input type="number" step="0.01" name="sizeChangeRate" value={form.sizeChangeRate} onChange={change} />
        </label>
        {isUpdate && (
          <label> 보고서 상태
            <select name="status" value={form.status} onChange={change} required>
              <option value="draft">DRAFT (임시저장)</option>
              <option value="confirmed">CONFIRMED (확정)</option>
            </select>
          </label>
        )}
        <label className="full-width"> 판독 소견
          <textarea name="reportContent" value={form.reportContent} onChange={change} required maxLength="200" rows="4" />
        </label>
      </div>
      <div className="form-actions">
        <button type="submit" className="primary-button">{submitLabel}</button>
      </div>
    </form>
  );
}

export default TreatmentReportForm;