import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../common/api";

const PatientCaseUpdate = () => {

    const { caseId } = useParams();
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        patientId: "",
        staffNo: "",
        diagnosis: "",
        bodyPart: "",
        caseStatus: "FOLLOW_UP",
        startDate: "",
        endDate: "",
        memo: ""
    });

    useEffect(() => {

        const getData = async () => {

            try {

                const token = localStorage.getItem("token");

                const [
                    caseResponse,
                    patientResponse,
                    staffResponse
                ] = await Promise.all([

                    axios.get(
                        `${API_BASE_URL}/patient-cases/${caseId}`,
                        {
                            headers: {
                                "X-AUTH-TOKEN": token
                            }
                        }
                    ),

                    axios.get(
                        `${API_BASE_URL}/patients`,
                        {
                            headers: {
                                "X-AUTH-TOKEN": token
                            }
                        }
                    ),

                    axios.get(
                        `${API_BASE_URL}/medical-staff`,
                        {
                            headers: {
                                "X-AUTH-TOKEN": token
                            }
                        }
                    )

                ]);

                const item = caseResponse.data;

                setPatients(patientResponse.data);
                setStaffList(staffResponse.data);

                setForm({
                    patientId: item.patientId || "",
                    staffNo: item.staffNo || "",
                    diagnosis: item.diagnosis || "",
                    bodyPart: item.bodyPart || "",
                    caseStatus: item.caseStatus || "FOLLOW_UP",
                    startDate: item.startDate || "",
                    endDate: item.endDate || "",
                    memo: item.memo || ""
                });

            } catch (error) {

                console.error(
                    "케이스 정보 조회 실패",
                    error
                );

                alert(
                    "케이스 정보를 불러올 수 없습니다."
                );

                navigate("/patient-cases");

            } finally {

                setLoading(false);
            }
        };

        getData();

    }, [caseId, navigate]);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.patientId) {
            alert("환자를 선택해주세요.");
            return;
        }

        if (!form.staffNo) {
            alert("담당의사를 선택해주세요.");
            return;
        }

        if (!form.diagnosis.trim()) {
            alert("진단명을 입력해주세요.");
            return;
        }

        if (!form.startDate) {
            alert("추적 시작일을 입력해주세요.");
            return;
        }

        try {

            const token = localStorage.getItem("token");

            await axios.put(
                `${API_BASE_URL}/patient-cases/${caseId}`,
                {
                    ...form,
                    patientId: Number(form.patientId),
                    staffNo: Number(form.staffNo)
                },
                {
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            alert("환자 케이스가 수정되었습니다.");

            navigate(
                `/patient-cases/${caseId}`
            );

        } catch (error) {

            console.error(
                "케이스 수정 실패",
                error
            );

            alert(
                error.response?.data?.message ||
                "케이스 수정에 실패했습니다."
            );
        }
    };

    if (loading) {
        return (
            <div className="patient-case-page">
                <div className="case-form-card">
                    <div className="loading-message">
                        케이스 정보를 불러오는 중...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-case-page">

            {/* 페이지 헤더 */}
            <div className="page-header">

                <div>

                    <span className="page-label">
                        PATIENT CASE
                    </span>

                    <h2>
                        환자 추적 케이스 수정
                    </h2>

                    <p>
                        등록된 환자 케이스의 정보를 수정합니다.
                    </p>

                </div>

            </div>


            {/* 수정 카드 */}
            <div className="case-form-card">

                <div className="case-form-header">

                    <div className="form-icon">
                        ✎
                    </div>

                    <div>
                        <span className="section-label">
                            CASE UPDATE
                        </span>

                        <h3>
                            케이스 정보 수정
                        </h3>

                        <p>
                            환자와 담당의사 및 추적 정보를 확인하고 수정해주세요.
                        </p>
                    </div>

                </div>


                <form onSubmit={handleSubmit}>

                    <div className="form-grid">


                        {/* 환자 */}
                        <div className="form-group">

                            <label>
                                환자
                                <span>*</span>
                            </label>

                            <select
                                name="patientId"
                                value={form.patientId}
                                onChange={handleChange}
                            >

                                <option value="">
                                    환자를 선택하세요
                                </option>

                                {patients.map((patient) => (

                                    <option
                                        key={patient.patientId}
                                        value={patient.patientId}
                                    >
                                        {patient.patientName}
                                        {" ("}
                                        {patient.patientCode}
                                        {")"}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* 담당의사 */}
                        <div className="form-group">

                            <label>
                                담당의사
                                <span>*</span>
                            </label>

                            <select
                                name="staffNo"
                                value={form.staffNo}
                                onChange={handleChange}
                            >

                                <option value="">
                                    담당의사를 선택하세요
                                </option>

                                {staffList.map((staff) => (

                                    <option
                                        key={staff.staffNo}
                                        value={staff.staffNo}
                                    >
                                        {staff.staffName}

                                        {staff.jobTitle
                                            ? ` (${staff.jobTitle})`
                                            : ""}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* 진단명 */}
                        <div className="form-group">

                            <label>
                                진단명
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="diagnosis"
                                value={form.diagnosis}
                                onChange={handleChange}
                                placeholder="예: 간세포암"
                            />

                        </div>


                        {/* 병변 부위 */}
                        <div className="form-group">

                            <label>
                                병변 부위
                            </label>

                            <input
                                type="text"
                                name="bodyPart"
                                value={form.bodyPart}
                                onChange={handleChange}
                                placeholder="예: 간"
                            />

                        </div>


                        {/* 상태 */}
                        <div className="form-group">

                            <label>
                                케이스 상태
                            </label>

                            <select
                                name="caseStatus"
                                value={form.caseStatus}
                                onChange={handleChange}
                            >

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

                        </div>


                        {/* 추적 시작일 */}
                        <div className="form-group">

                            <label>
                                추적 시작일
                                <span>*</span>
                            </label>

                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                            />

                        </div>


                        {/* 추적 종료일 */}
                        <div className="form-group">

                            <label>
                                추적 종료일
                            </label>

                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                            />

                        </div>


                        {/* 메모 */}
                        <div className="form-group form-group-full">

                            <label>
                                메모
                            </label>

                            <textarea
                                name="memo"
                                value={form.memo}
                                onChange={handleChange}
                                rows="6"
                                placeholder="환자 케이스와 관련된 메모를 입력해주세요."
                            />

                        </div>

                    </div>


                    {/* 버튼 */}
                    <div className="form-button-area">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                                navigate(
                                    `/patient-cases/${caseId}`
                                )
                            }
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                        >
                            수정 완료
                        </button>

                    </div>

                </form>

            </div>


            {/* 하단 안내 */}
            <div className="case-form-info">

                <div className="form-info-icon">
                    !
                </div>

                <div>
                    <strong>
                        케이스 정보 수정 안내
                    </strong>

                    <p>
                        환자, 담당의사, 진단명 및 추적 상태를 수정할 수 있습니다.
                        변경된 정보는 저장 후 환자 케이스에 즉시 반영됩니다.
                    </p>
                </div>

            </div>

        </div>
    );
};

export default PatientCaseUpdate;