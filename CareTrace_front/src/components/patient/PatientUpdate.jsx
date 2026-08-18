import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../common/api";

const PatientUpdate = () => {

    const { patientId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        patientCode: "",
        patientName: "",
        birthDate: "",
        gender: "M",
        phone: ""
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const getPatient = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${API_BASE_URL}/patients/${patientId}`,
                    {
                        headers: {
                            "X-AUTH-TOKEN": token
                        }
                    }
                );

                const patient = response.data;

                setForm({
                    patientCode: patient.patientCode || "",
                    patientName: patient.patientName || "",
                    birthDate: patient.birthDate || "",
                    gender: patient.gender || "M",
                    phone: patient.phone || ""
                });

            } catch (error) {

                console.error("환자 조회 실패", error);
                alert("환자 정보를 불러올 수 없습니다.");

                navigate("/patients");

            } finally {

                setLoading(false);

            }
        };

        getPatient();

    }, [patientId, navigate]);


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

            await axios.put(
                `${API_BASE_URL}/patients/${patientId}`,
                form,
                {
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            alert("환자 정보가 수정되었습니다.");

            navigate(`/patients/${patientId}`);

        } catch (error) {

            console.error("환자 수정 실패", error);

            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert("환자 정보 수정에 실패했습니다.");
            }

        }
    };


    if (loading) {
        return (
            <div className="patient-page">
                <div className="patient-loading">
                    환자 정보를 불러오는 중...
                </div>
            </div>
        );
    }


    return (

        <div className="patient-page">

            {/* 페이지 상단 영역 */}
            <div className="patient-page-header">

                <div>
                    <span className="patient-page-label">
                        PATIENT MANAGEMENT
                    </span>

                    <h1>
                        환자 정보 수정
                    </h1>

                    <p>
                        등록된 환자의 정보를 수정하고 관리합니다.
                    </p>
                </div>

                <button
                    className="patient-back-button"
                    onClick={() =>
                        navigate(`/patients/${patientId}`)
                    }
                >
                    ← 환자 상세
                </button>

            </div>


            {/* 수정 카드 */}
            <div className="patient-form-card">

                <div className="patient-card-header">

                    <div>
                        <h2>환자 기본 정보</h2>

                        <p>
                            환자 식별번호와 기본 정보를 확인하고 수정해주세요.
                        </p>
                    </div>

                    <span className="patient-card-number">
                        PATIENT #{patientId}
                    </span>

                </div>


                <form
                    className="patient-form"
                    onSubmit={handleSubmit}
                >

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
                            DICOM PatientID와 연결되는 환자 식별번호입니다.
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
                            placeholder="환자명을 입력하세요."
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
                            <span>*</span>
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
                    <div className="patient-form-group">

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


                    {/* 버튼 */}
                    <div className="patient-form-buttons">

                        <button
                            type="button"
                            className="patient-cancel-button"
                            onClick={() =>
                                navigate(`/patients/${patientId}`)
                            }
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            className="patient-submit-button"
                        >
                            환자 정보 수정
                        </button>

                    </div>

                </form>

            </div>


            {/* 하단 안내 */}
            <div className="patient-info-box">

                <div className="patient-info-icon">
                    i
                </div>

                <div>
                    <strong>
                        환자 정보 관리
                    </strong>

                    <p>
                        환자 정보 수정 시 기존 의료영상과 연결된
                        환자 식별번호가 변경될 수 있으므로
                        식별번호 변경에 주의해주세요.
                    </p>
                </div>

            </div>

        </div>
    );
};

export default PatientUpdate;