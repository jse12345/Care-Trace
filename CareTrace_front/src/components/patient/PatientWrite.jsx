import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../common/api";

const PatientWrite = () => {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        patientCode: "",
        patientName: "",
        birthDate: "",
        gender: "M",
        phone: ""
    });

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.patientCode.trim()) {
            alert("환자 식별번호를 입력해주세요.");
            return;
        }

        if (!form.patientName.trim()) {
            alert("환자명을 입력해주세요.");
            return;
        }

        if (!form.birthDate) {
            alert("생년월일을 입력해주세요.");
            return;
        }

        try {

            const token = localStorage.getItem("token");

            await axios.post(
                `${API_BASE_URL}/patients`,
                form,
                {
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            alert("환자가 등록되었습니다.");

            navigate("/patients");

        } catch (error) {

            console.error("환자 등록 실패", error);

            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert("환자 등록에 실패했습니다.");
            }

        }
    };

    return (
        <div className="patient-page">

            {/* 페이지 상단 */}
            <div className="patient-page-header">

                <div>
                    <p className="patient-page-label">
                        PATIENT MANAGEMENT
                    </p>

                    <h1>
                        환자 등록
                    </h1>

                    <p className="patient-page-description">
                        추적 관찰이 필요한 환자의 기본 정보를 등록합니다.
                    </p>
                </div>

                <button
                    className="patient-back-button"
                    onClick={() => navigate("/patients")}
                >
                    ← 환자 목록
                </button>

            </div>


            {/* 등록 카드 */}
            <div className="patient-form-card">

                <div className="patient-form-header">

                    <div>
                        <span className="patient-section-number">
                            01
                        </span>

                        <div>
                            <h2>
                                환자 기본 정보
                            </h2>

                            <p>
                                환자 식별번호와 기본 인적사항을 입력해주세요.
                            </p>
                        </div>
                    </div>

                </div>


                <form onSubmit={handleSubmit}>

                    <div className="patient-form-grid">

                        {/* 환자 식별번호 */}
                        <div className="patient-form-group">

                            <label>
                                환자 식별번호
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="patientCode"
                                value={form.patientCode}
                                onChange={handleChange}
                                placeholder="예: P20260001"
                            />

                            <small>
                                DICOM PatientID와 연결되는 식별번호입니다.
                            </small>

                        </div>


                        {/* 환자명 */}
                        <div className="patient-form-group">

                            <label>
                                환자명
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="patientName"
                                value={form.patientName}
                                onChange={handleChange}
                                placeholder="환자명을 입력하세요"
                            />

                        </div>


                        {/* 생년월일 */}
                        <div className="patient-form-group">

                            <label>
                                생년월일
                                <span>*</span>
                            </label>

                            <input
                                type="date"
                                name="birthDate"
                                value={form.birthDate}
                                onChange={handleChange}
                            />

                        </div>


                        {/* 성별 */}
                        <div className="patient-form-group">

                            <label>
                                성별
                            </label>

                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                            >
                                <option value="M">
                                    남성
                                </option>

                                <option value="F">
                                    여성
                                </option>

                                <option value="O">
                                    기타
                                </option>
                            </select>

                        </div>


                        {/* 연락처 */}
                        <div className="patient-form-group patient-form-full">

                            <label>
                                연락처
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="010-0000-0000"
                            />

                        </div>

                    </div>


                    {/* 안내 영역 */}
                    <div className="patient-info-box">

                        <div className="patient-info-icon">
                            i
                        </div>

                        <div>
                            <strong>
                                환자 정보 등록 안내
                            </strong>

                            <p>
                                등록된 환자 정보는 추적 관찰 케이스와
                                의료영상 검사 이력 관리에 사용됩니다.
                            </p>
                        </div>

                    </div>


                    {/* 버튼 */}
                    <div className="patient-form-actions">

                        <button
                            type="button"
                            className="patient-cancel-button"
                            onClick={() => navigate("/patients")}
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            className="patient-submit-button"
                        >
                            환자 등록
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default PatientWrite;