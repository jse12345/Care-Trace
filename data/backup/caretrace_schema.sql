-- --------------------------------------------------------
-- 호스트:                          10.15.21.205
-- 서버 버전:                        10.6.27-MariaDB - MariaDB Server
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- 테이블 caretrace.consultation_opinion 구조 내보내기
DROP TABLE IF EXISTS `consultation_opinion`;
CREATE TABLE IF NOT EXISTS `consultation_opinion` (
  `opinion_id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '협진의견 번호',
  `case_id` bigint(20) unsigned NOT NULL COMMENT '증례 번호',
  `staff_id` bigint(20) NOT NULL COMMENT '작성 의료진 번호',
  `parent_opinion_id` int(10) unsigned DEFAULT NULL COMMENT '원 의견 번호',
  `opinion_type` varchar(20) NOT NULL DEFAULT 'REQUEST' COMMENT '의견 구분: REQUEST, RESPONSE',
  `opinion_content` varchar(200) NOT NULL COMMENT '의견 내용',
  `status` varchar(20) NOT NULL DEFAULT 'OPEN' COMMENT '의견 상태: OPEN, ANSWERED, CLOSED',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일시',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
  `is_deleted` varchar(1) NOT NULL DEFAULT 'n' COMMENT '삭제 여부: y, n',
  PRIMARY KEY (`opinion_id`),
  KEY `idx_consultation_opinion_case_id` (`case_id`),
  KEY `idx_consultation_opinion_staff_id` (`staff_id`),
  KEY `fk_consultation_opinion_parent` (`parent_opinion_id`),
  CONSTRAINT `fk_consultation_opinion_case` FOREIGN KEY (`case_id`) REFERENCES `patient_case` (`case_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_consultation_opinion_parent` FOREIGN KEY (`parent_opinion_id`) REFERENCES `consultation_opinion` (`opinion_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_consultation_opinion_staff` FOREIGN KEY (`staff_id`) REFERENCES `medical_staff` (`staff_no`) ON UPDATE CASCADE,
  CONSTRAINT `chk_consultation_opinion_type` CHECK (`opinion_type` in ('REQUEST','RESPONSE')),
  CONSTRAINT `chk_consultation_opinion_status` CHECK (`status` in ('OPEN','ANSWERED','CLOSED')),
  CONSTRAINT `chk_consultation_opinion_is_deleted` CHECK (`is_deleted` in ('y','n'))
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='협진 의견 정보';

-- 테이블 데이터 caretrace.consultation_opinion:~26 rows (대략적) 내보내기
INSERT INTO `consultation_opinion` (`opinion_id`, `case_id`, `staff_id`, `parent_opinion_id`, `opinion_type`, `opinion_content`, `status`, `created_at`, `updated_at`, `is_deleted`) VALUES
	(1, 1, 1, NULL, 'REQUEST', '환자의 최근 혈액 검사 결과에서 간 수치 상승이 관찰됩니다. 소화기내과 진료 및 판독 의뢰합니다.', 'OPEN', '2026-08-16 09:00:00', '2026-08-16 09:00:00', 'n'),
	(2, 2, 2, NULL, 'REQUEST', '흉부 X-ray 상 우측 하엽에 음영 증가 소견이 있습니다. 호흡기내과 판독 부탁드립니다.', 'ANSWERED', '2026-08-16 10:30:00', '2026-08-16 10:30:00', 'n'),
	(3, 2, 3, 2, 'RESPONSE', '이전 사진(3월)과 비교 시 큰 변화 없는 과거 결핵 흔적으로 보입니다. 추가 검사는 불필요할 것 같습니다.', 'CLOSED', '2026-08-16 14:15:00', '2026-08-16 14:15:00', 'n'),
	(4, 3, 1, NULL, 'REQUEST', '항암 치료 1주기 후 환자가 심한 오심과 구토를 호소합니다. 약제 조절에 대한 의견 부탁드립니다.', 'ANSWERED', '2026-08-17 08:20:00', '2026-08-17 08:20:00', 'n'),
	(5, 3, 2, 4, 'RESPONSE', '현재 투여 중인 항구토제에 추가로 덱사메타손 처방을 고려해 보시기 바랍니다.', 'ANSWERED', '2026-08-17 09:50:00', '2026-08-17 09:50:00', 'n'),
	(6, 3, 4, 4, 'RESPONSE', '동의합니다. 추가로 수액 공급을 통해 탈수를 예방하는 것도 중요하겠습니다.', 'CLOSED', '2026-08-17 11:10:00', '2026-08-17 11:10:00', 'n'),
	(7, 4, 3, NULL, 'REQUEST', '신경과 협진 의뢰합니다. 환자 우측 편마비 증상 있습니다. (보류)', 'CLOSED', '2026-08-17 15:00:00', '2026-08-17 16:30:00', 'n'),
	(8, 5, 2, NULL, 'REQUEST', '잘못 등록된 협진 요청입니다. 무시해주세요.', 'OPEN', '2026-08-17 17:00:00', '2026-08-17 17:05:00', 'y'),
	(9, 6, 1, NULL, 'REQUEST', '수술 후 통증 조절이 잘 되지 않습니다. 마취통증의학과 협진 요청합니다.', 'ANSWERED', '2026-08-18 08:00:00', '2026-08-18 08:00:00', 'n'),
	(10, 6, 4, 9, 'RESPONSE', 'PCA 용량을 증량해 보시기 바랍니다. (잘못 작성된 답변 - 삭제됨)', 'CLOSED', '2026-08-18 08:30:00', '2026-08-18 08:35:00', 'y'),
	(11, 6, 3, 9, 'RESPONSE', 'PCA 용량 증량 및 보조 진통제(IV) 추가 투여를 권장합니다. 경과 관찰 후 재연락 바랍니다.', 'CLOSED', '2026-08-18 08:45:00', '2026-08-18 08:45:00', 'n'),
	(12, 1, 2, NULL, 'REQUEST', '과거 2025년 진료 기록 확인을 위한 협진입니다.', 'CLOSED', '2025-11-20 09:00:00', '2025-11-21 10:00:00', 'n'),
	(13, 1, 1, 12, 'RESPONSE', '해당 시기 특이사항 없었습니다. 추적 관찰 요망.', 'CLOSED', '2025-11-21 10:00:00', '2026-08-18 10:09:40', 'y'),
	(14, 1, 1, NULL, 'REQUEST', '간세포암 진료기록에 대한 신약 관련 협진 요청.', 'OPEN', '2026-08-18 11:00:38', '2026-08-18 11:00:38', 'n'),
	(15, 4, 1, NULL, 'REQUEST', '뇌종양 협진 요청 샘플1', 'ANSWERED', '2026-08-18 11:20:33', '2026-08-18 11:20:49', 'n'),
	(16, 4, 1, 15, 'RESPONSE', '스스로 응답샘플 01', 'CLOSED', '2026-08-18 11:20:49', '2026-08-18 11:26:59', 'y'),
	(17, 4, 1, 15, 'RESPONSE', '답변샘플2', 'CLOSED', '2026-08-18 11:30:41', '2026-08-18 11:32:47', 'y'),
	(18, 4, 1, 15, 'RESPONSE', '답변3', 'ANSWERED', '2026-08-18 11:30:46', '2026-08-18 11:36:16', 'n'),
	(19, 4, 1, 15, 'RESPONSE', '답변4', 'OPEN', '2026-08-18 11:36:09', '2026-08-18 11:36:09', 'n'),
	(20, 4, 1, 18, 'RESPONSE', '3-1', 'OPEN', '2026-08-18 11:36:16', '2026-08-18 11:36:16', 'n'),
	(21, 6, 1, NULL, 'REQUEST', '네용', 'CLOSED', '2026-08-19 16:12:25', '2026-08-20 10:27:41', 'y'),
	(22, 6, 13, 21, 'RESPONSE', 'ㄱㄴㄷ', 'CLOSED', '2026-08-19 16:12:33', '2026-08-19 16:12:53', 'y'),
	(23, 6, 13, 22, 'RESPONSE', 'ㄱㄴㄷㄹ', 'CLOSED', '2026-08-19 16:12:46', '2026-08-19 16:12:50', 'y'),
	(24, 6, 1, NULL, 'REQUEST', '1234', 'CLOSED', '2026-08-20 10:28:22', '2026-08-20 12:11:27', 'y'),
	(25, 6, 4, 24, 'RESPONSE', '1234', 'CLOSED', '2026-08-20 10:28:47', '2026-08-20 10:29:03', 'y'),
	(26, 6, 4, 24, 'RESPONSE', '123', 'CLOSED', '2026-08-20 10:28:56', '2026-08-20 10:29:13', 'y');

-- 테이블 caretrace.department 구조 내보내기
DROP TABLE IF EXISTS `department`;
CREATE TABLE IF NOT EXISTS `department` (
  `department_no` bigint(20) NOT NULL AUTO_INCREMENT,
  `department_code` varchar(50) NOT NULL,
  `department_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `is_deleted` varchar(1) NOT NULL,
  `reg_date` datetime NOT NULL DEFAULT current_timestamp(),
  `update_date` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`department_no`),
  UNIQUE KEY `department_code` (`department_code`),
  UNIQUE KEY `department_name` (`department_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- 테이블 데이터 caretrace.department:~10 rows (대략적) 내보내기
INSERT INTO `department` (`department_no`, `department_code`, `department_name`, `description`, `status`, `is_deleted`, `reg_date`, `update_date`) VALUES
	(1, 'CARD', '순환기내과', '심장 및 혈관 질환의 진단과 치료를 담당하는 진료과', 'ACTIVE', 'N', '2026-08-11 13:48:11', '2026-08-19 14:50:40'),
	(2, 'DERM', '피부과', '피부 및 알레르기 질환을 진료하는 진료과', 'INACTIVE', 'Y', '2026-08-11 14:28:32', '2026-08-11 14:30:17'),
	(3, 'DEMO260812', '의료영상시연과', 'CT와 MRI 의료영상 비교 및 병변 추적을 담당하는 시연용 진료과', 'INACTIVE', 'Y', '2026-08-12 14:39:16', '2026-08-12 14:50:58'),
	(4, 'DEMO0818', '시연진료과', '진료과 수정 기능 확인 완료', 'INACTIVE', 'Y', '2026-08-18 15:18:45', '2026-08-18 15:21:25'),
	(5, 'RAD', '영상의학과', 'CT, MRI 등 의료영상 검사 및 판독을 담당하는 진료과', 'ACTIVE', 'N', '2026-08-19 14:50:33', '2026-08-19 14:50:33'),
	(6, 'NEUR', '신경과', '뇌 및 신경계 질환의 진단과 치료를 담당하는 진료과', 'ACTIVE', 'N', '2026-08-19 14:50:33', '2026-08-19 14:50:33'),
	(7, 'ONCO', '혈액종양내과', '혈액질환 및 종양 환자의 진단과 항암 치료를 담당하는 진료과', 'ACTIVE', 'N', '2026-08-19 14:50:33', '2026-08-19 14:50:33'),
	(8, 'PULM', '호흡기내과', '폐 및 호흡기 질환의 진단과 치료를 담당하는 진료과', 'ACTIVE', 'N', '2026-08-19 14:50:33', '2026-08-19 14:50:33'),
	(9, 'GI', '소화기내과', '위장관, 간, 담도 및 췌장 질환을 진료하는 진료과', 'ACTIVE', 'N', '2026-08-19 14:50:33', '2026-08-19 14:50:33'),
	(10, 'HIM', '의료정보관리팀', '의료정보 시스템 운영 및 사용자 계정 관리를 담당하는 부서', 'ACTIVE', 'N', '2026-08-19 14:50:33', '2026-08-19 14:50:33');

-- 테이블 caretrace.examination 구조 내보내기
DROP TABLE IF EXISTS `examination`;
CREATE TABLE IF NOT EXISTS `examination` (
  `examination_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `accession_number` varchar(64) DEFAULT NULL,
  `dicom_patient_birth_date` varchar(20) DEFAULT NULL,
  `dicom_patient_id` varchar(100) DEFAULT NULL,
  `dicom_patient_name` varchar(200) DEFAULT NULL,
  `dicom_patient_sex` varchar(10) DEFAULT NULL,
  `instanceCount` int(11) DEFAULT NULL,
  `last_synced_at` datetime(6) DEFAULT NULL,
  `orthanc_study_id` varchar(100) NOT NULL,
  `patient_id` bigint(20) unsigned DEFAULT NULL,
  `referring_physician_name` varchar(200) DEFAULT NULL,
  `seriesCount` int(11) DEFAULT NULL,
  `stable` bit(1) DEFAULT NULL,
  `study_date` varchar(20) DEFAULT NULL,
  `study_description` varchar(500) DEFAULT NULL,
  `study_id_tag` varchar(64) DEFAULT NULL,
  `study_instance_uid` varchar(128) DEFAULT NULL,
  `study_time` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`examination_id`),
  UNIQUE KEY `UK5pc74tgnjmaorcrlt8sicm7ri` (`orthanc_study_id`),
  UNIQUE KEY `UKaxw2rvqre0kcw1lqnsuar3oh5` (`study_instance_uid`),
  KEY `FKmn1l13u1iroqkv46h8dnxcmuw` (`patient_id`),
  CONSTRAINT `FKmn1l13u1iroqkv46h8dnxcmuw` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- 테이블 데이터 caretrace.examination:~17 rows (대략적) 내보내기
