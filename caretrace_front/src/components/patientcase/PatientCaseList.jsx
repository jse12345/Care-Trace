import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../common/api";

const PatientCaseList = () => {

    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState("");

    const getCases = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_BASE_URL}/patient-cases`,
                {
                    params: {
                        keyword: keyword,
                        status: status
                    },
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            setCases(response.data);

        } catch (error) {

            console.error(
                "환자 케이스 목록 조회 실패",
                error
            );

        }
    };

    useEffect(() => {
        getCases();
    }, []);

    const handleSearch = () => {
        getCases();
    };

    const handleDelete = async (caseId) => {

        if (!window.confirm(
            "해당 케이스를 삭제하시겠습니까?"
        )) {
            return;
        }

        try {

            const token = localStorage.getItem("token");

            await axios.delete(
                `${API_BASE_URL}/patient-cases/${caseId}`,
                {
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            alert("케이스가 삭제되었습니다.");

            getCases();

        } catch (error) {

            console.error(
                "케이스 삭제 실패",
                error
            );

            alert("케이스 삭제에 실패했습니다.");
        }
    };

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
                        환자의 진단 및 치료 경과를 지속적으로 관리합니다.
                    </p>

                </div>

                <button
                    className="primary-button"
                    onClick={() =>
                        navigate("/patient-cases/write")
                    }
                >
                    + 케이스 등록
                </button>

            </div>


            {/* 검색 영역 */}

            <div className="case-search-card">

                <div className="search-title">

                    <div className="search-icon">
                        🔍
                    </div>

                    <div>

                        <strong>
                            케이스 검색
                        </strong>

                        <p>
                            진단명, 병변 부위 또는 케이스 상태를 검색하세요.
                        </p>

                    </div>

                </div>


                <div className="case-search-area">

                    <input
                        type="text"
                        placeholder="진단명 또는 병변 부위"
                        value={keyword}
                        onChange={(e) =>
                            setKeyword(e.target.value)
                        }
                        onKeyDown={(e) => {

                            if (e.key === "Enter") {
                                handleSearch();
                            }

                        }}
                    />

                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value)
                        }
                    >

                        <option value="">
                            전체 상태
                        </option>

                        <option value="FOLLOW_UP">
                            추적 관찰
                        </option>

                        <option value="TREATMENT">
                            치료 중
                        </option>

                        <option value="COMPLETED">
                            종료
                        </option>

                    </select>

                    <button
                        className="search-button"
                        onClick={handleSearch}
                    >
                        검색
                    </button>

                </div>

            </div>


            {/* 목록 */}

            <div className="case-list-card">

                <div className="case-list-header">

                    <div>

                        <span className="section-label">
                            CASE LIST
                        </span>

                        <h3>
                            환자 케이스 목록
                        </h3>

                    </div>

                    <span className="case-count">
                        총 {cases.length}건
                    </span>

                </div>


                <div className="table-wrapper">

                    <table className="case-table">

                        <thead>

                            <tr>

                                <th>번호</th>
                                <th>환자</th>
                                <th>담당의사</th>
                                <th>진단명</th>
                                <th>병변 부위</th>
                                <th>상태</th>
                                <th>추적 시작일</th>
                                <th>관리</th>

                            </tr>

                        </thead>


                        <tbody>

                            {cases.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="empty-case"
                                    >

                                        <div>

                                            <div className="empty-icon">
                                                📋
                                            </div>

                                            <strong>
                                                등록된 케이스가 없습니다.
                                            </strong>

                                            <p>
                                                새로운 환자 케이스를 등록해주세요.
                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                cases.map((item) => (

                                    <tr key={item.caseId}>

                                        <td className="case-number">
                                            {item.caseId}
                                        </td>


                                        <td>

                                            <button
                                                className="patient-name-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/patient-cases/${item.caseId}`
                                                    )
                                                }
                                            >
                                                {item.patientName ||
                                                    `환자 ${item.patientId}`}
                                            </button>

                                            <span className="patient-code">
                                                환자번호 {item.patientCode}
                                            </span>

                                        </td>


                                        <td>

                                            <span className="doctor-name">
                                                {item.staffName ||
                                                    `의료진 ${item.staffNo}`}
                                            </span>

                                        </td>


                                        <td className="diagnosis-cell">
                                            {item.diagnosis}
                                        </td>


                                        <td>
                                            {item.bodyPart || "-"}
                                        </td>


                                        <td>

                                            <span
                                                className={getStatusClass(
                                                    item.caseStatus
                                                )}
                                            >

                                                <span className="status-dot">
                                                    ●
                                                </span>

                                                {getStatusText(
                                                    item.caseStatus
                                                )}

                                            </span>

                                        </td>


                                        <td>
                                            {item.startDate}
                                        </td>


                                        <td>

                                            <div className="action-buttons">

                                                <button
                                                    className="view-button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/patient-cases/${item.caseId}`
                                                        )
                                                    }
                                                >
                                                    상세
                                                </button>

                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/patient-cases/${item.caseId}/update`
                                                        )
                                                    }
                                                >
                                                    수정
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            item.caseId
                                                        )
                                                    }
                                                >
                                                    삭제
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* 하단 안내 카드 */}

            <div className="case-info-cards">

                <div className="case-info-card">

                    <div className="info-number">
                        01
                    </div>

                    <div>

                        <span>
                            FOLLOW UP
                        </span>

                        <strong>
                            환자 상태 추적
                        </strong>

                    </div>

                </div>


                <div className="case-info-card">

                    <div className="info-number">
                        02
                    </div>

                    <div>

                        <span>
                            MEDICAL RECORD
                        </span>

                        <strong>
                            진단 및 병변 관리
                        </strong>

                    </div>

                </div>


                <div className="case-info-card">

                    <div className="info-number">
                        03
                    </div>

                    <div>

                        <span>
                            COLLABORATION
                        </span>

                        <strong>
                            의료진 협업 관리
                        </strong>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default PatientCaseList;