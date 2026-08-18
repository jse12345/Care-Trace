import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PatientCaseWrite = () => {

    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [staffList, setStaffList] = useState([]);

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

                // 환자 목록 조회
                const patientResponse = await axios.get(
                    "http://localhost:80/patients",
                    {
                        headers: {
                            "X-AUTH-TOKEN": token
                        }
                    }
                );

                setPatients(patientResponse.data);

                // 의료진 목록 조회
                const staffResponse = await axios.get(
                    "http://localhost:80/medical-staff/list.do",
                    {
                        headers: {
                            "X-AUTH-TOKEN": token
                        }
                    }
                );

                setStaffList(staffResponse.data.list);

            } catch (error) {

                console.error(
                    "환자/의료진 목록 조회 실패",
                    error
                );

            }
        };

        getData();

    }, []);

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

            await axios.post(
                "http://localhost:80/patient-cases",
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

            alert("환자 케이스가 등록되었습니다.");

            navigate("/patient-cases");

        } catch (error) {

            console.error(
                "케이스 등록 실패",
                error
            );

            alert(
                error.response?.data?.message ||
                "케이스 등록에 실패했습니다."
            );
        }
    };

    return (
        <div className="patient-case-page">

            {/* 페이지 헤더 */}
            <div className="page-header">

                <div>

                    <span className="page-label">
                        PATIENT CASE
                    </span>

                    <h2>
                        환자 추적 케이스 등록
                    </h2>

                    <p>
                        환자의 진단 정보와 추적 관찰 내용을 등록합니다.
                    </p>

                </div>

            </div>


            {/* 등록 카드 */}
            <div className="case-write-card">

                <div className="case-write-header">

                    <div className="write-icon">
                        +
                    </div>

                    <div>
                        <strong>
                            케이스 정보
                        </strong>

                        <p>
                            환자와 담당의사를 선택하고 추적 관찰 정보를 입력해주세요.
                        </p>
                    </div>

                </div>


                <form
                    className="case-write-form"
                    onSubmit={handleSubmit}
                >

                    {/* 환자 / 담당의사 */}
                    <div className="form-row">

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

                    </div>


                    {/* 진단명 / 병변 부위 */}
                    <div className="form-row">

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

                    </div>


                    {/* 상태 / 날짜 */}
                    <div className="form-row three-column">

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

                    </div>


                    {/* 메모 */}
                    <div className="form-group">

                        <label>
                            메모
                        </label>

                        <textarea
                            name="memo"
                            value={form.memo}
                            onChange={handleChange}
                            rows="6"
                            placeholder="환자 추적 관찰과 관련된 내용을 입력해주세요."
                        />

                    </div>


                    {/* 버튼 */}
                    <div className="form-button-area">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                                navigate("/patient-cases")
                            }
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            className="submit-button"
                        >
                            케이스 등록
                        </button>

                    </div>

                </form>

            </div>


            {/* 안내 카드 */}
            <div className="case-write-info">

                <div className="info-icon">
                    !
                </div>

                <div>

                    <strong>
                        환자 추적 관리 안내
                    </strong>

                    <p>
                        등록된 케이스는 이후 의료영상 비교 및 병변 변화 추적에
                        활용됩니다. 환자와 담당의사를 정확하게 선택해주세요.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default PatientCaseWrite;