INSERT INTO `examination` (`examination_id`, `accession_number`, `dicom_patient_birth_date`, `dicom_patient_id`, `dicom_patient_name`, `dicom_patient_sex`, `instanceCount`, `last_synced_at`, `orthanc_study_id`, `patient_id`, `referring_physician_name`, `seriesCount`, `stable`, `study_date`, `study_description`, `study_id_tag`, `study_instance_uid`, `study_time`) VALUES
	(6, '', '19780315', 'P20260001', '김민수', 'M', 1, '2026-08-21 11:04:30.991742', '4c0cff2a-27df6a5b-5a776c0e-f1214385-8e5b593f', 1, '', 1, b'1', '20260110', 'MRI_ABDOMEN_WO_W_CONTRAST', '', '1.3.6.1.4.1.14519.5.2.1.1620.1226.185573154804424189993810966597', '105052'),
	(7, '', '19780315', 'P20260001', '김민수', 'M', 1, '2026-08-21 11:04:31.267898', 'f2b094c0-0575e4cb-e5e6d13d-d2509851-a1600ae4', 1, '', 1, b'1', '20260210', 'CT_PANCREAS_CHEST_AND_PELVIS_WITH_CONTRAST', '', '1.3.6.1.4.1.14519.5.2.1.1620.1226.232807312259441781994074034892', '115002.740'),
	(8, '', '19850722', 'P20260002', '이지은', 'F', 1, '2026-08-21 11:04:31.184051', 'd5d71064-7486d01d-9a2835e0-2f8aac0f-68504776', 2, '', 1, b'1', '20260205', 'DBT Reconstructed Volume', '', '1.3.6.1.4.1.14519.5.2.1.2135.6389.227610418901852828311674038725', '1200'),
	(9, '', '19850722', 'P20260002', '이지은', 'F', 1, '2026-08-21 11:04:31.020434', '66531c8f-8b91dacc-88146cef-37827f74-70df685a', 2, '', 1, b'1', '20260321', 'DBT Reconstructed Volume', '', '1.3.6.1.4.1.14519.5.2.1.2135.6389.236892609093917147551300569025', '1200'),
	(10, '1791342422597581', '19691108', 'P20260003', '박준혁', 'M', 6, '2026-08-21 11:04:31.031948', '804c6536-1af81c3a-e7236c5d-e39a08a8-93c5993d', 3, '', 1, b'1', '20260312', 'CT INFUSED CHEST', '16904', '1.2.840.113704.1.111.2112.1167842143.1', '103543'),
	(11, '1764192885731917', '19691108', 'P20260003', '박준혁', 'M', 6, '2026-08-21 11:04:30.942184', '2f5ae3af-30cb8b15-ebe06e4d-2aa1ca32-b4ee170d', 3, '', 1, b'1', '20260405', 'CT INFUSED CHEST', '6824', '1.2.840.113704.1.111.1724.1168391407.1', '191007'),
	(12, '569B5002', '19691108', 'P20260003', '박준혁', 'M', 5, '2026-08-21 11:04:31.240209', 'ed35a6ad-56195990-09663c72-298cdc14-1f10caf2', 3, 'SMITH^LAUREN', 1, b'1', '20260312', 'Ordered for 642-37-4606 by Dr. Smith', '', '2.5.919.0.2.8309179.3.876.1533364176826736237', '114732'),
	(14, '20100512E481616', '19691108', 'P20260003', '박준혁', 'M', 2, '2026-08-21 11:04:31.047305', '8780ebd0-bc94633a-5ba23efa-8703e581-8066e5b8', 3, 'GLOVER^JASON', 1, b'1', '20260312', 'p4 20100512', '', '2.5.570.1.0.7178149.8.565.2125777254099085946', '155801'),
	(15, '20140116E852187', '19691108', 'P20260003', '박준혁', 'M', 2, '2026-08-21 11:04:31.169018', 'cba12f95-cebc36ff-8a260356-d093f6d7-836b408c', 3, 'MONTGOMERY^LANCE', 1, b'1', '20260405', 'p4 at SHM', '', '1.2.992.1.1.8329200.5.287.1775126916516642555', '112620'),
	(16, '', '19920417', 'P20260004', '최서연', 'F', 15, '2026-08-21 11:04:31.116827', 'ac102557-69443a8d-850b57a8-bda0ed67-77a2b518', 4, '', 1, b'1', '20260120', '_t9of9MRI IAMS', '', '1.3.6.1.4.1.14519.5.2.1.123205352144872232888453437401659093711', '134559.011000'),
	(17, '', '19920417', 'P20260004', '최서연', 'F', 6, '2026-08-21 11:04:31.074307', '960301fe-e8158fd3-3c10d074-d77b0d33-2910eeab', 4, '', 1, b'1', '20260210', '_t6of6MRI IAMS', '', '1.3.6.1.4.1.14519.5.2.1.116993132085438942562172285283469526764', '181526.820000'),
	(18, '', '19570930', 'P20260005', '정우진', 'M', 21, '2026-08-21 11:04:31.149901', 'c97d5e9b-d3b61fa8-47f67282-e4f13cd0-d8ab608d', 5, '', 1, b'1', '20250815', 'MC prostaat kliniek detectie-mc MCPROSKL30', '', '1.3.6.1.4.1.14519.5.2.1.8700.9920.262275136724490339595457452378', '183435'),
	(19, '', '19570930', 'P20260005', '정우진', 'M', 19, '2026-08-21 11:04:31.198296', 'd8073dc7-eb9fdc38-582f97c4-2e088ece-3becd29e', 5, '', 1, b'1', '20260220', 'MR prostaat kanker detectie ND_mc MCAPRODETN', '', '1.3.6.1.4.1.14519.5.2.1.8700.9920.171145457958329446392827593065', '082839'),
	(20, '', '19780315', 'P20260001', '김민수', 'M', 18, '2026-08-21 11:04:31.009032', '56d65ec4-f79e9d65-f5c337e0-b4956253-c02a37d9', 1, '', 1, b'1', '20260401', 'MRI Abdomen', '', '1.3.6.1.4.1.14519.5.2.1.8700.9920.279048145736692258559533322569', '085617'),
	(21, '', '19780315', 'P20260001', '김민수', 'M', 34, '2026-08-21 11:04:31.221298', 'e6e04e5c-003d2e0b-b54441d5-7c81494e-1a12c3a8', 1, '', 1, b'1', '20260820', 'MRI Abdomen', '', '1.3.6.1.4.1.14519.5.2.1.8700.9920.469621518149136033584074082051', '140900'),
	(22, '2356173256177297', '19811204', 'P20260006', '한지훈', 'M', 6, '2026-08-21 11:04:31.090831', 'a094eb96-8ea6f6e8-4172659f-54c91451-e44814f7', 6, '', 1, b'1', '20260218', 'RT^RCCT_THORAX_8F_High (Adult)', '', '1.3.6.1.4.1.14519.5.2.1.7014.4598.238478060677653494401819620444', '112017.690000'),
	(23, '1123217199332333', '19811204', 'P20260006', '한지훈', 'M', 6, '2026-08-21 11:04:31.290250', 'f6514a38-d7baa4c5-266957cb-9cb28b0b-c4932aeb', 6, '', 1, b'1', '20260811', 'RT^RCCT_THORAX_8F_High (Adult)', '', '1.3.6.1.4.1.14519.5.2.1.7014.4598.816327386653410772475068003264', '132711.387000');

