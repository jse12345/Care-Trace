import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../common/api";

const PatientCaseView = () => {

    const { caseId } = useParams();
    const navigate = useNavigate();

    const [patientCase, setPatientCase] = useState(null);

    useEffect(() => {

        const getCase = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${API_BASE_URL}/patient-cases/${caseId}`,
                    {
                        headers: {
                            "X-AUTH-TOKEN": token
                        }
                    }
                );

                setPatientCase(response.data);

            } catch (error) {

                console.error(
                    "케이스 조회 실패",
                    error
                );

                alert(
                    "케이스 정보를 불러올 수 없습니다."
                );

                navigate("/patient-cases");
            }
        };

        getCase();

    }, [caseId, navigate]);


    if (!patientCase) {

        return (
            <div className="patient-case-page">

                <div className="loading-message">
                    케이스 정보를 불러오는 중...
                </div>

            </div>
        );
    }


    const getStatusText = (value) => {

        switch (value) {

            case "FOLLOW_UP":
                return "추적 관찰";

            case "TREATMENT":
                return "치료 중";

            case "COMPLETED":
                return "종료";

            default:
                return value;
        }
    };


    const getStatusClass = (value) => {

        switch (value) {

            case "FOLLOW_UP":
                return "status-badge follow";

            case "TREATMENT":
                return "status-badge treatment";

            case "COMPLETED":
                return "status-badge completed";

            default:
                return "status-badge";
        }
    };


    return (

        <div className="patient-case-page">

            {/* 페이지 제목 */}

            <div className="page-header">

                <div>

                    <span className="page-label">
                        PATIENT CASE
                    </span>

                    <h2>
                        환자 추적 관찰 케이스
                    </h2>

                    <p>
                        선택한 환자 케이스의 상세 정보를 확인합니다.
                    </p>

                </div>

            </div>


            {/* 상세 카드 */}

            <div className="case-list-card">

                <div className="case-list-header">

                    <div>

                        <span className="section-label">
                            CASE DETAIL
                        </span>

                        <h3>
                            케이스 상세 정보
                        </h3>

                    </div>

                    <span
                        className={getStatusClass(
                            patientCase.caseStatus
                        )}
                    >
                        <span className="status-dot">
                            ●
                        </span>

                        {getStatusText(
                            patientCase.caseStatus
                        )}
                    </span>

                </div>


                <div className="case-detail-content">

                    <div className="detail-row">

                        <div className="detail-label">
                            케이스 번호
                        </div>

                        <div className="detail-value">
                            {patientCase.caseId}
                        </div>

                    </div>


                    <div className="detail-row">

                        <div className="detail-label">
                            환자
                        </div>

                        <div className="detail-value">

                            <strong>
                                {patientCase.patientName ||
                                    `환자 ${patientCase.patientId}`}
                            </strong>

                            {patientCase.patientCode && (
                                <span className="patient-code">
                                    {" "}({patientCase.patientCode})
                                </span>
                            )}

                        </div>

                    </div>


                    <div className="detail-row">

                        <div className="detail-label">
                            담당의사
                        </div>

                        <div className="detail-value">
                            {patientCase.staffName ||
                                `의료진 ${patientCase.staffNo}`}
                        </div>

                    </div>


                    <div className="detail-row">

                        <div className="detail-label">
                            진단명
                        </div>

                        <div className="detail-value strong">
                            {patientCase.diagnosis}
                        </div>

                    </div>


                    <div className="detail-row">

                        <div className="detail-label">
                            병변 부위
                        </div>

                        <div className="detail-value">
                            {patientCase.bodyPart || "-"}
                        </div>

                    </div>


                    <div className="detail-row">

                        <div className="detail-label">
                            케이스 상태
                        </div>

                        <div className="detail-value">

                            <span
                                className={getStatusClass(
                                    patientCase.caseStatus
                                )}
                            >

                                <span className="status-dot">
                                    ●
                                </span>

                                {getStatusText(
                                    patientCase.caseStatus
                                )}

                            </span>

                        </div>

                    </div>


                    <div className="detail-row">

                        <div className="detail-label">
                            추적 시작일
                        </div>

                        <div className="detail-value">
                            {patientCase.startDate}
                        </div>

                    </div>


                    <div className="detail-row">

                        <div className="detail-label">
                            추적 종료일
                        </div>

                        <div className="detail-value">
                            {patientCase.endDate || "-"}
                        </div>

                    </div>


                    <div className="detail-row memo-row">

                        <div className="detail-label">
                            메모
                        </div>

                        <div className="detail-value memo">
                            {patientCase.memo || "-"}
                        </div>

                    </div>


                    <div className="detail-row">

                        <div className="detail-label">
                            등록일
                        </div>

                        <div className="detail-value">
                            {patientCase.createdAt
                                ? patientCase.createdAt.replace("T", " ")
                                : "-"}
                        </div>

                    </div>

                </div>


                {/* 버튼 */}

                <div className="case-detail-buttons">

                    {/* 환자 상세로 이동 */}
                    <button
                        className="patient-view-button large"
                        onClick={() =>
                            navigate(
                                `/patients/${patientCase.patientId}`
                            )
                        }
                    >
                        환자 정보
                    </button>

                    {/* 병변·측정 기록으로 이동 */}
                    <button
                        className="view-button large"
                        onClick={() =>
                            navigate(
                                `/lesion/list?caseId=${caseId}`
                            )
                        }
                    >
                        병변·측정 기록
                    </button>

                    {/* 케이스 수정 */}
                    <button
                        className="edit-button large"
                        onClick={() =>
                            navigate(
                                `/patient-cases/${caseId}/update`
                            )
                        }
                    >
                        수정
                    </button>

                    {/* 케이스 목록 */}
                    <button
                        className="view-button large"
                        onClick={() =>
                            navigate("/patient-cases")
                        }
                    >
                        목록
                    </button>

                </div>

            </div>

        </div>
    );
};

export default PatientCaseView;