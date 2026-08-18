import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PatientList.css";

const PatientList = () => {

    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [keyword, setKeyword] = useState("");

    // 환자 목록 조회
    const getPatients = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:80/patients",
                {
                    params: {
                        keyword: keyword
                    },
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            setPatients(response.data);

        } catch (error) {

            console.error("환자 목록 조회 실패", error);

        }
    };

    useEffect(() => {
        getPatients();
    }, []);

    // 검색
    const handleSearch = () => {
        getPatients();
    };

    // 환자 삭제
    const handleDelete = async (patientId) => {

        if (!window.confirm("환자를 삭제하시겠습니까?")) {
            return;
        }

        try {

            const token = localStorage.getItem("token");

            await axios.delete(
                `http://localhost:80/patients/${patientId}`,
                {
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            alert("환자가 삭제되었습니다.");

            getPatients();

        } catch (error) {

            console.error("환자 삭제 실패", error);
            alert("환자 삭제에 실패했습니다.");

        }
    };

    return (
        <div className="patient-page">

            {/* 페이지 상단 */}
            <section className="patient-header">

                <div>
                    <p className="patient-eyebrow">
                        PATIENT TRACKING
                    </p>

                    <h1>
                        환자 추적 관찰
                    </h1>

                    <p className="patient-description">
                        환자의 진료 케이스와 검사 이력을 관리하고
                        시기별 의료영상 추적을 위한 환자 정보를 확인합니다.
                    </p>
                </div>

                <button
                    className="patient-register-btn"
                    onClick={() => navigate("/patients/write")}
                >
                    + 환자 등록
                </button>

            </section>


            {/* 검색 영역 */}
            <section className="patient-search-card">

                <div className="search-title">
                    <span className="search-icon">⌕</span>

                    <div>
                        <h3>환자 검색</h3>
                        <p>
                            환자명 또는 환자 식별번호로 검색할 수 있습니다.
                        </p>
                    </div>
                </div>

                <div className="search-area">

                    <input
                        type="text"
                        placeholder="환자명 또는 환자 식별번호를 입력하세요"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSearch();
                            }
                        }}
                    />

                    <button
                        className="search-btn"
                        onClick={handleSearch}
                    >
                        검색
                    </button>

                </div>

            </section>


            {/* 환자 목록 */}
            <section className="patient-list-card">

                <div className="list-header">

                    <div>
                        <p className="section-label">
                            PATIENT LIST
                        </p>

                        <h2>
                            환자 목록
                        </h2>
                    </div>

                    <div className="patient-count">
                        <span>{patients.length}</span>
                        명
                    </div>

                </div>


                <div className="patient-table-wrapper">

                    <table className="patient-table">

                        <thead>

                            <tr>
                                <th>번호</th>
                                <th>환자 식별번호</th>
                                <th>환자명</th>
                                <th>생년월일</th>
                                <th>성별</th>
                                <th>연락처</th>
                                <th>관리</th>
                            </tr>

                        </thead>

                        <tbody>

                            {patients.length === 0 ? (

                                <tr className="empty-row">

                                    <td colSpan="7">

                                        <div className="empty-content">

                                            <div className="empty-icon">
                                                +
                                            </div>

                                            <strong>
                                                등록된 환자가 없습니다.
                                            </strong>

                                            <span>
                                                새로운 환자를 등록해주세요.
                                            </span>

                                            <button
                                                onClick={() =>
                                                    navigate("/patients/write")
                                                }
                                            >
                                                환자 등록하기
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                patients.map((patient, index) => (

                                    <tr
                                        key={patient.patientId}
                                        className="patient-row"
                                    >

                                        <td className="patient-number">
                                            {patients.length - index}
                                        </td>

                                        <td>
                                            <span className="patient-code">
                                                {patient.patientCode}
                                            </span>
                                        </td>

                                        <td>

                                            <button
                                                className="patient-name-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/patients/${patient.patientId}`
                                                    )
                                                }
                                            >
                                                {patient.patientName}
                                            </button>

                                        </td>

                                        <td>
                                            {patient.birthDate}
                                        </td>

                                        <td>

                                            <span
                                                className={`gender-badge ${
                                                    patient.gender === "M"
                                                        ? "male"
                                                        : patient.gender === "F"
                                                            ? "female"
                                                            : "other"
                                                }`}
                                            >
                                                {patient.gender === "M"
                                                    ? "남"
                                                    : patient.gender === "F"
                                                        ? "여"
                                                        : "기타"}
                                            </span>

                                        </td>

                                        <td>
                                            {patient.phone || "-"}
                                        </td>

                                        <td>

                                            <div className="action-buttons">

                                                <button
                                                    className="view-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/patients/${patient.patientId}`
                                                        )
                                                    }
                                                >
                                                    보기
                                                </button>

                                                <button
                                                    className="update-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/patients/${patient.patientId}/update`
                                                        )
                                                    }
                                                >
                                                    수정
                                                </button>

                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        handleDelete(
                                                            patient.patientId
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

            </section>

        </div>
    );
};

export default PatientList;