import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const PatientView = () => {

    const { patientId } = useParams();
    const navigate = useNavigate();

    const [patient, setPatient] = useState(null);

    useEffect(() => {

        const getPatient = async () => {

            try {

                const token = localStorage.getItem("token");

                console.log("환자 상세 조회 ID:", patientId);
                console.log("환자 상세 조회 토큰:", token);

                const response = await axios.get(
                    `http://localhost:80/patients/${patientId}`,
                    {
                        headers: {
                            "X-AUTH-TOKEN": token
                        }
                    }
                );

                console.log("환자 상세 조회 결과:", response.data);

                setPatient(response.data);

            } catch (error) {

                console.error("환자 조회 실패", error);
                alert("환자 정보를 불러올 수 없습니다.");

            }
        };

        getPatient();

    }, [patientId]);


    if (!patient) {
        return (
            <div className="patient-loading">
                환자 정보를 불러오는 중...
            </div>
        );
    }


    const getGender = () => {

        if (patient.gender === "M") {
            return "남성";
        }

        if (patient.gender === "F") {
            return "여성";
        }

        return "기타";
    };


    return (

        <div className="patient-page">

            {/* =========================================
                페이지 상단
            ========================================= */}

            <div className="patient-page-header">

                <div>

                    <p className="patient-page-label">
                        PATIENT MANAGEMENT
                    </p>

                    <h1>
                        환자 상세
                    </h1>

                    <p className="patient-page-description">
                        환자의 기본 정보와 등록 정보를 확인합니다.
                    </p>

                </div>


                <button
                    className="patient-back-button"
                    onClick={() => navigate("/patients")}
                >
                    ← 환자 목록
                </button>

            </div>


            {/* =========================================
                환자 정보 카드
            ========================================= */}

            <div className="patient-detail-card">


                {/* 카드 상단 */}

                <div className="patient-detail-header">

                    <div className="patient-profile">

                        <div className="patient-profile-icon">
                            +
                        </div>

                        <div>

                            <span className="patient-detail-label">
                                PATIENT
                            </span>

                            <h2>
                                {patient.patientName}
                            </h2>

                            <p>
                                {patient.patientCode}
                            </p>

                        </div>

                    </div>


                    <div className="patient-status">

                        <span className="status-dot"></span>

                        추적 관찰 대상

                    </div>

                </div>


                {/* 구분선 */}

                <div className="patient-divider"></div>


                {/* =========================================
                    기본 정보
                ========================================= */}

                <div className="patient-detail-section">

                    <div className="patient-detail-section-title">

                        <span className="patient-section-number">
                            01
                        </span>

                        <div>

                            <h3>
                                환자 기본 정보
                            </h3>

                            <p>
                                환자의 기본 인적사항입니다.
                            </p>

                        </div>

                    </div>


                    <div className="patient-detail-grid">

                        <div className="patient-detail-item">

                            <span>
                                환자 번호
                            </span>

                            <strong>
                                {patient.patientId}
                            </strong>

                        </div>


                        <div className="patient-detail-item">

                            <span>
                                환자 식별번호
                            </span>

                            <strong>
                                {patient.patientCode}
                            </strong>

                        </div>


                        <div className="patient-detail-item">

                            <span>
                                환자명
                            </span>

                            <strong>
                                {patient.patientName}
                            </strong>

                        </div>


                        <div className="patient-detail-item">

                            <span>
                                생년월일
                            </span>

                            <strong>
                                {patient.birthDate}
                            </strong>

                        </div>


                        <div className="patient-detail-item">

                            <span>
                                성별
                            </span>

                            <strong>
                                {getGender()}
                            </strong>

                        </div>


                        <div className="patient-detail-item">

                            <span>
                                연락처
                            </span>

                            <strong>
                                {patient.phone || "-"}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    시스템 정보
                ========================================= */}

                <div className="patient-detail-section">

                    <div className="patient-detail-section-title">

                        <span className="patient-section-number">
                            02
                        </span>

                        <div>

                            <h3>
                                등록 정보
                            </h3>

                            <p>
                                환자 정보의 등록 및 수정 이력입니다.
                            </p>

                        </div>

                    </div>


                    <div className="patient-system-info">

                        <div>

                            <span>
                                등록일
                            </span>

                            <strong>
                                {patient.createdAt
                                    ? patient.createdAt.replace("T", " ")
                                    : "-"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                최종 수정일
                            </span>

                            <strong>
                                {patient.updatedAt
                                    ? patient.updatedAt.replace("T", " ")
                                    : "-"}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    안내
                ========================================= */}

                <div className="patient-info-box">

                    <div className="patient-info-icon">
                        i
                    </div>

                    <div>

                        <strong>
                            환자 추적 관찰 안내
                        </strong>

                        <p>
                            해당 환자의 검사 이력과 의료영상 비교,
                            병변 측정 기록은 추적 관찰 케이스에서
                            관리할 수 있습니다.
                        </p>

                    </div>

                </div>


                {/* =========================================
                    버튼
                ========================================= */}

                <div className="patient-detail-actions">

                    <button
                        className="patient-cancel-button"
                        onClick={() => navigate("/patients")}
                    >
                        목록
                    </button>


                    <button
                        className="patient-submit-button"
                        onClick={() =>
                            navigate(
                                `/patients/${patient.patientId}/update`
                            )
                        }
                    >
                        환자 정보 수정
                    </button>

                </div>

            </div>

        </div>
    );
};

export default PatientView;