-- 테이블 caretrace.examination_series 구조 내보내기
DROP TABLE IF EXISTS `examination_series`;
CREATE TABLE IF NOT EXISTS `examination_series` (
  `examination_series_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `instance_count` int(11) NOT NULL,
  `modality` varchar(20) DEFAULT NULL,
  `orthanc_series_id` varchar(100) NOT NULL,
  `series_description` varchar(500) DEFAULT NULL,
  `series_instance_uid` varchar(128) NOT NULL,
  `series_number` varchar(20) DEFAULT NULL,
  `examination_id` bigint(20) NOT NULL,
  `reg_date` datetime(6) NOT NULL,
  `update_date` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`examination_series_id`),
  UNIQUE KEY `UK4x0koih1dkvof0ght0ptnbqff` (`orthanc_series_id`),
  UNIQUE KEY `UK8pywjm80tjh18ccfdh516s3km` (`series_instance_uid`),
  KEY `FK6by30k72utp7aj1lk5p5fmb5b` (`examination_id`),
  CONSTRAINT `FK6by30k72utp7aj1lk5p5fmb5b` FOREIGN KEY (`examination_id`) REFERENCES `examination` (`examination_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- 테이블 데이터 caretrace.examination_series:~17 rows (대략적) 내보내기
INSERT INTO `examination_series` (`examination_series_id`, `instance_count`, `modality`, `orthanc_series_id`, `series_description`, `series_instance_uid`, `series_number`, `examination_id`, `reg_date`, `update_date`) VALUES
	(10, 1, 'MR', '8fc569fc-a90e36df-3b4349ae-ff3aea0c-f06f3210', 'AX_IN_OUT_PHASE', '1.3.6.1.4.1.14519.5.2.1.1620.1226.341860503021195228160695044852', '7001', 6, '0000-00-00 00:00:00.000000', NULL),
	(11, 1, 'CT', '0422a032-30ec2dbc-0b62dc9a-3afe473e-2538ad78', 'PANCREAS_iDose_3_', '1.3.6.1.4.1.14519.5.2.1.1620.1226.216029866767405171134128701315', '504', 7, '0000-00-00 00:00:00.000000', NULL),
	(12, 1, 'MG', '64b41097-749f52a6-2a75b56c-bcbacf7a-9dcc371e', 'DBT slices', '1.3.6.1.4.1.14519.5.2.1.2135.6389.186088763319714645592218731061', '', 8, '0000-00-00 00:00:00.000000', NULL),
	(13, 1, 'MG', '6e5b2e7a-1b94d088-07982d4c-f3f4dca3-d09d4936', 'DBT slices', '1.3.6.1.4.1.14519.5.2.1.2135.6389.224272799382313097764735202941', '', 9, '0000-00-00 00:00:00.000000', NULL),
	(14, 6, 'CT', '9df1d528-3b211a84-c9c1b7de-d3970e31-24b7837a', 'HIGH RES', '1.2.840.113704.1.111.2112.1167842347.17', '4', 10, '0000-00-00 00:00:00.000000', NULL),
	(15, 6, 'CT', '42b56641-6acb944a-a7d0a507-559a6d72-b6b72b01', 'HIGH RES', '1.2.840.113704.1.111.1724.1168392386.17', '4', 11, '0000-00-00 00:00:00.000000', NULL),
	(16, 5, 'CT', '4da70d92-549aeb10-383d408a-bb586092-17a86586', 'Performed 20101122', '2.5.919.0.2.8309179.3.876.1990786863049671177', '20101122', 12, '0000-00-00 00:00:00.000000', NULL),
	(18, 2, 'CT', 'd275757b-eff05445-9e5475b1-eae39a1b-456ea861', 'P4^P111^S102^I0, Gated, 90.0% 20100512', '2.5.570.1.0.7178149.8.565.3800908094096615887', '509', 14, '0000-00-00 00:00:00.000000', NULL),
	(19, 2, 'CT', '00c05ee6-60a28333-879de587-718ad19e-fe0a86ab', 'P4^P115^S102^I0, Gated, 50.0% for 5747297676', '1.2.992.1.1.8329200.5.287.1847819022802444267', '505', 15, '0000-00-00 00:00:00.000000', NULL),
	(21, 15, 'MR', '1536a4c2-c9cd3916-54f8eb31-388cc715-14ecaedc', '_T1_t1_tse_cor_2mm_gad', '1.3.6.1.4.1.14519.5.2.1.226480461380810003335120359684857656403', '13', 16, '0000-00-00 00:00:00.000000', NULL),
	(22, 6, 'MR', 'f064a7f2-42aaa9cf-8ba76e23-218deb13-142131bf', '_T2_t2_space_tra_iso_ZOOMit', '1.3.6.1.4.1.14519.5.2.1.327811764605603545389539105840923199010', '8', 17, '0000-00-00 00:00:00.000000', NULL),
	(23, 21, 'MR', '3782d264-3c210b96-d3b048d1-7cc06ac6-65e62fa5', 't2_tse_tra', '1.3.6.1.4.1.14519.5.2.1.8700.9920.271686305520627319742666876609', '5', 18, '0000-00-00 00:00:00.000000', NULL),
	(24, 19, 'MR', 'd9b0ae82-6339917e-b6ad21b5-cc5a1f75-92e3f1ea', 't2_tse_tra', '1.3.6.1.4.1.14519.5.2.1.8700.9920.309955855112758555676275182378', '4', 19, '0000-00-00 00:00:00.000000', NULL),
	(25, 18, 'MR', 'cae42116-44cc7907-686d7251-73be115d-f459cc34', 'LOCALIZER FB', '1.3.6.1.4.1.14519.5.2.1.8700.9920.237829328631228943003981827607', '1', 20, '0000-00-00 00:00:00.000000', NULL),
	(26, 34, 'MR', '7433a3aa-610f2af7-052e17ff-15dc5476-72e05832', 'T2 AX BH', '1.3.6.1.4.1.14519.5.2.1.8700.9920.156180602090050547147466430709', '401', 21, '0000-00-00 00:00:00.000000', NULL),
	(27, 6, 'CT', '0c9f6ab9-dc68d9e5-e6d313d4-7084d047-2ddfb139', 'CT114545:RespCT  3.0  B30f  50% Ex', '1.3.6.1.4.1.14519.5.2.1.7014.4598.639871532605224417554459681163', '0', 22, '2026-08-21 10:44:52.538085', '2026-08-21 10:44:52.538085'),
	(28, 6, 'CT', 'd9517699-29fe75fa-ae62b6cd-57967daa-03eb2930', 'CT140006:RespCT  3.0  B30f  50% Ex', '1.3.6.1.4.1.14519.5.2.1.7014.4598.578895540487402949445746417374', '0', 23, '2026-08-21 10:48:33.213610', '2026-08-21 10:48:33.213610');

-- 테이블 caretrace.image_compare_set 구조 내보내기
DROP TABLE IF EXISTS `image_compare_set`;
CREATE TABLE IF NOT EXISTS `image_compare_set` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `current_image_url` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `doctor_id` bigint(20) DEFAULT NULL,
  `past_image_url` varchar(255) NOT NULL,
  `patient_id` bigint(20) unsigned NOT NULL,
  `reg_date` datetime(6) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKskon0f49k2ryfj0ml0t95e42e` (`doctor_id`),
  KEY `FKj10ob0oge1b4jjkbr4bmkaers` (`patient_id`),
  CONSTRAINT `FKj10ob0oge1b4jjkbr4bmkaers` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `FKskon0f49k2ryfj0ml0t95e42e` FOREIGN KEY (`doctor_id`) REFERENCES `medical_staff` (`staff_no`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- 테이블 데이터 caretrace.image_compare_set:~1 rows (대략적) 내보내기
INSERT INTO `image_compare_set` (`id`, `current_image_url`, `description`, `doctor_id`, `past_image_url`, `patient_id`, `reg_date`, `title`, `updated_at`) VALUES
	(3, '1.3.6.1.4.1.14519.5.2.1.8700.9920.469621518149136033584074082051', '', NULL, '1.3.6.1.4.1.14519.5.2.1.8700.9920.279048145736692258559533322569', 1, '2026-08-21 10:05:24.507573', 'dd', NULL);

-- 테이블 caretrace.lesion 구조 내보내기
DROP TABLE IF EXISTS `lesion`;
CREATE TABLE IF NOT EXISTS `lesion` (
  `lesion_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `case_id` bigint(20) unsigned NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `description` text DEFAULT NULL,
  `is_deleted` varchar(1) NOT NULL,
  `is_lymph_node` bit(1) NOT NULL,
  `lesion_label` varchar(50) NOT NULL,
  `lesion_type` enum('NEW','NON_TARGET','TARGET') DEFAULT NULL,
  `organ` varchar(100) DEFAULT NULL,
  `reg_date` datetime(6) NOT NULL,
  `update_date` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`lesion_id`),
  KEY `FK8j58u4r93bp5e2l8rlcl6dqs9` (`case_id`),
  KEY `FK784kalekgo1ntqrhnr1619ne8` (`created_by`),
  CONSTRAINT `FK784kalekgo1ntqrhnr1619ne8` FOREIGN KEY (`created_by`) REFERENCES `medical_staff` (`staff_no`),
  CONSTRAINT `FK8j58u4r93bp5e2l8rlcl6dqs9` FOREIGN KEY (`case_id`) REFERENCES `patient_case` (`case_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- 테이블 데이터 caretrace.lesion:~11 rows (대략적) 내보내기
INSERT INTO `lesion` (`lesion_id`, `case_id`, `created_by`, `description`, `is_deleted`, `is_lymph_node`, `lesion_label`, `lesion_type`, `organ`, `reg_date`, `update_date`) VALUES
	(1, 1, 1, '수정 테스트', 'Y', b'1', 'TEST-LN-01-수정', 'TARGET', 'Lung', '2026-08-13 16:16:32.760471', '2026-08-19 16:09:27.452435'),
	(2, 1, 1, 'ffff', 'Y', b'0', 'f', 'TARGET', 'f', '2026-08-19 14:49:28.800422', '2026-08-19 15:00:21.718070'),
	(3, 1, 4, 'd', 'Y', b'0', 'd', 'TARGET', 'd', '2026-08-19 15:13:23.459348', '2026-08-19 15:16:47.463467'),
	(4, 1, 13, '초기 발견 병변, 우엽 5구역', 'N', b'0', '간 우엽 종양', 'TARGET', '간', '2026-08-19 16:10:09.013768', '2026-08-19 16:10:09.013768'),
	(5, 2, 1, '우측 유방 상외측 사분면에 위치한 종괴, 초진 시 장경 2.3cm, 침윤성 유관암 의심', 'N', b'0', 'Rt breast mass', 'TARGET', 'Breast (Right)', '2026-08-20 13:57:07.026275', '2026-08-20 13:57:07.026275'),
	(6, 3, 1, '우상엽에 위치한 8mm 크기의 고형 결절. 경계 비교적 명확하며 추적관찰 대상.', 'N', b'0', 'RUL-Nodule-1', 'TARGET', '폐(우상엽, RUL)', '2026-08-20 15:06:35.573547', '2026-08-20 15:06:35.573547'),
	(7, 3, 1, '간 S6 구역에 위치한 12mm 저음영 병변. 전이성 병변 의심되나 크기가 작아 비표적병변으로 분류.', 'N', b'0', 'Liver-S6-Met-1', 'NON_TARGET', '간(S6 segment)', '2026-08-20 15:44:54.202096', '2026-08-20 15:44:54.202096'),
	(8, 4, 1, '우측 전두엽에 위치한 25mm 크기의 조영증강 종괴. 주변부 부종 동반, 신경교종 의심되어 표적병변으로 지정.', 'N', b'0', 'Brain-Rt-Frontal-Mass', 'TARGET', '뇌(우측 전두엽)', '2026-08-20 16:58:41.986074', '2026-08-20 16:58:41.986074'),
	(9, 5, 1, '전립선 좌측 말초대(peripheral zone)에 위치한 15mm 크기의 저신호 병변. PI-RADS 4 소견으로 표적병변 지정.', 'N', b'0', 'Prostate-PZ-Lt-Lesion1', 'TARGET', '전립선(좌측 말초대)', '2026-08-20 17:24:26.430188', '2026-08-20 17:24:26.430188'),
	(10, 6, 1, '우측 신장 상극에 위치한 20mm 크기의 단순 낭종. 경계 명확하고 조영증강 없음(Bosniak I). 악성 소견 없어 비표적병변으로 분류.', 'N', b'0', 'Kidney-Rt-Cyst-1', 'NON_TARGET', '신장(우측)', '2026-08-21 09:59:39.830258', '2026-08-21 09:59:39.830258'),
	(11, 7, 1, '기관분지하 림프절(station 7)에 위치한 단축 18mm 크기의 종대된 림프절. 폐암 전이 의심되어 표적병변으로 지정.', 'N', b'0', 'Mediastinal-LN-Station7', 'TARGET', '종격동(림프절, station 7)', '2026-08-21 10:19:48.973187', '2026-08-21 10:19:48.973187');

-- 테이블 caretrace.lesion_measurement 구조 내보내기
DROP TABLE IF EXISTS `lesion_measurement`;
CREATE TABLE IF NOT EXISTS `lesion_measurement` (
  `measurement_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `area_mm2` decimal(10,2) DEFAULT NULL,
  `examination_id` bigint(20) NOT NULL,
  `frame_number` int(11) DEFAULT NULL,
  `instance_number` int(11) DEFAULT NULL,
  `is_deleted` varchar(1) NOT NULL,
  `long_axis_mm` decimal(10,2) DEFAULT NULL,
  `measured_at` datetime(6) NOT NULL,
  `measured_by` bigint(20) NOT NULL,
  `memo` text DEFAULT NULL,
  `pixel_spacing_x` decimal(10,6) DEFAULT NULL,
  `pixel_spacing_y` decimal(10,6) DEFAULT NULL,
  `reg_date` datetime(6) NOT NULL,
  `roi_points` text NOT NULL,
  `roi_type` enum('ELLIPSE','LENGTH','POINT','POLYGON','RECTANGLE') NOT NULL,
  `series_instance_uid` varchar(64) DEFAULT NULL,
  `short_axis_mm` decimal(10,2) DEFAULT NULL,
  `slice_thickness` decimal(10,6) DEFAULT NULL,
  `sop_instance_uid` varchar(64) DEFAULT NULL,
  `study_instance_uid` varchar(64) DEFAULT NULL,
  `update_date` datetime(6) DEFAULT NULL,
  `window_center` int(11) DEFAULT NULL,
  `window_width` int(11) DEFAULT NULL,
  `lesion_id` bigint(20) NOT NULL,
  `area_px2` decimal(10,2) DEFAULT NULL,
  `long_axis_px` decimal(10,2) DEFAULT NULL,
  `short_axis_px` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`measurement_id`),
  KEY `FKsygulx530h9wl6ha87k9fg1s7` (`lesion_id`),
  KEY `FKso5luf2pt57qwebf6blg5g1u3` (`measured_by`),
  KEY `FKjmaar120hrgn9jt6upqcamf67` (`examination_id`),
  CONSTRAINT `FKjmaar120hrgn9jt6upqcamf67` FOREIGN KEY (`examination_id`) REFERENCES `examination` (`examination_id`),
  CONSTRAINT `FKso5luf2pt57qwebf6blg5g1u3` FOREIGN KEY (`measured_by`) REFERENCES `medical_staff` (`staff_no`),
  CONSTRAINT `FKsygulx530h9wl6ha87k9fg1s7` FOREIGN KEY (`lesion_id`) REFERENCES `lesion` (`lesion_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- 테이블 데이터 caretrace.lesion_measurement:~15 rows (대략적) 내보내기
INSERT INTO `lesion_measurement` (`measurement_id`, `area_mm2`, `examination_id`, `frame_number`, `instance_number`, `is_deleted`, `long_axis_mm`, `measured_at`, `measured_by`, `memo`, `pixel_spacing_x`, `pixel_spacing_y`, `reg_date`, `roi_points`, `roi_type`, `series_instance_uid`, `short_axis_mm`, `slice_thickness`, `sop_instance_uid`, `study_instance_uid`, `update_date`, `window_center`, `window_width`, `lesion_id`, `area_px2`, `long_axis_px`, `short_axis_px`) VALUES
	(5, NULL, 6, 1, 22, 'N', 60.64, '2026-08-20 10:58:23.849741', 1, NULL, 0.892900, 0.892900, '2026-08-20 10:58:23.856859', '[{"x":104.0,"y":253.5},{"x":170.0,"y":269.5}]', 'LENGTH', '1.3.6.1.4.1.14519.5.2.1.1620.1226.341860503021195228160695044852', NULL, 5.000000, '1.3.6.1.4.1.14519.5.2.1.1620.1226.188178517145998623585254540682', '1.3.6.1.4.1.14519.5.2.1.1620.1226.185573154804424189993810966597', '2026-08-20 10:58:23.856859', 5732, 21301, 4, NULL, NULL, NULL),
	(6, NULL, 7, 1, 53, 'N', 53.43, '2026-08-20 12:16:05.171171', 1, NULL, 0.683594, 0.683594, '2026-08-20 12:16:05.173171', '[{"x":132.74074074074073,"y":301.82716054765},{"x":201.82010582010582,"y":338.3985891190786}]', 'LENGTH', '1.3.6.1.4.1.14519.5.2.1.1620.1226.216029866767405171134128701315', NULL, 2.500000, '1.3.6.1.4.1.14519.5.2.1.1620.1226.257586797354547735232357873393', '1.3.6.1.4.1.14519.5.2.1.1620.1226.232807312259441781994074034892', '2026-08-20 12:16:05.173171', 60, 360, 4, NULL, NULL, NULL),
	(7, NULL, 8, 1, 6, 'N', 15.01, '2026-08-20 14:01:10.004656', 1, NULL, 0.085000, 0.085000, '2026-08-20 14:01:10.013656', '[{"x":277.49152542372883,"y":500.7849431394621},{"x":433.6949152542373,"y":583.2246377959507}]', 'LENGTH', '1.3.6.1.4.1.14519.5.2.1.2135.6389.186088763319714645592218731061', NULL, NULL, '1.3.6.1.4.1.14519.5.2.1.2135.6389.125212288797371813414141301820', '1.3.6.1.4.1.14519.5.2.1.2135.6389.227610418901852828311674038725', '2026-08-20 14:47:24.616859', NULL, NULL, 5, NULL, 176.62, NULL),
	(8, NULL, 9, 1, 3, 'N', 12.28, '2026-08-20 14:01:44.437011', 1, NULL, 0.085000, 0.085000, '2026-08-20 14:01:44.437011', '[{"x":103.08404391628879,"y":704.281898184041},{"x":224.19593202817688,"y":625.4116691764074}]', 'LENGTH', '1.3.6.1.4.1.14519.5.2.1.2135.6389.224272799382313097764735202941', NULL, NULL, '1.3.6.1.4.1.14519.5.2.1.2135.6389.289136137096558548810686668062', '1.3.6.1.4.1.14519.5.2.1.2135.6389.236892609093917147551300569025', '2026-08-20 14:50:01.831565', NULL, NULL, 5, NULL, 144.53, NULL),
	(9, NULL, 10, 1, 100, 'N', 10.70, '2026-08-20 15:07:04.920768', 1, NULL, 0.707031, 0.707031, '2026-08-20 15:07:04.921764', '[{"x":140.0,"y":328.8333282470703},{"x":155.0,"y":330.8333282470703}]', 'LENGTH', '1.2.840.113704.1.111.2112.1167842347.17', NULL, 1.000000, '1.2.840.113704.1.111.5044.1167842503.12083', '1.2.840.113704.1.111.2112.1167842143.1', '2026-08-20 15:07:04.921764', -450, 2000, 6, NULL, 15.13, NULL),
	(10, NULL, 11, 1, 100, 'N', 10.21, '2026-08-20 15:12:50.839159', 1, NULL, 0.652344, 0.652344, '2026-08-20 15:12:50.840160', '[{"x":206.0,"y":357.83331298828125},{"x":220.0,"y":364.83331298828125}]', 'LENGTH', '1.2.840.113704.1.111.1724.1168392386.17', NULL, 1.000000, '1.2.840.113704.1.111.8040.1168392564.25990', '1.2.840.113704.1.111.1724.1168391407.1', '2026-08-20 15:12:50.840160', -450, 2000, 6, NULL, 15.65, NULL),
	(11, NULL, 12, 1, 28, 'N', 15.29, '2026-08-20 15:47:10.910664', 1, NULL, 0.977000, 0.977000, '2026-08-20 15:47:10.911663', '[{"x":264.0,"y":264.5},{"x":271.0,"y":278.5}]', 'LENGTH', '2.5.919.0.2.8309179.3.876.1990786863049671177', NULL, 3.000000, '2.5.919.0.2.8309179.3.876.8667847957196101658', '2.5.919.0.2.8309179.3.876.1533364176826736237', '2026-08-20 15:47:10.911663', NULL, NULL, 7, NULL, 15.65, NULL),
	(12, NULL, 16, 1, 1, 'N', 19.20, '2026-08-20 17:00:27.085734', 1, NULL, 0.562500, 0.562500, '2026-08-20 17:00:27.086733', '[{"x":187.0,"y":167.16665649414062},{"x":221.0,"y":164.16665649414062}]', 'LENGTH', '1.3.6.1.4.1.14519.5.2.1.226480461380810003335120359684857656403', NULL, 2.000000, '1.3.6.1.4.1.14519.5.2.1.319078267622249642448306495205166399545', '1.3.6.1.4.1.14519.5.2.1.123205352144872232888453437401659093711', '2026-08-20 17:00:27.086733', 443, 943, 8, NULL, 34.13, NULL),
	(13, NULL, 17, 1, 20, 'N', 20.72, '2026-08-20 17:00:36.566346', 1, NULL, 0.500000, 0.500000, '2026-08-20 17:00:36.567347', '[{"x":220.0,"y":63.83332824707031},{"x":261.0,"y":57.83332824707031}]', 'LENGTH', '1.3.6.1.4.1.14519.5.2.1.327811764605603545389539105840923199010', NULL, 0.500000, '1.3.6.1.4.1.14519.5.2.1.293016857265114842330737375354752006527', '1.3.6.1.4.1.14519.5.2.1.116993132085438942562172285283469526764', '2026-08-20 17:00:36.567347', 273, 640, 8, NULL, 41.44, NULL),
	(14, NULL, 18, 1, 8, 'N', 15.13, '2026-08-20 17:25:29.942229', 1, NULL, 0.500000, 0.500000, '2026-08-20 17:25:29.942229', '[{"x":146.0,"y":183.16666412353516},{"x":176.0,"y":179.16666412353516}]', 'LENGTH', '1.3.6.1.4.1.14519.5.2.1.8700.9920.271686305520627319742666876609', NULL, 3.000000, '1.3.6.1.4.1.14519.5.2.1.8700.9920.345653487691759913502946714473', '1.3.6.1.4.1.14519.5.2.1.8700.9920.262275136724490339595457452378', '2026-08-20 17:25:29.942229', 532, 1045, 9, NULL, 30.27, NULL),
	(15, NULL, 19, 1, 10, 'N', 17.49, '2026-08-20 17:25:46.868191', 1, NULL, 0.500000, 0.500000, '2026-08-20 17:25:46.868191', '[{"x":144.0,"y":174.16665649414062},{"x":174.0,"y":156.16665649414062}]', 'LENGTH', '1.3.6.1.4.1.14519.5.2.1.8700.9920.309955855112758555676275182378', NULL, 3.000000, '1.3.6.1.4.1.14519.5.2.1.8700.9920.213750487458384074223629074894', '1.3.6.1.4.1.14519.5.2.1.8700.9920.171145457958329446392827593065', '2026-08-20 17:25:46.868191', 504, 1010, 9, NULL, 34.99, NULL),
	(16, NULL, 20, 1, 6, 'N', 108.16, '2026-08-21 10:00:13.431656', 1, NULL, 0.976563, 0.976563, '2026-08-21 10:00:13.436770', '[{"x":233.0,"y":306.1666564941406},{"x":304.0,"y":221.16665649414062}]', 'LENGTH', '1.3.6.1.4.1.14519.5.2.1.8700.9920.237829328631228943003981827607', NULL, 6.000000, '1.3.6.1.4.1.14519.5.2.1.8700.9920.211714641924647975205434020892', '1.3.6.1.4.1.14519.5.2.1.8700.9920.279048145736692258559533322569', '2026-08-21 10:00:23.397738', 146, 364, 10, NULL, 110.75, NULL),
	(17, NULL, 21, 1, 11, 'N', 60.19, '2026-08-21 10:00:42.218351', 1, NULL, 1.406250, 1.406250, '2026-08-21 10:00:42.218351', '[{"x":71.33331298828125,"y":152.16665649414062},{"x":105.33331298828125,"y":178.16665649414062}]', 'LENGTH', '1.3.6.1.4.1.14519.5.2.1.8700.9920.156180602090050547147466430709', NULL, 6.000000, '1.3.6.1.4.1.14519.5.2.1.8700.9920.330657171543289926062066336212', '1.3.6.1.4.1.14519.5.2.1.8700.9920.469621518149136033584074082051', '2026-08-21 10:00:42.218351', 1360, 2364, 10, NULL, 42.80, NULL),
	(18, NULL, 22, 1, 65, 'N', 79.92, '2026-08-21 11:04:51.714717', 1, NULL, 0.976563, 0.976563, '2026-08-21 11:04:51.720714', '[{"x":172.66665649414062,"y":244.16665649414062},{"x":239.66665649414062,"y":291.1666564941406}]', 'LENGTH', '1.3.6.1.4.1.14519.5.2.1.7014.4598.639871532605224417554459681163', NULL, 3.000000, '1.3.6.1.4.1.14519.5.2.1.7014.4598.205328478001424609997618801609', '1.3.6.1.4.1.14519.5.2.1.7014.4598.238478060677653494401819620444', '2026-08-21 11:04:51.720714', 40, 400, 11, NULL, 81.84, NULL),
	(19, NULL, 23, 1, 65, 'N', 100.81, '2026-08-21 11:05:01.040757', 1, NULL, 0.976563, 0.976563, '2026-08-21 11:05:01.041760', '[{"x":164.66665649414062,"y":252.16665649414062},{"x":248.66665649414062,"y":312.1666564941406}]', 'LENGTH', '1.3.6.1.4.1.14519.5.2.1.7014.4598.578895540487402949445746417374', NULL, 3.000000, '1.3.6.1.4.1.14519.5.2.1.7014.4598.335027039713571249566211790538', '1.3.6.1.4.1.14519.5.2.1.7014.4598.816327386653410772475068003264', '2026-08-21 11:05:01.041760', 40, 400, 11, NULL, 103.23, NULL);

-- 테이블 caretrace.medical_staff 구조 내보내기
DROP TABLE IF EXISTS `medical_staff`;
CREATE TABLE IF NOT EXISTS `medical_staff` (
  `staff_no` bigint(20) NOT NULL AUTO_INCREMENT,
  `employee_no` varchar(50) NOT NULL,
  `login_id` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `staff_name` varchar(50) NOT NULL,
  `department_no` bigint(20) NOT NULL,
  `job_title` varchar(50) NOT NULL,
  `license_no` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` varchar(30) NOT NULL DEFAULT 'MEDICAL_STAFF',
  `account_status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `is_deleted` varchar(1) NOT NULL,
  `reg_date` datetime NOT NULL DEFAULT current_timestamp(),
  `update_date` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`staff_no`),
  UNIQUE KEY `employee_no` (`employee_no`),
  UNIQUE KEY `login_id` (`login_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `license_no` (`license_no`),
  KEY `department_no` (`department_no`),
  CONSTRAINT `fk_medical_staff_department` FOREIGN KEY (`department_no`) REFERENCES `department` (`department_no`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- 테이블 데이터 caretrace.medical_staff:~12 rows (대략적) 내보내기
INSERT INTO `medical_staff` (`staff_no`, `employee_no`, `login_id`, `password`, `staff_name`, `department_no`, `job_title`, `license_no`, `email`, `phone`, `role`, `account_status`, `is_deleted`, `reg_date`, `update_date`) VALUES
	(1, 'M2026001', 'kimdy', '{bcrypt}$2b$12$Z4vQEtD3IXAhXTh.ONhFeOjeFg9VZ03FvhEVZglCwdc6JtFWsY1u2', '김도윤', 1, '순환기내과 과장', 'MED-2026-0001', 'dy.kim@caretrace-hospital.com', '02-2010-3101', 'MEDICAL_STAFF', 'ACTIVE', 'N', '2026-08-11 14:01:26', '2026-08-19 14:51:37'),
	(2, 'M2026002', 'leesh', '$2a$10$p.2/v3P3C1j7Cn49XA.MHOkMdVIs0H9.N9nsNdiOZcxHSe2tpXWDm', '이서현', 6, '신경과 전문의', 'MED-2026-0002', 'sh.lee@caretrace-hospital.com', '02-2010-3201', 'MEDICAL_STAFF', 'ACTIVE', 'N', '2026-08-11 14:12:03', '2026-08-19 14:51:37'),
	(3, 'M2026003', 'parkjh', '$2a$10$L44cBo9guKq84z013ej1geCmX8mYGifeoMfQMEQ9qMaUMsg97TpMi', '박준호', 5, '영상의학과 전문의', 'MED-2026-0003', 'jh.park@caretrace-hospital.com', '02-2010-3301', 'MEDICAL_STAFF', 'ACTIVE', 'N', '2026-08-11 14:37:45', '2026-08-19 14:51:37'),
	(4, 'A2026001', 'admin01', '{bcrypt}$2b$12$Z4vQEtD3IXAhXTh.ONhFeOjeFg9VZ03FvhEVZglCwdc6JtFWsY1u2', '최은정', 10, '시스템 관리자', NULL, 'admin@caretrace-hospital.com', '02-2010-3000', 'ADMIN', 'ACTIVE', 'N', '2026-08-12 14:34:57', '2026-08-19 14:51:37'),
	(8, 'M2026004', 'hanjw', '{bcrypt}$2a$10$iqHXkwMoptB9B1hUFA8zI.1WrJ3HsY2iDH10A3iu9V0N6HyQGssY2', '한지우', 7, '혈액종양내과 전문의', 'MED-2026-0004', 'jw.han@caretrace-hospital.com', '02-2010-3401', 'MEDICAL_STAFF', 'ACTIVE', 'N', '2026-08-19 14:53:27', '2026-08-19 14:53:27'),
	(9, 'M2026005', 'ohms', '{bcrypt}$2a$10$W7nST3nFYNtPEVAozCjU.OEMtq/xvgY/21BV5Ap6PiRqnKTA0Cs7a', '오민석', 8, '호흡기내과 전문의', 'MED-2026-0005', 'ms.oh@caretrace-hospital.com', '02-2010-3501', 'MEDICAL_STAFF', 'ACTIVE', 'N', '2026-08-19 14:54:20', '2026-08-19 14:54:20'),
	(10, 'M2026006', 'jungyj', '{bcrypt}$2a$10$EM/KE/5lCppXVfxdAmALq.FF/UPFOdO1SNRxYj2D13hAHDfsvX.BW', '정유진', 9, '소화기내과 전문의', 'MED-2026-0006', 'yj.jung@caretrace-hospital.com', '02-2010-3601', 'MEDICAL_STAFF', 'ACTIVE', 'N', '2026-08-19 14:55:46', '2026-08-19 14:55:46'),
	(11, 'M2026007', 'kangsj', '{bcrypt}$2a$10$NOPLbCqEL5WP17f/UaoTfeXB9gAJYGLxwRQ4vZCJinBct7w9FyhSy', '강서준', 5, '영상의학과 전문의', 'MED-2026-0007', 'sj.kang@caretrace-hospital.com', '02-2010-3701', 'MEDICAL_STAFF', 'INACTIVE', 'N', '2026-08-19 14:57:08', '2026-08-19 16:03:38'),
	(12, 'M2026008', 'yoonhn', '{bcrypt}$2a$10$VZZTHTHXeSnakzPtEUyaDukGtdRlRP7arUP2F69vQxV1t8wdJQmFa', '윤하늘', 1, '순환기내과 전임의', 'MED-2026-0008', 'hn.yoon@caretrace-hospital.com', '02-2010-380', 'MEDICAL_STAFF', 'ACTIVE', 'N', '2026-08-19 14:58:05', '2026-08-19 14:58:05'),
	(13, 'M2026009', 'baehw', '{bcrypt}$2a$10$AGh1Mn6h02hnYKhTe4C.c.S4YI4zRdmatQstOVuuHEGMAPSfyLKKu', '배현우', 6, '신경과 전임의', 'MED-2026-0009', 'hw.bae@caretrace-hospital.com', '02-2010-3901', 'MEDICAL_STAFF', 'ACTIVE', 'N', '2026-08-19 15:00:29', '2026-08-19 15:00:29'),
	(14, 'M2026010', 'choiyr', '{bcrypt}$2a$10$dan8zqP0Sm67reETtwxtVu186Fto8li.5wY.ampA4tk52ghBNgyL6', '최유리', 7, '혈액종양내과 전임의', 'MED-2026-0010', 'yr.choi@caretrace-hospital.com', '02-2010-4001', 'MEDICAL_STAFF', 'ACTIVE', 'N', '2026-08-19 15:01:09', '2026-08-19 15:01:09'),
	(15, 'M2026011', 'songhj', '{bcrypt}$2a$10$Jw/lt3AHzJBQN3IJG5.gQ.JCaG5SZrida4zp3jcS3Zi3ZivB6TB5m', '송하진', 8, '호흡기내과 전임의', 'MED-2026-0011', 'hj.song@caretrace-hospital.com', '02-2010-4101', 'MEDICAL_STAFF', 'ACTIVE', 'N', '2026-08-19 16:02:04', '2026-08-19 16:02:04');

-- 테이블 caretrace.patient 구조 내보내기
DROP TABLE IF EXISTS `patient`;
CREATE TABLE IF NOT EXISTS `patient` (
  `patient_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '환자 번호',
  `patient_code` varchar(50) NOT NULL COMMENT '환자 식별번호 (DICOM PatientID)',
  `patient_name` varchar(50) NOT NULL COMMENT '환자명',
  `birth_date` date NOT NULL COMMENT '생년월일',
  `gender` varchar(10) NOT NULL COMMENT '성별: M, F, O',
  `phone` varchar(20) DEFAULT NULL COMMENT '연락처',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일시',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
  `is_deleted` varchar(1) NOT NULL,
  PRIMARY KEY (`patient_id`),
  UNIQUE KEY `uk_patient_code` (`patient_code`),
  CONSTRAINT `chk_patient_gender` CHECK (`gender` in ('M','F','O')),
  CONSTRAINT `chk_patient_is_deleted` CHECK (`is_deleted` in ('Y','N'))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='환자 목록';

-- 테이블 데이터 caretrace.patient:~12 rows (대략적) 내보내기
INSERT INTO `patient` (`patient_id`, `patient_code`, `patient_name`, `birth_date`, `gender`, `phone`, `created_at`, `updated_at`, `is_deleted`) VALUES
	(1, 'P20260001', '김민수', '1978-03-15', 'M', '010-1234-5678', '2026-08-11 16:24:23', '2026-08-11 16:24:23', 'N'),
	(2, 'P20260002', '이지은', '1985-07-22', 'F', '010-2345-6789', '2026-08-11 16:24:23', '2026-08-11 16:24:23', 'N'),
	(3, 'P20260003', '박준혁', '1969-11-08', 'M', '010-3456-7890', '2026-08-11 16:24:23', '2026-08-11 16:24:23', 'N'),
	(4, 'P20260004', '최서연', '1992-04-17', 'F', '010-4567-8901', '2026-08-11 16:24:23', '2026-08-11 16:24:23', 'N'),
	(5, 'P20260005', '정우진', '1957-09-30', 'M', '010-5678-9012', '2026-08-11 16:24:23', '2026-08-11 16:24:23', 'N'),
	(6, 'P20260006', '한지훈', '1981-12-04', 'M', '010-6789-0123', '2026-08-11 16:24:23', '2026-08-11 16:24:23', 'N'),
	(7, 'P20260007', '윤서현', '1974-06-19', 'F', '010-7890-1234', '2026-08-11 16:24:23', '2026-08-11 16:24:23', 'N'),
	(8, 'P20260008', '강도윤', '1965-10-27', 'M', '010-8901-2345', '2026-08-11 16:24:23', '2026-08-14 10:13:23', 'Y'),
	(9, 'P20260009', '강도연', '2012-12-13', 'F', '010-8901-2345', '2026-08-14 10:15:32', '2026-08-18 09:50:01', 'N'),
	(10, 'P20260010', '환자이름', '2026-07-30', 'F', '010-8901-2349', '2026-08-18 09:50:30', '2026-08-18 09:51:05', 'Y'),
	(11, 'P20260099', '환자명', '2026-08-01', 'F', '010-8901-2349', '2026-08-19 14:57:21', '2026-08-19 15:01:29', 'Y'),
	(12, 'P20260011', '박현정', '2012-07-25', 'M', '010-1111-2222', '2026-08-19 16:06:31', '2026-08-19 16:07:00', 'Y');

-- 테이블 caretrace.patient_case 구조 내보내기
DROP TABLE IF EXISTS `patient_case`;
CREATE TABLE IF NOT EXISTS `patient_case` (
  `case_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '케이스 번호',
  `patient_id` bigint(20) unsigned NOT NULL COMMENT '환자 번호',
  `staff_no` bigint(20) NOT NULL COMMENT '담당 의료진 번호',
  `diagnosis` varchar(200) NOT NULL COMMENT '진단명',
  `body_part` varchar(100) DEFAULT NULL COMMENT '병변 부위',
  `case_status` varchar(30) NOT NULL DEFAULT 'FOLLOW_UP' COMMENT '케이스 상태: FOLLOW_UP, TREATMENT, COMPLETED',
  `start_date` date NOT NULL COMMENT '추적 시작일',
  `end_date` date DEFAULT NULL COMMENT '추적 종료일',
  `memo` text DEFAULT NULL COMMENT '메모',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일시',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
  `is_deleted` varchar(1) NOT NULL,
  PRIMARY KEY (`case_id`),
  KEY `idx_patient_case_patient` (`patient_id`,`case_status`),
  KEY `idx_patient_case_staff` (`staff_no`),
  CONSTRAINT `fk_patient_case_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_patient_case_staff` FOREIGN KEY (`staff_no`) REFERENCES `medical_staff` (`staff_no`) ON UPDATE CASCADE,
  CONSTRAINT `chk_patient_case_status` CHECK (`case_status` in ('FOLLOW_UP','TREATMENT','COMPLETED')),
  CONSTRAINT `chk_patient_case_is_deleted` CHECK (`is_deleted` in ('Y','N'))
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='환자 추적 관찰 케이스';

-- 테이블 데이터 caretrace.patient_case:~13 rows (대략적) 내보내기
INSERT INTO `patient_case` (`case_id`, `patient_id`, `staff_no`, `diagnosis`, `body_part`, `case_status`, `start_date`, `end_date`, `memo`, `created_at`, `updated_at`, `is_deleted`) VALUES
	(1, 1, 1, '간세포암', '간', 'FOLLOW_UP', '2026-01-10', NULL, '정기 추적 관찰', '2026-08-11 16:36:40', '2026-08-11 16:36:40', 'N'),
	(2, 2, 2, '유방암', '유방', 'TREATMENT', '2026-02-05', NULL, '항암 치료 중', '2026-08-11 16:36:40', '2026-08-11 16:36:40', 'N'),
	(3, 3, 1, '폐결절', '폐', 'FOLLOW_UP', '2026-03-12', NULL, '크기 변화 관찰', '2026-08-11 16:36:40', '2026-08-11 16:36:40', 'N'),
	(4, 4, 3, '뇌종양', '뇌', 'TREATMENT', '2026-01-20', NULL, '치료 반응 확인 필요', '2026-08-11 16:36:40', '2026-08-11 16:36:40', 'N'),
	(5, 5, 2, '전립선암', '전립선', 'COMPLETED', '2025-08-15', '2026-05-20', '추적 관찰 종료', '2026-08-11 16:36:40', '2026-08-11 16:36:40', 'N'),
	(6, 1, 3, '신장 낭종', '신장', 'FOLLOW_UP', '2026-04-01', NULL, '정기 검사 예정', '2026-08-11 16:36:40', '2026-08-11 16:36:40', 'N'),
	(7, 6, 1, '폐암', '폐', 'TREATMENT', '2026-02-18', NULL, '항암 치료 반응 관찰', '2026-08-11 16:36:40', '2026-08-11 16:36:40', 'N'),
	(8, 7, 2, '유방 종양', '유방', 'FOLLOW_UP', '2026-03-05', NULL, '정기 영상 추적', '2026-08-11 16:36:40', '2026-08-11 16:36:40', 'N'),
	(9, 8, 3, '간 종양', '간', 'FOLLOW_UP', '2026-01-25', NULL, '병변 크기 변화 확인', '2026-08-11 16:36:40', '2026-08-11 16:36:40', 'N'),
	(10, 6, 1, '심장이퍼', '심장', 'FOLLOW_UP', '2026-08-03', NULL, '', '2026-08-18 10:20:23', '2026-08-18 12:12:28', 'Y'),
	(11, 9, 2, '심장아퍼', '심장', 'FOLLOW_UP', '2026-08-01', NULL, '', '2026-08-18 10:20:49', '2026-08-19 10:38:08', 'N'),
	(12, 11, 9, '폐암', '폐', 'COMPLETED', '2026-08-16', '2026-08-19', '심각함. ', '2026-08-19 15:00:15', '2026-08-19 15:02:10', 'Y'),
	(13, 9, 15, '폐암', '폐', 'COMPLETED', '2026-08-06', '2026-08-19', '', '2026-08-19 16:08:21', '2026-08-19 16:08:53', 'Y');

-- 테이블 caretrace.treatment_response_report 구조 내보내기
DROP TABLE IF EXISTS `treatment_response_report`;
CREATE TABLE IF NOT EXISTS `treatment_response_report` (
  `report_id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '보고서 번호',
  `case_id` bigint(20) unsigned NOT NULL COMMENT '증례 번호',
  `staff_id` bigint(20) NOT NULL COMMENT '작성 의료진 번호',
  `evaluation_criteria` varchar(50) NOT NULL COMMENT '평가 기준',
  `evaluation_date` date NOT NULL COMMENT '평가 기준일',
  `response_result` varchar(20) NOT NULL COMMENT '치료 반응 결과: CR, PR, SD, PD',
  `size_change_rate` decimal(5,2) DEFAULT NULL COMMENT '병변 크기 변화율(%)',
  `report_content` varchar(200) NOT NULL COMMENT '판독 소견',
  `status` varchar(20) NOT NULL DEFAULT 'draft' COMMENT '보고서 상태: draft, confirmed, archived',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '등록일시',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '수정일시',
  `is_deleted` varchar(1) NOT NULL DEFAULT 'n' COMMENT '삭제 여부: y, n',
  PRIMARY KEY (`report_id`),
  KEY `idx_treatment_response_report_case_id` (`case_id`),
  KEY `idx_treatment_response_report_staff_id` (`staff_id`),
  CONSTRAINT `fk_treatment_response_report_case` FOREIGN KEY (`case_id`) REFERENCES `patient_case` (`case_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_treatment_response_report_staff` FOREIGN KEY (`staff_id`) REFERENCES `medical_staff` (`staff_no`) ON UPDATE CASCADE,
  CONSTRAINT `chk_treatment_response_result` CHECK (`response_result` in ('CR','PR','SD','PD')),
  CONSTRAINT `chk_treatment_response_report_status` CHECK (`status` in ('draft','confirmed','archived')),
  CONSTRAINT `chk_treatment_response_report_is_deleted` CHECK (`is_deleted` in ('y','n'))
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='치료 반응 평가 보고서 정보';

-- 테이블 데이터 caretrace.treatment_response_report:~21 rows (대략적) 내보내기
INSERT INTO `treatment_response_report` (`report_id`, `case_id`, `staff_id`, `evaluation_criteria`, `evaluation_date`, `response_result`, `size_change_rate`, `report_content`, `status`, `created_at`, `updated_at`, `is_deleted`) VALUES
	(1, 1, 1, 'RECIST 1.1', '2026-06-20', 'SD', 8.50, '기준 검사(1월) 대비 병변 크기 8.5% 증가하였으나 안정 병변 범위 내로 판단되어 정기 추적 관찰 지속.', 'CONFIRMED', '2026-06-21 16:00:00', '2026-08-13 12:08:40', 'n'),
	(2, 2, 2, 'RECIST 1.1', '2026-05-10', 'PR', -32.00, '항암 치료 후 병변 최장경 32% 감소하여 부분관해 소견. 현 치료 방침 유지 권고.', 'CONFIRMED', '2026-05-11 11:00:00', '2026-08-13 12:08:40', 'n'),
	(3, 3, 1, 'RECIST 1.1', '2026-06-12', 'PD', 37.50, '결절 장경 8mm에서 11mm로 증가(37.5%)하여 진행성 병변으로 평가됨. 조직검사 및 PET-CT 추가 검사 필요.', 'CONFIRMED', '2026-06-13 17:00:00', '2026-08-13 12:08:40', 'n'),
	(4, 4, 3, 'RANO', '2026-04-20', 'SD', 5.20, '종양 크기는 안정적이나 주변부 부종 소견 새롭게 관찰되어 협진 의견 회신 후 최종 판정 예정.', 'DRAFT', '2026-04-21 09:00:00', '2026-08-13 12:08:40', 'n'),
	(5, 5, 2, 'PSA response criteria', '2026-04-10', 'CR', -100.00, 'PSA 수치 정상화 및 영상학적 병변 소실 확인되어 완전관해로 판정, 추적 관찰 종료.', 'ARCHIVED', '2026-05-20 10:00:00', '2026-08-13 12:08:40', 'n'),
	(6, 7, 1, 'RECIST 1.1', '2026-05-18', 'PR', -28.30, '항암 치료 2주기 후 병변 크기 28.3% 감소하여 부분관해 확인. 협진 소견과 일치.', 'CONFIRMED', '2026-05-22 10:30:00', '2026-08-13 12:08:40', 'n'),
	(7, 8, 2, 'RECIST 1.1', '2026-06-05', 'SD', 3.10, '이전 검사 대비 크기 변화 미미(3.1% 증가)하여 안정 병변으로 평가, 3개월 후 재평가 예정.', 'DRAFT', '2026-06-06 09:30:00', '2026-08-13 12:08:40', 'n'),
	(8, 9, 3, 'RECIST 1.1', '2026-01-25', 'SD', 0.00, '최초 검사로 비교 대상 없어 기준 병변(baseline)으로 등록. 향후 검사와 비교 예정.', 'DRAFT', '2026-01-26 08:00:00', '2026-08-13 12:08:40', 'n'),
	(9, 1, 1, 'RECIST 1.1', '2026-06-20', 'SD', 8.50, '기준 검사(1월) 대비 병변 크기 8.5% 증가하였으나 안정 병변 범위 내로 판단되어 정기 추적 관찰 지속.', 'CONFIRMED', '2026-06-21 16:00:00', '2026-08-13 12:08:40', 'n'),
	(10, 2, 2, 'RECIST 1.1', '2026-05-10', 'PR', -32.00, '항암 치료 후 병변 최장경 32% 감소하여 부분관해 소견. 현 치료 방침 유지 권고.', 'CONFIRMED', '2026-05-11 11:00:00', '2026-08-13 12:08:40', 'n'),
	(11, 3, 1, 'RECIST 1.1', '2026-06-12', 'PD', 37.50, '결절 장경 8mm에서 11mm로 증가(37.5%)하여 진행성 병변으로 평가됨. 조직검사 및 PET-CT 추가 검사 필요.', 'CONFIRMED', '2026-06-13 17:00:00', '2026-08-13 12:08:40', 'n'),
	(12, 4, 3, 'RANO', '2026-04-20', 'SD', 5.20, '종양 크기는 안정적이나 주변부 부종 소견 새롭게 관찰되어 협진 의견 회신 후 최종 판정 예정.', 'DRAFT', '2026-04-21 09:00:00', '2026-08-13 12:08:40', 'n'),
	(13, 5, 2, 'PSA response criteria', '2026-04-10', 'CR', -100.00, 'PSA 수치 정상화 및 영상학적 병변 소실 확인되어 완전관해로 판정, 추적 관찰 종료.', 'ARCHIVED', '2026-05-20 10:00:00', '2026-08-13 12:08:40', 'n'),
	(14, 7, 1, 'RECIST 1.1', '2026-05-18', 'PR', -28.30, '항암 치료 2주기 후 병변 크기 28.3% 감소하여 부분관해 확인. 협진 소견과 일치.', 'CONFIRMED', '2026-05-22 10:30:00', '2026-08-13 12:08:40', 'n'),
	(15, 8, 2, 'RECIST 1.1', '2026-06-05', 'SD', 3.10, '이전 검사 대비 크기 변화 미미(3.1% 증가)하여 안정 병변으로 평가, 3개월 후 재평가 예정.', 'DRAFT', '2026-06-06 09:30:00', '2026-08-13 12:08:40', 'n'),
	(16, 9, 3, 'RECIST 1.1', '2026-01-25', 'SD', 0.00, '최초 검사로 비교 대상 없어 기준 병변(baseline)으로 등록. 향후 검사와 비교 예정.', 'DRAFT', '2026-01-26 08:00:00', '2026-08-13 12:08:40', 'n'),
	(17, 3, 2, 'RECIST 1.1', '2026-06-12', 'SD', 5.00, '중복 등록으로 인한 오기재 보고서.', 'DRAFT', '2026-06-13 10:00:00', '2026-08-13 12:08:40', 'y'),
	(18, 6, 1, '평가기준 예시', '2026-08-18', 'PR', 30.00, 'example수정', 'CONFIRMED', '2026-08-19 10:17:33', '2026-08-20 10:18:17', 'n'),
	(19, 8, 1, '예시 123', '2026-08-20', 'CR', 20.00, '예시 123', 'ARCHIVED', '2026-08-20 10:21:58', '2026-08-20 10:22:07', 'y'),
	(20, 6, 1, '평가기준 예시', '2026-08-01', 'PD', 30.00, '1234', 'ARCHIVED', '2026-08-20 10:26:17', '2026-08-20 10:26:35', 'y'),
	(21, 6, 1, '평가기준 예시', '2026-07-30', 'CR', 12.00, '1234', 'DRAFT', '2026-08-20 10:26:58', '2026-08-20 10:26:58', 'n');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
