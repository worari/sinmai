-- ข้อมูลเริ่มต้นสำหรับระบบสินไหม ทบ. (Seed Data 14 ตาราง จาก data-store.json)
BEGIN;

-- 1. โครงสร้างหน่วยทหาร
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('1st_ARMY', 'กองทัพภาคที่ 1 (ทภ.1)', 'ทภ.1', 'ทภ.1', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('1st_CORPS', 'กองทัพน้อยที่ 1 (ทน.1)', 'ทน.1', 'ทน.1', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('1st_LOG_CMD', 'กองบัญชาการช่วยรบที่ 1 (บชร.1)', 'บชร.1', 'บชร.1', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('2nd_ARMY', 'กองทัพภาคที่ 2 (ทภ.2)', 'ทภ.2', 'ทภ.2', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('2nd_CORPS', 'กองทัพน้อยที่ 2 (ทน.2)', 'ทน.2', 'ทน.2', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('2nd_LOG_CMD', 'กองบัญชาการช่วยรบที่ 2 (บชร.2)', 'บชร.2', 'บชร.2', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('3rd_ARMY', 'กองทัพภาคที่ 3 (ทภ.3)', 'ทภ.3', 'ทภ.3', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('3rd_CORPS', 'กองทัพน้อยที่ 3 (ทน.3)', 'ทน.3', 'ทน.3', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('3rd_LOG_CMD', 'กองบัญชาการช่วยรบที่ 3 (บชร.3)', 'บชร.3', 'บชร.3', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('4th_ARMY', 'กองทัพภาคที่ 4 (ทภ.4)', 'ทภ.4', 'ทภ.4', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('4th_CORPS', 'กองทัพน้อยที่ 4 (ทน.4)', 'ทน.4', 'ทน.4', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('4th_LOG_CMD', 'กองบัญชาการช่วยรบที่ 4 (บชร.4)', 'บชร.4', 'บชร.4', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AADC_RTA', 'หน่วยบัญชาการป้องกันภัยทางอากาศกองทัพบก (นปอ.)', 'นปอ.', 'นปอ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ADJ_GEN_RTA', 'กรมสารบรรณทหารบก (สบ.ทบ.)', 'สบ.ทบ.', 'สบ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AVN_CTR_RTA', 'ศูนย์การบินทหารบก (ศบบ.)', 'ศบบ.', 'ศบบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AWC_RTA', 'วิทยาลัยการทัพบก (วทบ.)', 'วทบ.', 'วทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CGSC_RTA', 'โรงเรียนเสนาธิการทหารบก (รร.สธ.ทบ.)', 'รร.สธ.ทบ.', 'รร.สธ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CMD_MI_RTA', 'หน่วยข่าวกรองทางทหาร (ขกท.)', 'ขกท.', 'ขกท.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COMPTROLLER_RTA', 'สำนักงานปลัดบัญชีกองทัพบก (สปช.ทบ.)', 'สปช.ทบ.', 'สปช.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_P', 'สำนักงานวิจัยและพัฒนาการทางทหารกองทัพบก (นวป.ทบ.)', 'นวป.ทบ.', 'นวป.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CRMA_RTA', 'โรงเรียนนายร้อยพระจุลจอมเกล้า (รร.จปร.)', 'รร.จปร.', 'รร.จปร.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEPT_CIVIL_RTA', 'กรมกิจการพลเรือนทหารบก (กร.ทบ.)', 'กร.ทบ.', 'กร.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEPT_ENG_RTA', 'กรมการช่างทหารบก (กช.)', 'กช.', 'กช.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEPT_FIN_RTA', 'กรมการเงินทหารบก (กง.ทบ.)', 'กง.ทบ.', 'กง.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEPT_INSPECT_RTA', 'กรมจเรทหารบก (จบ.)', 'จบ.', 'จบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEPT_INTEL_RTA', 'กรมข่าวทหารบก (ขว.ทบ.)', 'ขว.ทบ.', 'ขว.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEPT_LOG_RTA', 'กรมส่งกำลังบำรุงทหารบก (กบ.ทบ.)', 'กบ.ทบ.', 'กบ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEPT_MED_RTA', 'กรมแพทย์ทหารบก (พบ.)', 'พบ.', 'พบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEPT_MUSIC_RTA', 'กรมดุริยางค์ทหารบก (ดย.ทบ.)', 'ดย.ทบ.', 'ดย.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEPT_PROVOST_RTA', 'กรมการสารวัตรทหารบก (สห.ทบ.)', 'สห.ทบ.', 'สห.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEPT_SCI_RTA', 'กรมวิทยาศาสตร์ทหารบก (วศ.ทบ.)', 'วศ.ทบ.', 'วศ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEPT_SIG_RTA', 'กรมการสื่อสารทหารบก (สส.)', 'สส.', 'สส.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEPT_VET_RTA', 'กรมการสัตว์ทหารบก (กส.ทบ.)', 'กส.ทบ.', 'กส.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEPT_WORKS_RTA', 'กรมยุทธโยธาทหารบก (ยย.ทบ.)', 'ยย.ทบ.', 'ยย.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('INSURANCE_CO', 'บริษัท ทิพยประกันภัย จำกัด (มหาชน)', 'ทิพยประกันภัย', 'INS', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('INTERNAL_AUDIT_RTA', 'สำนักงานการตรวจสอบภายในทหารบก (สตน.ทบ.)', 'สตน.ทบ.', 'สตน.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('JAG_RTA', 'สำนักงานพระธรรมนูญทหารบก (สธน.ทบ.)', 'สธน.ทบ.', 'สธน.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('KSP_RTA', 'กรมกำลังพลทหารบก (กพ.ทบ. / กสพ.ฯ)', 'กพ.ทบ.', 'กพ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('NCO_SCH_RTA', 'โรงเรียนนายสิบทหารบก (รร.นส.ทบ.)', 'รร.นส.ทบ.', 'รร.นส.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('OFFICE_COMMANDER_RTA', 'สำนักงานผู้บังคับบัญชากองทัพบก (สง.ผบช.)', 'สง.ผบช.', 'สง.ผบช.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ORD_RTA', 'กรมสรรพาวุธทหารบก (สพ.ทบ.)', 'สพ.ทบ.', 'สพ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PCM_RTA', 'วิทยาลัยแพทยศาสตร์พระมงกุฎเกล้า (วพม.)', 'วพม.', 'วพม.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PMC_CTR_RTA', 'ศูนย์อำนวยการแพทย์พระมงกุฎเกล้า (ศพม.)', 'ศพม.', 'ศพม.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('QM_RTA', 'กรมพลาธิการทหารบก (พธ.ทบ.)', 'พธ.ทบ.', 'พธ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RTA_NURSE_COLL', 'วิทยาลัยพยาบาลกองทัพบก (วพบ.)', 'วพบ.', 'วพบ.', 1, 'DEPT_MED_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_ADJ_RTA', 'โรงเรียนสารบรรณ กรมสารบรรณทหารบก', 'รร.สบ.สบ.ทบ.', 'รร.สบ.สบ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_ART_RTA', 'โรงเรียนทหารปืนใหญ่ ศูนย์การทหารปืนใหญ่', 'รร.ป.ศป.', 'รร.ป.ศป.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_AVIATION_RTA', 'โรงเรียนการบินทหารบก', 'รร.การบิน ทบ.', 'รร.การบิน ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_CAV_RTA', 'โรงเรียนทหารม้า ศูนย์การทหารม้า', 'รร.ม.ศม.', 'รร.ม.ศม.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_CIVIL_RTA', 'โรงเรียนกิจการพลเรือน กรมกิจการพลเรือนทหารบก', 'รร.กร.กร.ทบ.', 'รร.กร.กร.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_ENG_RTA', 'โรงเรียนทหารช่าง กรมการช่างทหารบก', 'รร.ช.กช.', 'รร.ช.กช.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_FIN_RTA', 'โรงเรียนการเงิน กรมการเงินทหารบก', 'รร.กง.กง.ทบ.', 'รร.กง.กง.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_INF_RTA', 'โรงเรียนทหารราบ ศูนย์การทหารราบ', 'รร.ร.ศร.', 'รร.ร.ศร.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_INTEL_RTA', 'โรงเรียนข่าวทหารบก', 'รร.ขว.ทบ.', 'รร.ขว.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_KSR_SSR', 'โรงเรียนการสัตว์และขนส่งทหารบก ศูนย์การกำลังสำรอง', 'รร.กสร.ศสร.', 'รร.กสร.ศสร.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_LOG_RTA', 'โรงเรียนส่งกำลังบำรุงทหารบก', 'รร.กบ.ทบ.', 'รร.กบ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_MED_RTA', 'โรงเรียนเสนารักษ์ กรมแพทย์ทหารบก', 'รร.สร.พบ.', 'รร.สร.พบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_MP_RTA', 'โรงเรียนทหารสารวัตร กรมการสารวัตรทหารบก', 'รร.สห.สห.ทบ.', 'รร.สห.สห.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_MUSIC_RTA', 'โรงเรียนดุริยางค์ทหารบก', 'รร.ดย.ทบ.', 'รร.ดย.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_ORD_RTA', 'โรงเรียนทหารสรรพาวุธ กรมสรรพาวุธทหารบก', 'รร.สพ.สพ.ทบ.', 'รร.สพ.สพ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_QM_RTA', 'โรงเรียนพลาธิการ กรมพลาธิการทหารบก', 'รร.พธ.พธ.ทบ.', 'รร.พธ.พธ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_SCI_RTA', 'โรงเรียนวิทยาศาสตร์ทหารบก', 'รร.วศ.ทบ.', 'รร.วศ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_SIG_RTA', 'โรงเรียนทหารสื่อสาร กรมการสื่อสารทหารบก', 'รร.ส.สส.', 'รร.ส.สส.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_SPEC_WAR_RTA', 'โรงเรียนสงครามพิเศษ ศูนย์สงครามพิเศษ', 'รร.สพศ.ศสพ.', 'รร.สพศ.ศสพ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_TD_RTA', 'โรงเรียนรักษาดินแดน ศูนย์การกำลังสำรอง', 'รร.รด.ศศท.', 'รร.รด.ศศท.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_TRANS_RTA', 'โรงเรียนการขนส่ง กรมการขนส่งทหารบก', 'รร.ขส.ขส.ทบ.', 'รร.ขส.ขส.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SCH_VET_RTA', 'โรงเรียนการสัตว์ กรมการสัตว์ทหารบก', 'รร.กส.กส.ทบ.', 'รร.กส.กส.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SEC_OFFICE_RTA', 'สำนักงานเลขานุการกองทัพบก (สลก.ทบ.)', 'สลก.ทบ.', 'สลก.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SK_RTA', 'กรมสวัสดิการทหารบก (สก.ทบ.)', 'สก.ทบ.', 'สก.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SWC_RTA', 'หน่วยบัญชาการสงครามพิเศษ (นสศ.)', 'นสศ.', 'นสศ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('TD_RTA', 'หน่วยบัญชาการรักษาดินแดน (นรด.)', 'นรด.', 'นรด.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('TRADOC_RTA', 'กรมยุทธศึกษาทหารบก (ยศ.ทบ.)', 'ยศ.ทบ.', 'ยศ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('TRANS_RTA', 'กรมการขนส่งทหารบก (ขส.ทบ.)', 'ขส.ทบ.', 'ขส.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_ARMY_RND', 'สำนักงานวิจัยและพัฒนาการทางทหารกองทัพบก (สวพ.ทบ.)', 'สวพ.ทบ.', 'สวพ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('11th_INF_DIV', 'กองพลทหารราบที่ 11 (พล.ร.11 สไตรเกอร์)', 'พล.ร.11', 'พล.ร.11', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('15th_INF_DIV', 'กองพลทหารราบที่ 15 (พล.ร.15 ค่ายสมเด็จพระสุริโยทัย)', 'พล.ร.15', 'พล.ร.15', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('1st_CAV_DIV', 'กองพลทหารม้าที่ 1 (พล.ม.1)', 'พล.ม.1', 'พล.ม.1', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('1st_DIV', 'กองพลที่ 1 รักษาพระองค์ (พล.1 รอ.)', 'พล.1 รอ.', 'พล.1 รอ.', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('1st_SF_DIV', 'กองพลรบพิเศษที่ 1 (พล.รพศ.1)', 'พล.รพศ.1', 'พล.รพศ.1', 2, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('2nd_CAV_DIV', 'กองพลทหารม้าที่ 2 รักษาพระองค์ (พล.ม.2 รอ.)', 'พล.ม.2 รอ.', 'พล.ม.2 รอ.', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('2nd_INF_DIV', 'กองพลทหารราบที่ 2 รักษาพระองค์ (พล.ร.2 รอ. บูรพาพยัคฆ์)', 'พล.ร.2 รอ.', 'พล.ร.2 รอ.', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('3rd_CAV_DIV', 'กองพลทหารม้าที่ 3 (พล.ม.3)', 'พล.ม.3', 'พล.ม.3', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('3rd_INF_DIV', 'กองพลทหารราบที่ 3 (พล.ร.3 ค่ายสุรนารี)', 'พล.ร.3', 'พล.ร.3', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('4th_INF_DIV', 'กองพลทหารราบที่ 4 (พล.ร.4 ค่ายสมเด็จพระนเรศวรมหาราช)', 'พล.ร.4', 'พล.ร.4', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('5th_INF_DIV', 'กองพลทหารราบที่ 5 (พล.ร.5 ค่ายเทพสตรีศรีสุนทร)', 'พล.ร.5', 'พล.ร.5', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('6th_INF_DIV', 'กองพลทหารราบที่ 6 (พล.ร.6)', 'พล.ร.6', 'พล.ร.6', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('7th_INF_DIV', 'กองพลทหารราบที่ 7 (พล.ร.7)', 'พล.ร.7', 'พล.ร.7', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('9th_INF_DIV', 'กองพลทหารราบที่ 9 (พล.ร.9 ค่ายสุรสีห์)', 'พล.ร.9', 'พล.ร.9', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AAD_DIV', 'กองพลทหารต่อสู้อากาศยาน (พล.ปตอ.)', 'พล.ปตอ.', 'พล.ปตอ.', 2, 'AADC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_MI', 'กองพันข่าวกรองทางทหาร (พัน.ขกท.)', 'พัน.ขกท.', 'พัน.ขกท.', 2, 'CMD_MI_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEV_DIV_1', 'กองพลพัฒนาที่ 1 (พล.พัฒนา 1)', 'พล.พัฒนา 1', 'พล.พัฒนา 1', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEV_DIV_2', 'กองพลพัฒนาที่ 2 (พล.พัฒนา 2)', 'พล.พัฒนา 2', 'พล.พัฒนา 2', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEV_DIV_3', 'กองพลพัฒนาที่ 3 (พล.พัฒนา 3)', 'พล.พัฒนา 3', 'พล.พัฒนา 3', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEV_DIV_4', 'กองพลพัฒนาที่ 4 (พล.พัฒนา 4)', 'พล.พัฒนา 4', 'พล.พัฒนา 4', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DIV_ARTILLERY', 'กองพลทหารปืนใหญ่ (พล.ป.)', 'พล.ป.', 'พล.ป.', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DIV_ENG', 'กองพลทหารช่าง (พล.ช.)', 'พล.ช.', 'พล.ช.', 2, 'DEPT_ENG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_11', 'มณฑลทหารบกที่ 11 (มทบ.11)', 'มทบ.11', 'มทบ.11', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_12', 'มณฑลทหารบกที่ 12 (มทบ.12)', 'มทบ.12', 'มทบ.12', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_13', 'มณฑลทหารบกที่ 13 (มทบ.13)', 'มทบ.13', 'มทบ.13', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_14', 'มณฑลทหารบกที่ 14 (มทบ.14)', 'มทบ.14', 'มทบ.14', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_15', 'มณฑลทหารบกที่ 15 (มทบ.15)', 'มทบ.15', 'มทบ.15', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_16', 'มณฑลทหารบกที่ 16 (มทบ.16)', 'มทบ.16', 'มทบ.16', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_17', 'มณฑลทหารบกที่ 17 (มทบ.17)', 'มทบ.17', 'มทบ.17', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_18', 'มณฑลทหารบกที่ 18 (มทบ.18)', 'มทบ.18', 'มทบ.18', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_19', 'มณฑลทหารบกที่ 19 (มทบ.19)', 'มทบ.19', 'มทบ.19', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_21', 'มณฑลทหารบกที่ 21 (มทบ.21)', 'มทบ.21', 'มทบ.21', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_210', 'มณฑลทหารบกที่ 210 (มทบ.210)', 'มทบ.210', 'มทบ.210', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_22', 'มณฑลทหารบกที่ 22 (มทบ.22)', 'มทบ.22', 'มทบ.22', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_23', 'มณฑลทหารบกที่ 23 (มทบ.23)', 'มทบ.23', 'มทบ.23', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_24', 'มณฑลทหารบกที่ 24 (มทบ.24)', 'มทบ.24', 'มทบ.24', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_25', 'มณฑลทหารบกที่ 25 (มทบ.25)', 'มทบ.25', 'มทบ.25', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_26', 'มณฑลทหารบกที่ 26 (มทบ.26)', 'มทบ.26', 'มทบ.26', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_27', 'มณฑลทหารบกที่ 27 (มทบ.27)', 'มทบ.27', 'มทบ.27', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_28', 'มณฑลทหารบกที่ 28 (มทบ.28)', 'มทบ.28', 'มทบ.28', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_29', 'มณฑลทหารบกที่ 29 (มทบ.29)', 'มทบ.29', 'มทบ.29', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_31', 'มณฑลทหารบกที่ 31 (มทบ.31)', 'มทบ.31', 'มทบ.31', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_310', 'มณฑลทหารบกที่ 310 (มทบ.310)', 'มทบ.310', 'มทบ.310', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_32', 'มณฑลทหารบกที่ 32 (มทบ.32)', 'มทบ.32', 'มทบ.32', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_33', 'มณฑลทหารบกที่ 33 (มทบ.33)', 'มทบ.33', 'มทบ.33', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_34', 'มณฑลทหารบกที่ 34 (มทบ.34)', 'มทบ.34', 'มทบ.34', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_35', 'มณฑลทหารบกที่ 35 (มทบ.35)', 'มทบ.35', 'มทบ.35', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_36', 'มณฑลทหารบกที่ 36 (มทบ.36)', 'มทบ.36', 'มทบ.36', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_37', 'มณฑลทหารบกที่ 37 (มทบ.37)', 'มทบ.37', 'มทบ.37', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_38', 'มณฑลทหารบกที่ 38 (มทบ.38)', 'มทบ.38', 'มทบ.38', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_39', 'มณฑลทหารบกที่ 39 (มทบ.39)', 'มทบ.39', 'มทบ.39', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_41', 'มณฑลทหารบกที่ 41 (มทบ.41)', 'มทบ.41', 'มทบ.41', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_42', 'มณฑลทหารบกที่ 42 (มทบ.42)', 'มทบ.42', 'มทบ.42', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_43', 'มณฑลทหารบกที่ 43 (มทบ.43)', 'มทบ.43', 'มทบ.43', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_44', 'มณฑลทหารบกที่ 44 (มทบ.44)', 'มทบ.44', 'มทบ.44', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_45', 'มณฑลทหารบกที่ 45 (มทบ.45)', 'มทบ.45', 'มทบ.45', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_46', 'มณฑลทหารบกที่ 46 (มทบ.46 ปัตตานี)', 'มทบ.46', 'มทบ.46', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('OFFICE_ISOC_RTA', 'สำนักงานประสานภารกิจด้านความมั่นคงกับกองอำนวยการรักษาความมั่นคงภายในราชอาณาจักร กองทัพบก (สง.ปรมน.ทบ.)', 'สง.ปรมน.ทบ.', 'สง.ปรมน.ทบ.', 2, 'OFFICE_COMMANDER_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_AMNAT_CHAROEN', 'สำนักงานสัสดีจังหวัดอำนาจเจริญ (สง.สด.จว.อ.จ.)', 'สง.สด.จว.อ.จ.', 'สง.สด.จว.อ.จ.', 2, 'MTB_22', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_ANG_THONG', 'สำนักงานสัสดีจังหวัดอ่างทอง (สง.สด.จว.อ.ท.)', 'สง.สด.จว.อ.ท.', 'สง.สด.จว.อ.ท.', 2, 'MTB_13', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_AYUTTHAYA', 'สำนักงานสัสดีจังหวัดพระนครศรีอยุธยา (สง.สด.จว.อ.ย.)', 'สง.สด.จว.อ.ย.', 'สง.สด.จว.อ.ย.', 2, 'MTB_18', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_BKK', 'สำนักงานสัสดีกรุงเทพมหานคร (สง.สด.ก.ท.)', 'สง.สด.ก.ท.', 'สง.สด.ก.ท.', 2, 'MTB_11', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_BUENG_KAN', 'สำนักงานสัสดีจังหวัดบึงกาฬ (สง.สด.จว.บ.ก.)', 'สง.สด.จว.บ.ก.', 'สง.สด.จว.บ.ก.', 2, 'MTB_29', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_BURI_RAM', 'สำนักงานสัสดีจังหวัดบุรีรัมย์ (สง.สด.จว.บ.ร.)', 'สง.สด.จว.บ.ร.', 'สง.สด.จว.บ.ร.', 2, 'MTB_26', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_CHACHOENGSAO', 'สำนักงานสัสดีจังหวัดฉะเชิงเทรา (สง.สด.จว.ฉ.ช.)', 'สง.สด.จว.ฉ.ช.', 'สง.สด.จว.ฉ.ช.', 2, 'MTB_12', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_CHAINAT', 'สำนักงานสัสดีจังหวัดชัยนาท (สง.สด.จว.ช.น.)', 'สง.สด.จว.ช.น.', 'สง.สด.จว.ช.น.', 2, 'MTB_13', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_CHAIYAPHUM', 'สำนักงานสัสดีจังหวัดชัยภูมิ (สง.สด.จว.ช.ย.)', 'สง.สด.จว.ช.ย.', 'สง.สด.จว.ช.ย.', 2, 'MTB_21', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_CHANTHABURI', 'สำนักงานสัสดีจังหวัดจันทบุรี (สง.สด.จว.จ.บ.)', 'สง.สด.จว.จ.บ.', 'สง.สด.จว.จ.บ.', 2, 'MTB_19', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_CHIANG_MAI', 'สำนักงานสัสดีจังหวัดเชียงใหม่ (สง.สด.จว.ช.ม.)', 'สง.สด.จว.ช.ม.', 'สง.สด.จว.ช.ม.', 2, 'MTB_33', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_CHIANG_RAI', 'สำนักงานสัสดีจังหวัดเชียงราย (สง.สด.จว.ช.ร.)', 'สง.สด.จว.ช.ร.', 'สง.สด.จว.ช.ร.', 2, 'MTB_37', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_CHONBURI', 'สำนักงานสัสดีจังหวัดชลบุรี (สง.สด.จว.ช.บ.)', 'สง.สด.จว.ช.บ.', 'สง.สด.จว.ช.บ.', 2, 'MTB_14', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_CHUMPHON', 'สำนักงานสัสดีจังหวัดชุมพร (สง.สด.จว.ช.พ.)', 'สง.สด.จว.ช.พ.', 'สง.สด.จว.ช.พ.', 2, 'MTB_44', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_KALASIN', 'สำนักงานสัสดีจังหวัดกาฬสินธุ์ (สง.สด.จว.ก.ส.)', 'สง.สด.จว.ก.ส.', 'สง.สด.จว.ก.ส.', 2, 'MTB_23', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_KAMPHAENG_PHET', 'สำนักงานสัสดีจังหวัดกำแพงเพชร (สง.สด.จว.ก.พ.)', 'สง.สด.จว.ก.พ.', 'สง.สด.จว.ก.พ.', 2, 'MTB_31', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_KANCHANABURI', 'สำนักงานสัสดีจังหวัดกาญจนบุรี (สง.สด.จว.ก.จ.)', 'สง.สด.จว.ก.จ.', 'สง.สด.จว.ก.จ.', 2, 'MTB_17', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_KHON_KAEN', 'สำนักงานสัสดีจังหวัดขอนแก่น (สง.สด.จว.ข.ก.)', 'สง.สด.จว.ข.ก.', 'สง.สด.จว.ข.ก.', 2, 'MTB_23', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_KRABI', 'สำนักงานสัสดีจังหวัดกระบี่ (สง.สด.จว.ก.บ.)', 'สง.สด.จว.ก.บ.', 'สง.สด.จว.ก.บ.', 2, 'MTB_43', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_LAMPANG', 'สำนักงานสัสดีจังหวัดลำปาง (สง.สด.จว.ล.ป.)', 'สง.สด.จว.ล.ป.', 'สง.สด.จว.ล.ป.', 2, 'MTB_32', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_LAMPHUN', 'สำนักงานสัสดีจังหวัดลำพูน (สง.สด.จว.ล.พ.)', 'สง.สด.จว.ล.พ.', 'สง.สด.จว.ล.พ.', 2, 'MTB_33', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_LOEI', 'สำนักงานสัสดีจังหวัดเลย (สง.สด.จว.ล.ย.)', 'สง.สด.จว.ล.ย.', 'สง.สด.จว.ล.ย.', 2, 'MTB_28', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_LOPBURI', 'สำนักงานสัสดีจังหวัดลพบุรี (สง.สด.จว.ล.บ.)', 'สง.สด.จว.ล.บ.', 'สง.สด.จว.ล.บ.', 2, 'MTB_13', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_MAE_HONG_SON', 'สำนักงานสัสดีจังหวัดแม่ฮ่องสอน (สง.สด.จว.ม.ส.)', 'สง.สด.จว.ม.ส.', 'สง.สด.จว.ม.ส.', 2, 'MTB_33', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_MAHA_SARAKHAM', 'สำนักงานสัสดีจังหวัดมหาสารคาม (สง.สด.จว.ม.ค.)', 'สง.สด.จว.ม.ค.', 'สง.สด.จว.ม.ค.', 2, 'MTB_26', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_MUKDAHAN', 'สำนักงานสัสดีจังหวัดมุกดาหาร (สง.สด.จว.ม.ห.)', 'สง.สด.จว.ม.ห.', 'สง.สด.จว.ม.ห.', 2, 'MTB_210', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_NAKHON_NAYOK', 'สำนักงานสัสดีจังหวัดนครนายก (สง.สด.จว.น.ย.)', 'สง.สด.จว.น.ย.', 'สง.สด.จว.น.ย.', 2, 'MTB_12', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_NAKHON_PATHOM', 'สำนักงานสัสดีจังหวัดนครปฐม (สง.สด.จว.น.ฐ.)', 'สง.สด.จว.น.ฐ.', 'สง.สด.จว.น.ฐ.', 2, 'MTB_11', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_NAKHON_PHANOM', 'สำนักงานสัสดีจังหวัดนครพนม (สง.สด.จว.น.พ.)', 'สง.สด.จว.น.พ.', 'สง.สด.จว.น.พ.', 2, 'MTB_210', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_NAKHON_RATCHASIMA', 'สำนักงานสัสดีจังหวัดนครราชสีมา (สง.สด.จว.น.ม.)', 'สง.สด.จว.น.ม.', 'สง.สด.จว.น.ม.', 2, 'MTB_21', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_NAKHON_SAWAN', 'สำนักงานสัสดีจังหวัดนครสวรรค์ (สง.สด.จว.น.ว.)', 'สง.สด.จว.น.ว.', 'สง.สด.จว.น.ว.', 2, 'MTB_31', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_NAKHON_SI_THAMMARAT', 'สำนักงานสัสดีจังหวัดนครศรีธรรมราช (สง.สด.จว.น.ศ.)', 'สง.สด.จว.น.ศ.', 'สง.สด.จว.น.ศ.', 2, 'MTB_41', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_NAN', 'สำนักงานสัสดีจังหวัดน่าน (สง.สด.จว.น.น.)', 'สง.สด.จว.น.น.', 'สง.สด.จว.น.น.', 2, 'MTB_38', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_NARATHIWAT', 'สำนักงานสัสดีจังหวัดนราธิวาส (สง.สด.จว.น.ธ.)', 'สง.สด.จว.น.ธ.', 'สง.สด.จว.น.ธ.', 2, 'MTB_46', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_NONG_BUA_LAM_PHU', 'สำนักงานสัสดีจังหวัดหนองบัวลำภู (สง.สด.จว.น.ภ.)', 'สง.สด.จว.น.ภ.', 'สง.สด.จว.น.ภ.', 2, 'MTB_28', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_NONG_KHAI', 'สำนักงานสัสดีจังหวัดหนองคาย (สง.สด.จว.น.ค.)', 'สง.สด.จว.น.ค.', 'สง.สด.จว.น.ค.', 2, 'MTB_24', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_NONTHABURI', 'สำนักงานสัสดีจังหวัดนนทบุรี (สง.สด.จว.น.บ.)', 'สง.สด.จว.น.บ.', 'สง.สด.จว.น.บ.', 2, 'MTB_11', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_PATHUM_THANI', 'สำนักงานสัสดีจังหวัดปทุมธานี (สง.สด.จว.ป.ท.)', 'สง.สด.จว.ป.ท.', 'สง.สด.จว.ป.ท.', 2, 'MTB_11', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_PATTANI', 'สำนักงานสัสดีจังหวัดปัตตานี (สง.สด.จว.ป.น.)', 'สง.สด.จว.ป.น.', 'สง.สด.จว.ป.น.', 2, 'MTB_46', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_PHANG_NGA', 'สำนักงานสัสดีจังหวัดพังงา (สง.สด.จว.พ.ง.)', 'สง.สด.จว.พ.ง.', 'สง.สด.จว.พ.ง.', 2, 'MTB_45', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_PHATTHALUNG', 'สำนักงานสัสดีจังหวัดพัทลุง (สง.สด.จว.พ.ท.)', 'สง.สด.จว.พ.ท.', 'สง.สด.จว.พ.ท.', 2, 'MTB_42', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_PHAYAO', 'สำนักงานสัสดีจังหวัดพะเยา (สง.สด.จว.พ.ย.)', 'สง.สด.จว.พ.ย.', 'สง.สด.จว.พ.ย.', 2, 'MTB_34', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_PHETCHABUN', 'สำนักงานสัสดีจังหวัดเพชรบูรณ์ (สง.สด.จว.พ.ช.)', 'สง.สด.จว.พ.ช.', 'สง.สด.จว.พ.ช.', 2, 'MTB_36', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_PHETCHABURI', 'สำนักงานสัสดีจังหวัดเพชรบุรี (สง.สด.จว.พ.บ.)', 'สง.สด.จว.พ.บ.', 'สง.สด.จว.พ.บ.', 2, 'MTB_15', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_PHICHIT', 'สำนักงานสัสดีจังหวัดพิจิตร (สง.สด.จว.พ.จ.)', 'สง.สด.จว.พ.จ.', 'สง.สด.จว.พ.จ.', 2, 'MTB_36', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_PHITSANULOK', 'สำนักงานสัสดีจังหวัดพิษณุโลก (สง.สด.จว.พ.ล.)', 'สง.สด.จว.พ.ล.', 'สง.สด.จว.พ.ล.', 2, 'MTB_39', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_PHRAE', 'สำนักงานสัสดีจังหวัดแพร่ (สง.สด.จว.พ.ร.)', 'สง.สด.จว.พ.ร.', 'สง.สด.จว.พ.ร.', 2, 'MTB_35', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_PHUKET', 'สำนักงานสัสดีจังหวัดภูเก็ต (สง.สด.จว.ภ.ก.)', 'สง.สด.จว.ภ.ก.', 'สง.สด.จว.ภ.ก.', 2, 'MTB_45', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_PRACHINBURI', 'สำนักงานสัสดีจังหวัดปราจีนบุรี (สง.สด.จว.ป.จ.)', 'สง.สด.จว.ป.จ.', 'สง.สด.จว.ป.จ.', 2, 'MTB_12', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_PRACHUAP', 'สำนักงานสัสดีจังหวัดประจวบคีรีขันธ์ (สง.สด.จว.ป.ข.)', 'สง.สด.จว.ป.ข.', 'สง.สด.จว.ป.ข.', 2, 'MTB_15', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_RANONG', 'สำนักงานสัสดีจังหวัดระนอง (สง.สด.จว.ร.น.)', 'สง.สด.จว.ร.น.', 'สง.สด.จว.ร.น.', 2, 'MTB_44', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_RATCHABURI', 'สำนักงานสัสดีจังหวัดราชบุรี (สง.สด.จว.ร.บ.)', 'สง.สด.จว.ร.บ.', 'สง.สด.จว.ร.บ.', 2, 'MTB_16', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_RAYONG', 'สำนักงานสัสดีจังหวัดระยอง (สง.สด.จว.ร.ย.)', 'สง.สด.จว.ร.ย.', 'สง.สด.จว.ร.ย.', 2, 'MTB_14', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_ROI_ET', 'สำนักงานสัสดีจังหวัดร้อยเอ็ด (สง.สด.จว.ร.อ.)', 'สง.สด.จว.ร.อ.', 'สง.สด.จว.ร.อ.', 2, 'MTB_27', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SA_KAEO', 'สำนักงานสัสดีจังหวัดสระแก้ว (สง.สด.จว.ส.ก.)', 'สง.สด.จว.ส.ก.', 'สง.สด.จว.ส.ก.', 2, 'MTB_19', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SAKON_NAKHON', 'สำนักงานสัสดีจังหวัดสกลนคร (สง.สด.จว.ส.น.)', 'สง.สด.จว.ส.น.', 'สง.สด.จว.ส.น.', 2, 'MTB_29', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SAMUT_PRAKAN', 'สำนักงานสัสดีจังหวัดสมุทรปราการ (สง.สด.จว.ส.ป.)', 'สง.สด.จว.ส.ป.', 'สง.สด.จว.ส.ป.', 2, 'MTB_11', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SAMUT_SAKHON', 'สำนักงานสัสดีจังหวัดสมุทรสาคร (สง.สด.จว.ส.ค.)', 'สง.สด.จว.ส.ค.', 'สง.สด.จว.ส.ค.', 2, 'MTB_16', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SAMUT_SONGKHRAM', 'สำนักงานสัสดีจังหวัดสมุทรสงคราม (สง.สด.จว.ส.ส.)', 'สง.สด.จว.ส.ส.', 'สง.สด.จว.ส.ส.', 2, 'MTB_16', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SARABURI', 'สำนักงานสัสดีจังหวัดสระบุรี (สง.สด.จว.ส.บ.)', 'สง.สด.จว.ส.บ.', 'สง.สด.จว.ส.บ.', 2, 'MTB_18', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SATUN', 'สำนักงานสัสดีจังหวัดสตูล (สง.สด.จว.ส.ต.)', 'สง.สด.จว.ส.ต.', 'สง.สด.จว.ส.ต.', 2, 'MTB_42', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SING_BURI', 'สำนักงานสัสดีจังหวัดสิงห์บุรี (สง.สด.จว.ส.ห.)', 'สง.สด.จว.ส.ห.', 'สง.สด.จว.ส.ห.', 2, 'MTB_13', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SI_SA_KET', 'สำนักงานสัสดีจังหวัดศรีสะเกษ (สง.สด.จว.ศ.ก.)', 'สง.สด.จว.ศ.ก.', 'สง.สด.จว.ศ.ก.', 2, 'MTB_27', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SONGKHLA', 'สำนักงานสัสดีจังหวัดสงขลา (สง.สด.จว.ส.ข.)', 'สง.สด.จว.ส.ข.', 'สง.สด.จว.ส.ข.', 2, 'MTB_42', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SUKHOTHAI', 'สำนักงานสัสดีจังหวัดสุโขทัย (สง.สด.จว.ส.ท.)', 'สง.สด.จว.ส.ท.', 'สง.สด.จว.ส.ท.', 2, 'MTB_39', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SUPHAN_BURI', 'สำนักงานสัสดีจังหวัดสุพรรณบุรี (สง.สด.จว.ส.พ.)', 'สง.สด.จว.ส.พ.', 'สง.สด.จว.ส.พ.', 2, 'MTB_17', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SURAT_THANI', 'สำนักงานสัสดีจังหวัดสุราษฎร์ธานี (สง.สด.จว.ส.ฎ.)', 'สง.สด.จว.ส.ฎ.', 'สง.สด.จว.ส.ฎ.', 2, 'MTB_45', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_SURIN', 'สำนักงานสัสดีจังหวัดสุรินทร์ (สง.สด.จว.ส.ร.)', 'สง.สด.จว.ส.ร.', 'สง.สด.จว.ส.ร.', 2, 'MTB_25', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_TAK', 'สำนักงานสัสดีจังหวัดตาก (สง.สด.จว.ต.ก.)', 'สง.สด.จว.ต.ก.', 'สง.สด.จว.ต.ก.', 2, 'MTB_310', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_TRANG', 'สำนักงานสัสดีจังหวัดตรัง (สง.สด.จว.ต.ง.)', 'สง.สด.จว.ต.ง.', 'สง.สด.จว.ต.ง.', 2, 'MTB_43', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_TRAT', 'สำนักงานสัสดีจังหวัดตราด (สง.สด.จว.ต.ร.)', 'สง.สด.จว.ต.ร.', 'สง.สด.จว.ต.ร.', 2, 'MTB_19', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_UBON_RATCHATHANI', 'สำนักงานสัสดีจังหวัดอุบลราชธานี (สง.สด.จว.อ.บ.)', 'สง.สด.จว.อ.บ.', 'สง.สด.จว.อ.บ.', 2, 'MTB_22', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_UDON_THANI', 'สำนักงานสัสดีจังหวัดอุดรธานี (สง.สด.จว.อ.ด.)', 'สง.สด.จว.อ.ด.', 'สง.สด.จว.อ.ด.', 2, 'MTB_24', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_UTHAI_THANI', 'สำนักงานสัสดีจังหวัดอุทัยธานี (สง.สด.จว.อ.น.)', 'สง.สด.จว.อ.น.', 'สง.สด.จว.อ.น.', 2, 'MTB_31', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_UTTARADIT', 'สำนักงานสัสดีจังหวัดอุตรดิตถ์ (สง.สด.จว.อ.ต.)', 'สง.สด.จว.อ.ต.', 'สง.สด.จว.อ.ต.', 2, 'MTB_35', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_YALA', 'สำนักงานสัสดีจังหวัดยะลา (สง.สด.จว.ย.ล.)', 'สง.สด.จว.ย.ล.', 'สง.สด.จว.ย.ล.', 2, 'MTB_46', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SD_YASOTHON', 'สำนักงานสัสดีจังหวัดยโสธร (สง.สด.จว.ย.ส.)', 'สง.สด.จว.ย.ส.', 'สง.สด.จว.ย.ส.', 2, 'MTB_27', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AAD_REG_1', 'กรมทหารต่อสู้อากาศยานที่ 1 (ปตอ.1)', 'ปตอ.1', 'ปตอ.1', 3, 'AAD_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AAD_REG_1_BN_3', 'กองพันทหารปืนใหญ่ต่อสู้อากาศยานที่ 3 กรมทหารปืนใหญ่ต่อสู้อากาศยานที่ 1 (ปตอ.1 พัน.3)', 'ปตอ.1 พัน.3', 'ปตอ.1 พัน.3', 3, 'AAD_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AAD_REG_1_BN_5', 'กองพันทหารปืนใหญ่ต่อสู้อากาศยานที่ 5 กรมทหารปืนใหญ่ต่อสู้อากาศยานที่ 1 (ปตอ.1 พัน.5)', 'ปตอ.1 พัน.5', 'ปตอ.1 พัน.5', 3, 'AAD_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AAD_REG_1_BN_6', 'กองพันทหารปืนใหญ่ต่อสู้อากาศยานที่ 6 กรมทหารปืนใหญ่ต่อสู้อากาศยานที่ 1 (ปตอ.1 พัน.6)', 'ปตอ.1 พัน.6', 'ปตอ.1 พัน.6', 3, 'AAD_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AAD_REG_1_BN_7', 'กองพันทหารปืนใหญ่ต่อสู้อากาศยานที่ 7 กรมทหารปืนใหญ่ต่อสู้อากาศยานที่ 1 (ปตอ.1 พัน.7)', 'ปตอ.1 พัน.7', 'ปตอ.1 พัน.7', 3, 'AAD_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AAD_REG_2', 'กรมทหารต่อสู้อากาศยานที่ 2 (ปตอ.2)', 'ปตอ.2', 'ปตอ.2', 3, 'AAD_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AAD_REG_2_BN_1', 'กองพันทหารปืนใหญ่ต่อสู้อากาศยานที่ 1 กรมทหารปืนใหญ่ต่อสู้อากาศยานที่ 2 (ปตอ.2 พัน.1)', 'ปตอ.2 พัน.1', 'ปตอ.2 พัน.1', 3, 'AAD_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AAD_REG_2_BN_2', 'กองพันทหารปืนใหญ่ต่อสู้อากาศยานที่ 2 กรมทหารปืนใหญ่ต่อสู้อากาศยานที่ 2 (ปตอ.2 พัน.2)', 'ปตอ.2 พัน.2', 'ปตอ.2 พัน.2', 3, 'AAD_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AAD_REG_2_BN_4', 'กองพันทหารปืนใหญ่ต่อสู้อากาศยานที่ 4 กรมทหารปืนใหญ่ต่อสู้อากาศยานที่ 2 (ปตอ.2 พัน.4)', 'ปตอ.2 พัน.4', 'ปตอ.2 พัน.4', 3, 'AAD_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_1', 'กรมทหารปืนใหญ่ที่ 1 รักษาพระองค์ (ป.1 รอ.)', 'ป.1 รอ.', 'ป.1 รอ.', 3, '1st_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_1_BN_1', 'กองพันทหารปืนใหญ่ที่ 1 กรมทหารปืนใหญ่ที่ 1 รักษาพระองค์ (ป.1 พัน.1 รอ.)', 'ป.1 พัน.1 รอ.', 'ป.1 พัน.1 รอ.', 3, 'ART_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_1_BN_11', 'กองพันทหารปืนใหญ่ที่ 11 กรมทหารปืนใหญ่ที่ 1 รักษาพระองค์ (ป.1 พัน.11 รอ.)', 'ป.1 พัน.11 รอ.', 'ป.1 พัน.11 รอ.', 3, 'ART_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_1_BN_31', 'กองพันทหารปืนใหญ่ที่ 31 กรมทหารปืนใหญ่ที่ 1 รักษาพระองค์ (ป.1 พัน.31 รอ.)', 'ป.1 พัน.31 รอ.', 'ป.1 พัน.31 รอ.', 3, 'ART_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_2', 'กรมทหารปืนใหญ่ที่ 2 รักษาพระองค์ (ป.2 รอ.)', 'ป.2 รอ.', 'ป.2 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_21', 'กรมทหารปืนใหญ่ที่ 21 (ป.21)', 'ป.21', 'ป.21', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_21_BN_20', 'กองพันทหารปืนใหญ่ที่ 20 กรมทหารปืนใหญ่ที่ 21 (ป.21 พัน.20)', 'ป.21 พัน.20', 'ป.21 พัน.20', 3, 'ART_REG_21', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_21_BN_30', 'กองพันทหารปืนใหญ่ที่ 30 กรมทหารปืนใหญ่ที่ 21 (ป.21 พัน.30)', 'ป.21 พัน.30', 'ป.21 พัน.30', 3, 'ART_REG_21', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_2_BN_102', 'กองพันทหารปืนใหญ่ที่ 102 กรมทหารปืนใหญ่ที่ 2 รักษาพระองค์ (ป.2 พัน.102 รอ.)', 'ป.2 พัน.102 รอ.', 'ป.2 พัน.102 รอ.', 3, 'ART_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_2_BN_12', 'กองพันทหารปืนใหญ่ที่ 12 กรมทหารปืนใหญ่ที่ 2 รักษาพระองค์ (ป.2 พัน.12 รอ.)', 'ป.2 พัน.12 รอ.', 'ป.2 พัน.12 รอ.', 3, 'ART_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_2_BN_2', 'กองพันทหารปืนใหญ่ที่ 2 กรมทหารปืนใหญ่ที่ 2 รักษาพระองค์ (ป.2 พัน.2 รอ.)', 'ป.2 พัน.2 รอ.', 'ป.2 พัน.2 รอ.', 3, 'ART_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_2_BN_21', 'กองพันทหารปืนใหญ่ที่ 21 กรมทหารปืนใหญ่ที่ 2 รักษาพระองค์ (ป.2 พัน.21 รอ.)', 'ป.2 พัน.21 รอ.', 'ป.2 พัน.21 รอ.', 3, 'ART_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_3', 'กรมทหารปืนใหญ่ที่ 3 (ป.3)', 'ป.3', 'ป.3', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_3_BN_103', 'กองพันทหารปืนใหญ่ที่ 103 กรมทหารปืนใหญ่ที่ 3 (ป.3 พัน.103)', 'ป.3 พัน.103', 'ป.3 พัน.103', 3, 'ART_REG_3', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_3_BN_13', 'กองพันทหารปืนใหญ่ที่ 13 กรมทหารปืนใหญ่ที่ 3 (ป.3 พัน.13)', 'ป.3 พัน.13', 'ป.3 พัน.13', 3, 'ART_REG_3', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_3_BN_3', 'กองพันทหารปืนใหญ่ที่ 3 กรมทหารปืนใหญ่ที่ 3 (ป.3 พัน.3)', 'ป.3 พัน.3', 'ป.3 พัน.3', 3, 'ART_REG_3', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_3_BN_8', 'กองพันทหารปืนใหญ่ที่ 8 กรมทหารปืนใหญ่ที่ 3 (ป.3 พัน.8)', 'ป.3 พัน.8', 'ป.3 พัน.8', 3, 'ART_REG_3', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_4', 'กรมทหารปืนใหญ่ที่ 4 (ป.4)', 'ป.4', 'ป.4', 3, '4th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_4_BN_104', 'กองพันทหารปืนใหญ่ที่ 104 กรมทหารปืนใหญ่ที่ 4 (ป.4 พัน.104)', 'ป.4 พัน.104', 'ป.4 พัน.104', 3, 'ART_REG_4', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_4_BN_17', 'กองพันทหารปืนใหญ่ที่ 17 กรมทหารปืนใหญ่ที่ 4 (ป.4 พัน.17)', 'ป.4 พัน.17', 'ป.4 พัน.17', 3, 'ART_REG_4', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_4_BN_4', 'กองพันทหารปืนใหญ่ที่ 4 กรมทหารปืนใหญ่ที่ 4 (ป.4 พัน.4)', 'ป.4 พัน.4', 'ป.4 พัน.4', 3, 'ART_REG_4', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_4_BN_7', 'กองพันทหารปืนใหญ่ที่ 7 กรมทหารปืนใหญ่ที่ 4 (ป.4 พัน.7)', 'ป.4 พัน.7', 'ป.4 พัน.7', 3, 'ART_REG_4', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_5', 'กรมทหารปืนใหญ่ที่ 5 (ป.5)', 'ป.5', 'ป.5', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_5_BN_105', 'กองพันทหารปืนใหญ่ที่ 105 กรมทหารปืนใหญ่ที่ 5 (ป.5 พัน.105)', 'ป.5 พัน.105', 'ป.5 พัน.105', 3, 'ART_REG_5', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_5_BN_15', 'กองพันทหารปืนใหญ่ที่ 15 กรมทหารปืนใหญ่ที่ 5 (ป.5 พัน.15)', 'ป.5 พัน.15', 'ป.5 พัน.15', 3, 'ART_REG_5', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_5_BN_25', 'กองพันทหารปืนใหญ่ที่ 25 กรมทหารปืนใหญ่ที่ 5 (ป.5 พัน.25)', 'ป.5 พัน.25', 'ป.5 พัน.25', 3, 'ART_REG_5', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_5_BN_5', 'กองพันทหารปืนใหญ่ที่ 5 กรมทหารปืนใหญ่ที่ 5 (ป.5 พัน.5)', 'ป.5 พัน.5', 'ป.5 พัน.5', 3, 'ART_REG_5', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_6', 'กรมทหารปืนใหญ่ที่ 6 (ป.6)', 'ป.6', 'ป.6', 3, '6th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_6_BN_106', 'กองพันทหารปืนใหญ่ที่ 106 กรมทหารปืนใหญ่ที่ 6 (ป.6 พัน.106)', 'ป.6 พัน.106', 'ป.6 พัน.106', 3, 'ART_REG_6', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_6_BN_16', 'กองพันทหารปืนใหญ่ที่ 16 กรมทหารปืนใหญ่ที่ 6 (ป.6 พัน.16)', 'ป.6 พัน.16', 'ป.6 พัน.16', 3, 'ART_REG_6', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_6_BN_23', 'กองพันทหารปืนใหญ่ที่ 23 กรมทหารปืนใหญ่ที่ 6 (ป.6 พัน.23)', 'ป.6 พัน.23', 'ป.6 พัน.23', 3, 'ART_REG_6', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_6_BN_6', 'กองพันทหารปืนใหญ่ที่ 6 กรมทหารปืนใหญ่ที่ 6 (ป.6 พัน.6)', 'ป.6 พัน.6', 'ป.6 พัน.6', 3, 'ART_REG_6', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_71', 'กรมทหารปืนใหญ่ที่ 71 (ป.71)', 'ป.71', 'ป.71', 3, 'DIV_ARTILLERY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_71_BN_711', 'กองพันทหารปืนใหญ่ที่ 711 กรมทหารปืนใหญ่ที่ 71 (ป.71 พัน.711)', 'ป.71 พัน.711', 'ป.71 พัน.711', 3, 'ART_REG_71', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_71_BN_712', 'กองพันทหารปืนใหญ่ที่ 712 กรมทหารปืนใหญ่ที่ 71 (ป.71 พัน.712)', 'ป.71 พัน.712', 'ป.71 พัน.712', 3, 'ART_REG_71', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_71_BN_713', 'กองพันทหารปืนใหญ่ที่ 713 กรมทหารปืนใหญ่ที่ 71 (ป.71 พัน.713)', 'ป.71 พัน.713', 'ป.71 พัน.713', 3, 'ART_REG_71', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_72', 'กรมทหารปืนใหญ่ที่ 72 (ป.72)', 'ป.72', 'ป.72', 3, 'DIV_ARTILLERY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_72_BN_721', 'กองพันทหารปืนใหญ่ที่ 721 กรมทหารปืนใหญ่ที่ 72 (ป.72 พัน.721)', 'ป.72 พัน.721', 'ป.72 พัน.721', 3, 'ART_REG_72', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_72_BN_722', 'กองพันทหารปืนใหญ่ที่ 722 กรมทหารปืนใหญ่ที่ 72 (ป.72 พัน.722)', 'ป.72 พัน.722', 'ป.72 พัน.722', 3, 'ART_REG_72', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_72_BN_723', 'กองพันทหารปืนใหญ่ที่ 723 กรมทหารปืนใหญ่ที่ 72 (ป.72 พัน.723)', 'ป.72 พัน.723', 'ป.72 พัน.723', 3, 'ART_REG_72', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_9', 'กรมทหารปืนใหญ่ที่ 9 (ป.9)', 'ป.9', 'ป.9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_9_BN_109', 'กองพันทหารปืนใหญ่ที่ 109 กรมทหารปืนใหญ่ที่ 9 (ป.9 พัน.109)', 'ป.9 พัน.109', 'ป.9 พัน.109', 3, 'ART_REG_9', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_9_BN_19', 'กองพันทหารปืนใหญ่ที่ 19 กรมทหารปืนใหญ่ที่ 9 (ป.9 พัน.19)', 'ป.9 พัน.19', 'ป.9 พัน.19', 3, 'ART_REG_9', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_9_BN_9', 'กองพันทหารปืนใหญ่ที่ 9 กรมทหารปืนใหญ่ที่ 9 (ป.9 พัน.9)', 'ป.9 พัน.9', 'ป.9 พัน.9', 3, 'ART_REG_9', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN', 'กองพันจู่โจม (พัน.จจ.)', 'พัน.จจ.', 'พัน.จจ.', 3, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_1', 'กองพันบินที่ 1 (พัน.บ.1)', 'พัน.บ.1', 'พัน.บ.1', 3, 'AVN_CTR_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_1_258', 'กองพันพัฒนาที่ 1 (พัน.พัฒนา 1)', 'พัน.พัฒนา 1', 'พัน.พัฒนา 1', 3, 'DEV_DIV_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_2', 'กองพันบินที่ 2 (พัน.บ.2)', 'พัน.บ.2', 'พัน.บ.2', 3, 'AVN_CTR_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_21', 'กองพันบินที่ 21 (พัน.บ.21)', 'พัน.บ.21', 'พัน.บ.21', 3, 'AVN_CTR_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_2_259', 'กองพันพัฒนาที่ 2 (พัน.พัฒนา 2)', 'พัน.พัฒนา 2', 'พัน.พัฒนา 2', 3, 'DEV_DIV_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_255', 'กองพันปฏิบัติการจิตวิทยา (พัน.ปจว.)', 'พัน.ปจว.', 'พัน.ปจว.', 3, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_256', 'กองพันปฏิบัติการทางอากาศ (พัน.ปฐบ.)', 'พัน.ปฐบ.', 'พัน.ปฐบ.', 3, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_257', 'กองพันปฏิบัติการพิเศษ (พัน.ปพ.)', 'พัน.ปพ.', 'พัน.ปพ.', 3, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_272', 'กองพันสารสนเทศและเทคโนโลยี (พัน.สท.)', 'พัน.สท.', 'พัน.สท.', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_3', 'กองพันบินที่ 3 (พัน.บ.3)', 'พัน.บ.3', 'พัน.บ.3', 3, 'AVN_CTR_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_3_260', 'กองพันพัฒนาที่ 3 (พัน.พัฒนา 3)', 'พัน.พัฒนา 3', 'พัน.พัฒนา 3', 3, 'DEV_DIV_3', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_4', 'กองพันพัฒนาที่ 4 (พัน.พัฒนา 4)', 'พัน.พัฒนา 4', 'พัน.พัฒนา 4', 3, 'DEV_DIV_4', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_41', 'กองพันบินที่ 41 (พัน.บ.41)', 'พัน.บ.41', 'พัน.บ.41', 3, 'AVN_CTR_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_9', 'กองพันบินที่ 9 (พัน.บ.9)', 'พัน.บ.9', 'พัน.บ.9', 3, 'AVN_CTR_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNENG_ENGCOY1', 'กองร้อยที่ 1 กองพันทหารช่าง กรมการทหารช่าง (พัน.ช.กช.ร้อย.1)', 'พัน.ช.กช.ร้อย.1', 'พัน.ช.กช.ร้อย.1', 3, 'DEPT_ENG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNENG_ENG_DIV', 'กองพันทหารช่างเครื่องมือพิเศษ กองพลทหารช่าง (พัน.ช.คมศ.พล.ช.)', 'พัน.ช.คมศ.พล.ช.', 'พัน.ช.คมศ.พล.ช.', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNMP11', 'กองพันทหารสารวัตรที่ 11 (พัน.สห.11)', 'พัน.สห.11', 'พัน.สห.11', 3, 'DEPT_PROVOST_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNMP12', 'กองพันทหารสารวัตรที่ 12 (พัน.สห.12)', 'พัน.สห.12', 'พัน.สห.12', 3, 'DEPT_PROVOST_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNMP21', 'กองพันทหารสารวัตรที่ 21 (พัน.สห.21)', 'พัน.สห.21', 'พัน.สห.21', 3, 'DEPT_PROVOST_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNMP31', 'กองพันทหารสารวัตรที่ 31 (พัน.สห.31)', 'พัน.สห.31', 'พัน.สห.31', 3, 'DEPT_PROVOST_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNMP41', 'กองพันทหารสารวัตรที่ 41 (พัน.สห.41)', 'พัน.สห.41', 'พัน.สห.41', 3, 'DEPT_PROVOST_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNORD_21_LOG1', 'กองพันสรรพาวุธกระสุน/ซ่อมบำรุง กระสุน 21 บชร.1 (พัน.สพ.กระสุน 21 บชร.1)', 'พัน.สพ.กระสุน 21 บชร.1', 'พัน.สพ.กระสุน 21 บชร.1', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNORD_22_LOG2', 'กองพันสรรพาวุธกระสุน/ซ่อมบำรุง กระสุน 22 บชร.2 (พัน.สพ.กระสุน 22 บชร.2)', 'พัน.สพ.กระสุน 22 บชร.2', 'พัน.สพ.กระสุน 22 บชร.2', 3, '2nd_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNORD_23_LOG3', 'กองพันสรรพาวุธกระสุน/ซ่อมบำรุง กระสุน 23 บชร.3 (พัน.สพ.กระสุน 23 บชร.3)', 'พัน.สพ.กระสุน 23 บชร.3', 'พัน.สพ.กระสุน 23 บชร.3', 3, '3rd_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNORD_24_LOG4', 'กองพันสรรพาวุธกระสุน/ซ่อมบำรุง กระสุน 24 บชร.4 (พัน.สพ.กระสุน 24 บชร.4)', 'พัน.สพ.กระสุน 24 บชร.4', 'พัน.สพ.กระสุน 24 บชร.4', 3, '4th_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNORD_R', 'กองพันสรรพาวุธกระสุน/ซ่อมบำรุง ซบร.เขตหลัง (พัน.สพ.ซบร.เขตหลัง)', 'พัน.สพ.ซบร.เขตหลัง', 'พัน.สพ.ซบร.เขตหลัง', 3, 'ORD_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNP_P', 'กองพันทหารปืนใหญ่ ศูนย์การทหารปืนใหญ่ (พัน.ป.ศป.)', 'พัน.ป.ศป.', 'พัน.ป.ศป.', 3, 'SCH_ART_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R', 'กองพันซ่อมบำรุง บ.ทบ. (พัน.ซบร.บ.ทบ.)', 'พัน.ซบร.บ.ทบ.', 'พัน.ซบร.บ.ทบ.', 3, 'AVN_CTR_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNR', 'กองพันทหารราบ หน่วยบัญชาการรักษาดินแดน (พัน.ร.นรด.)', 'พัน.ร.นรด.', 'พัน.ร.นรด.', 3, 'TD_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R1', 'กองพันเสนารักษ์ 1 (พัน.สร.1)', 'พัน.สร.1', 'พัน.สร.1', 3, 'DEPT_MED_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R13', 'กองพันเสนารักษ์ 13 (พัน.สร.13)', 'พัน.สร.13', 'พัน.สร.13', 3, 'DEPT_MED_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R2', 'กองพันเสนารักษ์ 2 (พัน.สร.2)', 'พัน.สร.2', 'พัน.สร.2', 3, 'DEPT_MED_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R21_LOG1', 'กองพันซ่อมบำรุง 21 บชร.1 (พัน.ซบร.21 บชร.1)', 'พัน.ซบร.21 บชร.1', 'พัน.ซบร.21 บชร.1', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R21_LOG1_273', 'กองพันส่งกำลังและบริการ 21 บชร.1 (พัน.สบร.21 บชร.1)', 'พัน.สบร.21 บชร.1', 'พัน.สบร.21 บชร.1', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R22_LOG2', 'กองพันซ่อมบำรุง 22 บชร.2 (พัน.ซบร.22 บชร.2)', 'พัน.ซบร.22 บชร.2', 'พัน.ซบร.22 บชร.2', 3, '2nd_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R22_LOG2_274', 'กองพันส่งกำลังและบริการ 22 บชร.2 (พัน.สบร.22 บชร.2)', 'พัน.สบร.22 บชร.2', 'พัน.สบร.22 บชร.2', 3, '2nd_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R22_LOG2_286', 'กองพันเสนารักษ์ 22 บชร.2 (พัน.สร.22 บชร.2)', 'พัน.สร.22 บชร.2', 'พัน.สร.22 บชร.2', 3, '2nd_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R23_LOG3', 'กองพันซ่อมบำรุง 23 บชร.3 (พัน.ซบร.23 บชร.3)', 'พัน.ซบร.23 บชร.3', 'พัน.ซบร.23 บชร.3', 3, '3rd_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R23_LOG3_275', 'กองพันส่งกำลังและบริการ 23 บชร.3 (พัน.สบร.23 บชร.3)', 'พัน.สบร.23 บชร.3', 'พัน.สบร.23 บชร.3', 3, '3rd_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R23_LOG3_287', 'กองพันเสนารักษ์ 23 บชร.3 (พัน.สร.23 บชร.3)', 'พัน.สร.23 บชร.3', 'พัน.สร.23 บชร.3', 3, '3rd_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R24_LOG4', 'กองพันซ่อมบำรุง 24 บชร.4 (พัน.ซบร.24 บชร.4)', 'พัน.ซบร.24 บชร.4', 'พัน.ซบร.24 บชร.4', 3, '4th_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R24_LOG4_276', 'กองพันส่งกำลังและบริการ 24 บชร.4 (พัน.สบร.24 บชร.4)', 'พัน.สบร.24 บชร.4', 'พัน.สบร.24 บชร.4', 3, '4th_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R3', 'กองพันเสนารักษ์ 3 (พัน.สร.3)', 'พัน.สร.3', 'พัน.สร.3', 3, 'DEPT_MED_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R4', 'กองพันเสนารักษ์ 4 (พัน.สร.4)', 'พัน.สร.4', 'พัน.สร.4', 3, 'DEPT_MED_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R5', 'กองพันเสนารักษ์ 5 (พัน.สร.5)', 'พัน.สร.5', 'พัน.สร.5', 3, 'DEPT_MED_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R6', 'กองพันเสนารักษ์ 6 (พัน.สร.6)', 'พัน.สร.6', 'พัน.สร.6', 3, 'DEPT_MED_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_R8', 'กองพันเสนารักษ์ 8 (พัน.สร.8)', 'พัน.สร.8', 'พัน.สร.8', 3, 'DEPT_MED_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_RSPT_REG12', 'กองพันซ่อมบำรุง กรม สน.12 (พัน.ซบร.กรม สน.12)', 'พัน.ซบร.กรม สน.12', 'พัน.ซบร.กรม สน.12', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_RSPT_REG2', 'กองพันซ่อมบำรุง กรม สน.2 (พัน.ซบร.กรม สน.2)', 'พัน.ซบร.กรม สน.2', 'พัน.ซบร.กรม สน.2', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_RSPT_REGINF_DIV11', 'กองพันซ่อมบำรุง กรม สน.พล.ร.11 (พัน.ซบร.กรม สน.พล.ร.11)', 'พัน.ซบร.กรม สน.พล.ร.11', 'พัน.ซบร.กรม สน.พล.ร.11', 3, '11th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_RSPT_REGINF_DIV15', 'กองพันซ่อมบำรุง กรม สน.พล.ร.15 (พัน.ซบร.กรม สน.พล.ร.15)', 'พัน.ซบร.กรม สน.พล.ร.15', 'พัน.ซบร.กรม สน.พล.ร.15', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_RSPT_REGINF_DIV15_277', 'กองพันส่งกำลังและบริการ กรม สน.พล.ร.15 (พัน.สบร.กรม สน.พล.ร.15)', 'พัน.สบร.กรม สน.พล.ร.15', 'พัน.สบร.กรม สน.พล.ร.15', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_RSPT_REGINF_DIV15_293', 'กองพันเสนารักษ์ กรม สน.พล.ร.15 (พัน.สร.กรม สน.พล.ร.15)', 'พัน.สร.กรม สน.พล.ร.15', 'พัน.สร.กรม สน.พล.ร.15', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_RSPT_REGINF_DIV9', 'กองพันซ่อมบำรุง กรม สน.พล.ร.9 (พัน.ซบร.กรม สน.พล.ร.9)', 'พัน.ซบร.กรม สน.พล.ร.9', 'พัน.ซบร.กรม สน.พล.ร.9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_RSPT_REGINF_DIV9_294', 'กองพันเสนารักษ์ กรม สน.พล.ร.9 (พัน.สร.กรม สน.พล.ร.9)', 'พัน.สร.กรม สน.พล.ร.9', 'พัน.สร.กรม สน.พล.ร.9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNSF_ORD', 'กองพันรบพิเศษ ศูนย์สงครามพิเศษ (พัน.รพศ.ศสพ.)', 'พัน.รพศ.ศสพ.', 'พัน.รพศ.ศสพ.', 3, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_SIG', 'กองพันสัตว์ต่าง กรมการสัตว์ทหารบก (พัน.สต.กส.ทบ.)', 'พัน.สต.กส.ทบ.', 'พัน.สต.กส.ทบ.', 3, 'DEPT_VET_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_SIG1_SIG', 'กองพันทหารขนส่ง 1 กรม ขส. (พัน.ขส.1 กรม ขส.)', 'พัน.ขส.1 กรม ขส.', 'พัน.ขส.1 กรม ขส.', 3, 'TRANS_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_SIG22_LOG2', 'กองพันทหารขนส่ง 22 บชร.2 (พัน.ขส.22 บชร.2)', 'พัน.ขส.22 บชร.2', 'พัน.ขส.22 บชร.2', 3, '2nd_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_SIG23_LOG3', 'กองพันทหารขนส่ง 23 บชร.3 (พัน.ขส.23 บชร.3)', 'พัน.ขส.23 บชร.3', 'พัน.ขส.23 บชร.3', 3, '3rd_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_SIG24_LOG4', 'กองพันทหารขนส่ง 24 บชร.4 (พัน.ขส.24 บชร.4)', 'พัน.ขส.24 บชร.4', 'พัน.ขส.24 บชร.4', 3, '4th_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_SIG2_SIG', 'กองพันทหารขนส่ง 2 (ผสม) กรม ขส. (พัน.ขส.2 (ผสม) กรม ขส.)', 'พัน.ขส.2 (ผสม) กรม ขส.', 'พัน.ขส.2 (ผสม) กรม ขส.', 3, 'TRANS_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BNSIG_R', 'กองพันทหารสื่อสารซ่อมบำรุงเขตหลัง (พัน.ส.ซบร.เขตหลัง)', 'พัน.ส.ซบร.เขตหลัง', 'พัน.ส.ซบร.เขตหลัง', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_BN_SIGSPT_REGINF_DIV9', 'กองพันทหารขนส่ง กรม สน.พล.ร.9 (พัน.ขส.กรม สน.พล.ร.9)', 'พัน.ขส.กรม สน.พล.ร.9', 'พัน.ขส.กรม สน.พล.ร.9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_INF_MTB_11', 'กองพันทหารราบ มณฑลทหารบกที่ 11 (พัน.ร.มทบ.11)', 'พัน.ร.มทบ.11', 'พัน.ร.มทบ.11', 3, 'MTB_11', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_INF_MTB_21', 'กองพันทหารราบ มณฑลทหารบกที่ 21 (พัน.ร.มทบ.21)', 'พัน.ร.มทบ.21', 'พัน.ร.มทบ.21', 3, 'MTB_21', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_MTB_15', 'กองพันมณฑลทหารบกที่ 15 (พัน.มทบ.15)', 'พัน.มทบ.15', 'พัน.มทบ.15', 3, 'MTB_15', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_MTB_23', 'กองพันมณฑลทหารบกที่ 23 (พัน.มทบ.23)', 'พัน.มทบ.23', 'พัน.มทบ.23', 3, 'MTB_23', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_MTB_33', 'กองพันมณฑลทหารบกที่ 33 (พัน.มทบ.33)', 'พัน.มทบ.33', 'พัน.มทบ.33', 3, 'MTB_33', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('BN_MTB_42', 'กองพันมณฑลทหารบกที่ 42 (พัน.มทบ.42)', 'พัน.มทบ.42', 'พัน.มทบ.42', 3, 'MTB_42', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_12__CAV_DIV1', 'กองพันทหารม้าที่ 12 พล.ม.1 (ม.พัน.12 พล.ม.1)', 'ม.พัน.12 พล.ม.1', 'ม.พัน.12 พล.ม.1', 3, '1st_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_16__INF_DIV5', 'กองพันทหารม้าที่ 16 พล.ร.5 (ม.พัน.16 พล.ร.5)', 'ม.พัน.16 พล.ร.5', 'ม.พัน.16 พล.ร.5', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_19__INF_DIV9', 'กองพันทหารม้าที่ 19 พล.ร.9 (ม.พัน.19 พล.ร.9)', 'ม.พัน.19 พล.ร.9', 'ม.พัน.19 พล.ร.9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_2', 'กองพันทหารม้าที่ 2 (ม.พัน.2)', 'ม.พัน.2', 'ม.พัน.2', 3, '2nd_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_21__INF_DIV6', 'กองพันทหารม้าที่ 21 พล.ร.6 (ม.พัน.21 พล.ร.6)', 'ม.พัน.21 พล.ร.6', 'ม.พัน.21 พล.ร.6', 3, '6th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_22__M', 'กองพันทหารม้าที่ 22 ศม. (ม.พัน.22 ศม.)', 'ม.พัน.22 ศม.', 'ม.พัน.22 ศม.', 3, 'SCH_CAV_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_27', 'กองพันทหารม้าที่ 27 (ม.พัน.27)', 'ม.พัน.27', 'ม.พัน.27', 3, '2nd_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_28__CAV_DIV1', 'กองพันทหารม้าที่ 28 พล.ม.1 (ม.พัน.28 พล.ม.1)', 'ม.พัน.28 พล.ม.1', 'ม.พัน.28 พล.ม.1', 3, '1st_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_29_RO', 'กองพันทหารม้าที่ 29 รักษาพระองค์ (ม.พัน.29 รอ.)', 'ม.พัน.29 รอ.', 'ม.พัน.29 รอ.', 3, '2nd_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_30', 'กองพันทหารม้าที่ 30 (ม.พัน.30)', 'ม.พัน.30', 'ม.พัน.30', 3, '2nd_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_31__INF_DIV15', 'กองพันทหารม้าที่ 31 พล.ร.15 (ม.พัน.31 พล.ร.15)', 'ม.พัน.31 พล.ร.15', 'ม.พัน.31 พล.ร.15', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_4', 'กองพันทหารม้าที่ 4 (ม.พัน.4)', 'ม.พัน.4', 'ม.พัน.4', 3, '2nd_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_8__INF_DIV3', 'กองพันทหารม้าที่ 8 พล.ร.3 (ม.พัน.8 พล.ร.3)', 'ม.พัน.8 พล.ร.3', 'ม.พัน.8 พล.ร.3', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_BN_9__INF_DIV4', 'กองพันทหารม้าที่ 9 พล.ร.4 (ม.พัน.9 พล.ร.4)', 'ม.พัน.9 พล.ร.4', 'ม.พัน.9 พล.ร.4', 3, '4th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_1', 'กรมทหารม้าที่ 1 รักษาพระองค์ (ม.1 รอ.)', 'ม.1 รอ.', 'ม.1 รอ.', 3, '2nd_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_1_BN_1', 'กองพันทหารม้าที่ 1 กรมทหารม้าที่ 1 รักษาพระองค์ (ม.1 พัน.1 รอ.)', 'ม.1 พัน.1 รอ.', 'ม.1 พัน.1 รอ.', 3, 'CAV_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_1_BN_17', 'กองพันทหารม้าที่ 17 กรมทหารม้าที่ 1 รักษาพระองค์ (ม.1 พัน.17 รอ.)', 'ม.1 พัน.17 รอ.', 'ม.1 พัน.17 รอ.', 3, 'CAV_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_1_BN_3', 'กองพันทหารม้าที่ 3 กรมทหารม้าที่ 1 รักษาพระองค์ (ม.1 พัน.3 รอ.)', 'ม.1 พัน.3 รอ.', 'ม.1 พัน.3 รอ.', 3, 'CAV_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_2', 'กรมทหารม้าที่ 2 (ม.2)', 'ม.2', 'ม.2', 3, '1st_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_2_BN_10', 'กองพันทหารม้าที่ 10 กรมทหารม้าที่ 2 (ม.2 พัน.10)', 'ม.2 พัน.10', 'ม.2 พัน.10', 3, 'CAV_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_2_BN_15', 'กองพันทหารม้าที่ 15 กรมทหารม้าที่ 2 (ม.2 พัน.15)', 'ม.2 พัน.15', 'ม.2 พัน.15', 3, 'CAV_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_2_BN_7', 'กองพันทหารม้าที่ 7 กรมทหารม้าที่ 2 (ม.2 พัน.7)', 'ม.2 พัน.7', 'ม.2 พัน.7', 3, 'CAV_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_3', 'กรมทหารม้าที่ 3 (ม.3)', 'ม.3', 'ม.3', 3, '1st_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_3_BN_13', 'กองพันทหารม้าที่ 13 กรมทหารม้าที่ 3 (ม.3 พัน.13)', 'ม.3 พัน.13', 'ม.3 พัน.13', 3, 'CAV_REG_3', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_3_BN_18', 'กองพันทหารม้าที่ 18 กรมทหารม้าที่ 3 (ม.3 พัน.18)', 'ม.3 พัน.18', 'ม.3 พัน.18', 3, 'CAV_REG_3', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_3_BN_26', 'กองพันทหารม้าที่ 26 กรมทหารม้าที่ 3 (ม.3 พัน.26)', 'ม.3 พัน.26', 'ม.3 พัน.26', 3, 'CAV_REG_3', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_4', 'กรมทหารม้าที่ 4 รักษาพระองค์ (ม.4 รอ.)', 'ม.4 รอ.', 'ม.4 รอ.', 3, '2nd_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_4_BN_11', 'กองพันทหารม้าที่ 11 กรมทหารม้าที่ 4 รักษาพระองค์ (ม.4 พัน.11 รอ.)', 'ม.4 พัน.11 รอ.', 'ม.4 พัน.11 รอ.', 3, 'CAV_REG_4', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_4_BN_25', 'กองพันทหารม้าที่ 25 กรมทหารม้าที่ 4 รักษาพระองค์ (ม.4 พัน.25 รอ.)', 'ม.4 พัน.25 รอ.', 'ม.4 พัน.25 รอ.', 3, 'CAV_REG_4', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_4_BN_5', 'กองพันทหารม้าที่ 5 กรมทหารม้าที่ 4 รักษาพระองค์ (ม.4 พัน.5 รอ.)', 'ม.4 พัน.5 รอ.', 'ม.4 พัน.5 รอ.', 3, 'CAV_REG_4', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_5', 'กรมทหารม้าที่ 5 รักษาพระองค์ (ม.5 รอ.)', 'ม.5 รอ.', 'ม.5 รอ.', 3, '2nd_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_5_BN_20', 'กองพันทหารม้าที่ 20 กรมทหารม้าที่ 5 รักษาพระองค์ (ม.5 พัน.20 รอ.)', 'ม.5 พัน.20 รอ.', 'ม.5 พัน.20 รอ.', 3, 'CAV_REG_5', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_5_BN_23', 'กองพันทหารม้าที่ 23 กรมทหารม้าที่ 5 รักษาพระองค์ (ม.5 พัน.23 รอ.)', 'ม.5 พัน.23 รอ.', 'ม.5 พัน.23 รอ.', 3, 'CAV_REG_5', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_5_BN_24', 'กองพันทหารม้าที่ 24 กรมทหารม้าที่ 5 รักษาพระองค์ (ม.5 พัน.24 รอ.)', 'ม.5 พัน.24 รอ.', 'ม.5 พัน.24 รอ.', 3, 'CAV_REG_5', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_6', 'กรมทหารม้าที่ 6 (ม.6)', 'ม.6', 'ม.6', 3, '3rd_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_6_BN_6', 'กองพันทหารม้าที่ 6 กรมทหารม้าที่ 6 (ม.6 พัน.6)', 'ม.6 พัน.6', 'ม.6 พัน.6', 3, 'CAV_REG_6', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_7', 'กรมทหารม้าที่ 7 (ม.7)', 'ม.7', 'ม.7', 3, '3rd_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CAV_REG_7_BN_14', 'กองพันทหารม้าที่ 14 กรมทหารม้าที่ 7 (ม.7 พัน.14)', 'ม.7 พัน.14', 'ม.7 พัน.14', 3, 'CAV_REG_7', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COY_1', 'กองร้อยวิทยาศาสตร์ที่ 1 กรมวิทยาศาสตร์ทหารบก (ร้อย.วศ.1)', 'ร้อย.วศ.1', 'ร้อย.วศ.1', 3, 'DEPT_SCI_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COY_AAD_DIV', 'กองร้อยกองบัญชาการ กองพลทหารต่อสู้อากาศยาน (ร้อย.บก.พล.ปตอ.)', 'ร้อย.บก.พล.ปตอ.', 'ร้อย.บก.พล.ปตอ.', 3, 'AAD_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYAMBULANCE_COY', 'กองร้อยรถยนต์พยาบาล กรมแพทย์ทหารบก (ร้อย.รถยนต์พยาบาล)', 'ร้อย.รถยนต์พยาบาล', 'ร้อย.รถยนต์พยาบาล', 3, 'DEPT_MED_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYAT2', 'กองร้อยต่อสู้รถถังที่ 2 (ร้อย.ตถ.2)', 'ร้อย.ตถ.2', 'ร้อย.ตถ.2', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYAT6', 'กองร้อยต่อสู้รถถังที่ 6 (ร้อย.ตถ.6)', 'ร้อย.ตถ.6', 'ร้อย.ตถ.6', 3, '6th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYENGCOMBAT_ENGENG1', 'กองร้อยทหารช่างเครื่องมือเบา กรมทหารช่างที่ 1 (ร้อย.ช.คมบ.ช.1)', 'ร้อย.ช.คมบ.ช.1', 'ร้อย.ช.คมบ.ช.1', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYENG_R', 'กองร้อยทหารช่างซ่อมบำรุงสนาม (ร้อย.ช.ซบร.สนาม)', 'ร้อย.ช.ซบร.สนาม', 'ร้อย.ช.ซบร.สนาม', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYENG_R_605', 'กองร้อยทหารช่างซ่อมบำรุงหนัก (ร้อย.ช.ซบร.หนัก)', 'ร้อย.ช.ซบร.หนัก', 'ร้อย.ช.ซบร.หนัก', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYLRRP_1', 'กองร้อยลาดตระเวนระยะไกล  1 (ร้อย.ลว.ไกล 1)', 'ร้อย.ลว.ไกล 1', 'ร้อย.ลว.ไกล 1', 3, '1st_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYLRRP_2', 'กองร้อยลาดตระเวนระยะไกล  2 (ร้อย.ลว.ไกล 2)', 'ร้อย.ลว.ไกล 2', 'ร้อย.ลว.ไกล 2', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYLRRP_3', 'กองร้อยลาดตระเวนระยะไกล  3 (ร้อย.ลว.ไกล 3)', 'ร้อย.ลว.ไกล 3', 'ร้อย.ลว.ไกล 3', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYLRRP_4', 'กองร้อยลาดตระเวนระยะไกล  4 (ร้อย.ลว.ไกล 4)', 'ร้อย.ลว.ไกล 4', 'ร้อย.ลว.ไกล 4', 3, '4th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYLRRP_5', 'กองร้อยลาดตระเวนระยะไกล  5 (ร้อย.ลว.ไกล 5)', 'ร้อย.ลว.ไกล 5', 'ร้อย.ลว.ไกล 5', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYLRRP_6', 'กองร้อยลาดตระเวนระยะไกล  6 (ร้อย.ลว.ไกล 6)', 'ร้อย.ลว.ไกล 6', 'ร้อย.ลว.ไกล 6', 3, '6th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYLRRP_9', 'กองร้อยลาดตระเวนระยะไกล  9 (ร้อย.ลว.ไกล 9)', 'ร้อย.ลว.ไกล 9', 'ร้อย.ลว.ไกล 9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYLRRP_CAV_DIV1', 'กองร้อยลาดตระเวนระยะไกล  พล.ม.1 (ร้อย.ลว.ไกล พล.ม.1)', 'ร้อย.ลว.ไกล พล.ม.1', 'ร้อย.ลว.ไกล พล.ม.1', 3, '1st_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYLRRP_INF_DIV15', 'กองร้อยลาดตระเวนระยะไกล  พล.ร.15 (ร้อย.ลว.ไกล พล.ร.15)', 'ร้อย.ลว.ไกล พล.ร.15', 'ร้อย.ลว.ไกล พล.ร.15', 3, '1st_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYM_1', 'กองร้อยทหารม้าลาดตระเวน  1 (ร้อย.ม.(ลว.) 1)', 'ร้อย.ม.(ลว.) 1', 'ร้อย.ม.(ลว.) 1', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COY_M1_DEV_DIV_1', 'กองร้อยเครื่องมือทหารช่าง 1 กอง สน.พล.พัฒนา 1 (ร้อย.คม.1 กอง สน.พล.พัฒนา 1)', 'ร้อย.คม.1 กอง สน.พล.พัฒนา 1', 'ร้อย.คม.1 กอง สน.พล.พัฒนา 1', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COY_M1_DEV_DIV_2', 'กองร้อยเครื่องมือทหารช่าง 1 กอง สน.พล.พัฒนา 2 (ร้อย.คม.1 กอง สน.พล.พัฒนา 2)', 'ร้อย.คม.1 กอง สน.พล.พัฒนา 2', 'ร้อย.คม.1 กอง สน.พล.พัฒนา 2', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COY_M1_DEV_DIV_3', 'กองร้อยเครื่องมือทหารช่าง 1 กอง สน.พล.พัฒนา 3 (ร้อย.คม.1 กอง สน.พล.พัฒนา 3)', 'ร้อย.คม.1 กอง สน.พล.พัฒนา 3', 'ร้อย.คม.1 กอง สน.พล.พัฒนา 3', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COY_M1_DEV_DIV_4', 'กองร้อยเครื่องมือทหารช่าง 1 กอง สน.พล.พัฒนา 4 (ร้อย.คม.1 กอง สน.พล.พัฒนา 4)', 'ร้อย.คม.1 กอง สน.พล.พัฒนา 4', 'ร้อย.คม.1 กอง สน.พล.พัฒนา 4', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYM_3', 'กองร้อยทหารม้าลาดตระเวน  3 (ร้อย.ม.(ลว.) 3)', 'ร้อย.ม.(ลว.) 3', 'ร้อย.ม.(ลว.) 3', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYM_4', 'กองร้อยทหารม้าลาดตระเวน  4 (ร้อย.ม.(ลว.) 4)', 'ร้อย.ม.(ลว.) 4', 'ร้อย.ม.(ลว.) 4', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYM_5', 'กองร้อยทหารม้าลาดตระเวน  5 (ร้อย.ม.(ลว.) 5)', 'ร้อย.ม.(ลว.) 5', 'ร้อย.ม.(ลว.) 5', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYM_6', 'กองร้อยทหารม้าลาดตระเวน  6 (ร้อย.ม.(ลว.) 6)', 'ร้อย.ม.(ลว.) 6', 'ร้อย.ม.(ลว.) 6', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYMP_1_BNMP12', 'กองร้อยทหารสารวัตรสนาม  1 พัน.สห.12 (ร้อย.สห.สนาม 1 พัน.สห.12)', 'ร้อย.สห.สนาม 1 พัน.สห.12', 'ร้อย.สห.สนาม 1 พัน.สห.12', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYMP_1_BNMP21', 'กองร้อยทหารสารวัตรสนาม  1 พัน.สห.21 (ร้อย.สห.สนาม 1 พัน.สห.21)', 'ร้อย.สห.สนาม 1 พัน.สห.21', 'ร้อย.สห.สนาม 1 พัน.สห.21', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYMP_1_BNMP31', 'กองร้อยทหารสารวัตรสนาม  1 พัน.สห.31 (ร้อย.สห.สนาม 1 พัน.สห.31)', 'ร้อย.สห.สนาม 1 พัน.สห.31', 'ร้อย.สห.สนาม 1 พัน.สห.31', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYMP_1_BNMP41', 'กองร้อยทหารสารวัตรสนาม  1 พัน.สห.41 (ร้อย.สห.สนาม 1 พัน.สห.41)', 'ร้อย.สห.สนาม 1 พัน.สห.41', 'ร้อย.สห.สนาม 1 พัน.สห.41', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYMP_2_BNMP12', 'กองร้อยทหารสารวัตรสนาม  2 พัน.สห.12 (ร้อย.สห.สนาม 2 พัน.สห.12)', 'ร้อย.สห.สนาม 2 พัน.สห.12', 'ร้อย.สห.สนาม 2 พัน.สห.12', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYMP_2_BNMP21', 'กองร้อยทหารสารวัตรสนาม  2 พัน.สห.21 (ร้อย.สห.สนาม 2 พัน.สห.21)', 'ร้อย.สห.สนาม 2 พัน.สห.21', 'ร้อย.สห.สนาม 2 พัน.สห.21', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYMP_2_BNMP31', 'กองร้อยทหารสารวัตรสนาม  2 พัน.สห.31 (ร้อย.สห.สนาม 2 พัน.สห.31)', 'ร้อย.สห.สนาม 2 พัน.สห.31', 'ร้อย.สห.สนาม 2 พัน.สห.31', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYMP_2_BNMP41', 'กองร้อยทหารสารวัตรสนาม  2 พัน.สห.41 (ร้อย.สห.สนาม 2 พัน.สห.41)', 'ร้อย.สห.สนาม 2 พัน.สห.41', 'ร้อย.สห.สนาม 2 พัน.สห.41', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYMP_3_BNMP12', 'กองร้อยทหารสารวัตรสนาม  3 พัน.สห.12 (ร้อย.สห.สนาม 3 พัน.สห.12)', 'ร้อย.สห.สนาม 3 พัน.สห.12', 'ร้อย.สห.สนาม 3 พัน.สห.12', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYMP_4_BNMP12', 'กองร้อยทหารสารวัตรสนาม  4 พัน.สห.12 (ร้อย.สห.สนาม 4 พัน.สห.12)', 'ร้อย.สห.สนาม 4 พัน.สห.12', 'ร้อย.สห.สนาม 4 พัน.สห.12', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYP_M', 'กองร้อยทหารปืนใหญ่ค้นหาเป้าหมาย (ร้อย.ป.คปม.)', 'ร้อย.ป.คปม.', 'ร้อย.ป.คปม.', 3, 'DIV_ARTILLERY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYQM', 'กองร้อยพลาธิการส่งกำลังสิ่งอุปกรณ์ประเภท 3 (น้ำมัน) (ร้อย.พธ.ส่งกำลังน้ำมัน)', 'ร้อย.พธ.ส่งกำลังน้ำมัน', 'ร้อย.พธ.ส่งกำลังน้ำมัน', 3, 'QM_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYQM_615', 'กองร้อยพลาธิการส่งกำลังสิ่งอุปกรณ์ประเภท 1 (เสบียง) (ร้อย.พธ.ส่งกำลังเสบียง)', 'ร้อย.พธ.ส่งกำลังเสบียง', 'ร้อย.พธ.ส่งกำลังเสบียง', 3, 'QM_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COY_RSPT_REGINF_DIV9', 'กองร้อยส่งกำลังและซ่อมบำรุง กรม สน.พล.ร.9 (ร้อย.สบร.กรม สน.พล.ร.9)', 'ร้อย.สบร.กรม สน.พล.ร.9', 'ร้อย.สบร.กรม สน.พล.ร.9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYSF_TRG1', 'กองร้อยฝึกรบพิเศษที่ 1 (ร้อย.ฝรพ.1)', 'ร้อย.ฝรพ.1', 'ร้อย.ฝรพ.1', 3, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYSF_TRG2', 'กองร้อยฝึกรบพิเศษที่ 2 (ร้อย.ฝรพ.2)', 'ร้อย.ฝรพ.2', 'ร้อย.ฝรพ.2', 3, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYSF_TRG3', 'กองร้อยฝึกรบพิเศษที่ 3 (ร้อย.ฝรพ.3)', 'ร้อย.ฝรพ.3', 'ร้อย.ฝรพ.3', 3, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COYSF_TRG4', 'กองร้อยฝึกรบพิเศษที่ 4 (ร้อย.ฝรพ.4)', 'ร้อย.ฝรพ.4', 'ร้อย.ฝรพ.4', 3, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_COY_SIG_LOG1', 'กองร้อยทหารขนส่งรถยนต์บรรทุกเบา บชร.1 (ร้อย.ขส.รยบ.เบา บชร.1)', 'ร้อย.ขส.รยบ.เบา บชร.1', 'ร้อย.ขส.รยบ.เบา บชร.1', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_ENG_115', 'กองร้อยทหารช่างที่ 115 (ช.ร้อย.115)', 'ช.ร้อย.115', 'ช.ร้อย.115', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_ENG_14', 'กองร้อยทหารช่างที่ 14 (ช.ร้อย.14)', 'ช.ร้อย.14', 'ช.ร้อย.14', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_ENG_18', 'กองร้อยทหารช่างที่ 18 (ช.ร้อย.18)', 'ช.ร้อย.18', 'ช.ร้อย.18', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_ENG93', 'ตอนช่างที่ 93 (ตอน ช.93)', 'ตอน ช.93', 'ตอน ช.93', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_HEAVY_ENG_TEAMLOG1', 'ชุดควบคุมการยุทธส่งกำลังบำรุง บชร.1 (ชคย.บชร.1)', 'ชคย.บชร.1', 'ชคย.บชร.1', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MED_OPS_TEAMLOG4', 'กองควบคุมและสนับสนุนการส่งกำลัง บชร.4 (ควภ.บชร.4)', 'ควภ.บชร.4', 'ควภ.บชร.4', 3, '4th_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MED_TREATMENT_TEAM_1_LOG1', 'ชุดรักษาพยาบาลที่ 1 กองบัญชาการช่วยรบที่ 1 (ชุดรักษาพยาบาลที่ 1 บชร.1)', 'ชุดรักษาพยาบาลที่ 1 บชร.1', 'ชุดรักษาพยาบาลที่ 1 บชร.1', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_13', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 13 (ร้อย.สห.มทบ.13)', 'ร้อย.สห.มทบ.13', 'ร้อย.สห.มทบ.13', 3, 'MTB_13', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_14', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 14 (ร้อย.สห.มทบ.14)', 'ร้อย.สห.มทบ.14', 'ร้อย.สห.มทบ.14', 3, 'MTB_14', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_15', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 15 (ร้อย.สห.มทบ.15)', 'ร้อย.สห.มทบ.15', 'ร้อย.สห.มทบ.15', 3, 'MTB_15', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_16', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 16 (ร้อย.สห.มทบ.16)', 'ร้อย.สห.มทบ.16', 'ร้อย.สห.มทบ.16', 3, 'MTB_16', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_17', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 17 (ร้อย.สห.มทบ.17)', 'ร้อย.สห.มทบ.17', 'ร้อย.สห.มทบ.17', 3, 'MTB_17', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_18', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 18 (ร้อย.สห.มทบ.18)', 'ร้อย.สห.มทบ.18', 'ร้อย.สห.มทบ.18', 3, 'MTB_18', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_19', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 19 (ร้อย.สห.มทบ.19)', 'ร้อย.สห.มทบ.19', 'ร้อย.สห.มทบ.19', 3, 'MTB_19', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_210', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 210 (ร้อย.สห.มทบ.210)', 'ร้อย.สห.มทบ.210', 'ร้อย.สห.มทบ.210', 3, 'MTB_210', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_22', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 22 (ร้อย.สห.มทบ.22)', 'ร้อย.สห.มทบ.22', 'ร้อย.สห.มทบ.22', 3, 'MTB_22', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_23', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 23 (ร้อย.สห.มทบ.23)', 'ร้อย.สห.มทบ.23', 'ร้อย.สห.มทบ.23', 3, 'MTB_23', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_24', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 24 (ร้อย.สห.มทบ.24)', 'ร้อย.สห.มทบ.24', 'ร้อย.สห.มทบ.24', 3, 'MTB_24', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_25', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 25 (ร้อย.สห.มทบ.25)', 'ร้อย.สห.มทบ.25', 'ร้อย.สห.มทบ.25', 3, 'MTB_25', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_26', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 26 (ร้อย.สห.มทบ.26)', 'ร้อย.สห.มทบ.26', 'ร้อย.สห.มทบ.26', 3, 'MTB_26', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_27', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 27 (ร้อย.สห.มทบ.27)', 'ร้อย.สห.มทบ.27', 'ร้อย.สห.มทบ.27', 3, 'MTB_27', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_28', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 28 (ร้อย.สห.มทบ.28)', 'ร้อย.สห.มทบ.28', 'ร้อย.สห.มทบ.28', 3, 'MTB_28', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_29', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 29 (ร้อย.สห.มทบ.29)', 'ร้อย.สห.มทบ.29', 'ร้อย.สห.มทบ.29', 3, 'MTB_29', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_31', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 31 (ร้อย.สห.มทบ.31)', 'ร้อย.สห.มทบ.31', 'ร้อย.สห.มทบ.31', 3, 'MTB_31', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_310', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 310 (ร้อย.สห.มทบ.310)', 'ร้อย.สห.มทบ.310', 'ร้อย.สห.มทบ.310', 3, 'MTB_310', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_32', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 32 (ร้อย.สห.มทบ.32)', 'ร้อย.สห.มทบ.32', 'ร้อย.สห.มทบ.32', 3, 'MTB_32', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_33', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 33 (ร้อย.สห.มทบ.33)', 'ร้อย.สห.มทบ.33', 'ร้อย.สห.มทบ.33', 3, 'MTB_33', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_34', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 34 (ร้อย.สห.มทบ.34)', 'ร้อย.สห.มทบ.34', 'ร้อย.สห.มทบ.34', 3, 'MTB_34', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_35', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 35 (ร้อย.สห.มทบ.35)', 'ร้อย.สห.มทบ.35', 'ร้อย.สห.มทบ.35', 3, 'MTB_35', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_36', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 36 (ร้อย.สห.มทบ.36)', 'ร้อย.สห.มทบ.36', 'ร้อย.สห.มทบ.36', 3, 'MTB_36', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_37', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 37 (ร้อย.สห.มทบ.37)', 'ร้อย.สห.มทบ.37', 'ร้อย.สห.มทบ.37', 3, 'MTB_37', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_38', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 38 (ร้อย.สห.มทบ.38)', 'ร้อย.สห.มทบ.38', 'ร้อย.สห.มทบ.38', 3, 'MTB_38', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_42', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 42 (ร้อย.สห.มทบ.42)', 'ร้อย.สห.มทบ.42', 'ร้อย.สห.มทบ.42', 3, 'MTB_42', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_43', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 43 (ร้อย.สห.มทบ.43)', 'ร้อย.สห.มทบ.43', 'ร้อย.สห.มทบ.43', 3, 'MTB_43', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_44', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 44 (ร้อย.สห.มทบ.44)', 'ร้อย.สห.มทบ.44', 'ร้อย.สห.มทบ.44', 3, 'MTB_44', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_45', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 45 (ร้อย.สห.มทบ.45)', 'ร้อย.สห.มทบ.45', 'ร้อย.สห.มทบ.45', 3, 'MTB_45', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MP_MTB_46', 'กองร้อยสารวัตรทหาร มณฑลทหารบกที่ 46 (ร้อย.สห.มทบ.46)', 'ร้อย.สห.มทบ.46', 'ร้อย.สห.มทบ.46', 3, 'MTB_46', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_12', 'กองร้อยมณฑลทหารบกที่ 12 (ร้อย.มทบ.12)', 'ร้อย.มทบ.12', 'ร้อย.มทบ.12', 3, 'MTB_12', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_13', 'กองร้อยมณฑลทหารบกที่ 13 (ร้อย.มทบ.13)', 'ร้อย.มทบ.13', 'ร้อย.มทบ.13', 3, 'MTB_13', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_14', 'กองร้อยมณฑลทหารบกที่ 14 (ร้อย.มทบ.14)', 'ร้อย.มทบ.14', 'ร้อย.มทบ.14', 3, 'MTB_14', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_16', 'กองร้อยมณฑลทหารบกที่ 16 (ร้อย.มทบ.16)', 'ร้อย.มทบ.16', 'ร้อย.มทบ.16', 3, 'MTB_16', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_17', 'กองร้อยมณฑลทหารบกที่ 17 (ร้อย.มทบ.17)', 'ร้อย.มทบ.17', 'ร้อย.มทบ.17', 3, 'MTB_17', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_18', 'กองร้อยมณฑลทหารบกที่ 18 (ร้อย.มทบ.18)', 'ร้อย.มทบ.18', 'ร้อย.มทบ.18', 3, 'MTB_18', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_19', 'กองร้อยมณฑลทหารบกที่ 19 (ร้อย.มทบ.19)', 'ร้อย.มทบ.19', 'ร้อย.มทบ.19', 3, 'MTB_19', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_210', 'กองร้อยมณฑลทหารบกที่ 210 (ร้อย.มทบ.210)', 'ร้อย.มทบ.210', 'ร้อย.มทบ.210', 3, 'MTB_210', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_22', 'กองร้อยมณฑลทหารบกที่ 22 (ร้อย.มทบ.22)', 'ร้อย.มทบ.22', 'ร้อย.มทบ.22', 3, 'MTB_22', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_24', 'กองร้อยมณฑลทหารบกที่ 24 (ร้อย.มทบ.24)', 'ร้อย.มทบ.24', 'ร้อย.มทบ.24', 3, 'MTB_24', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_25', 'กองร้อยมณฑลทหารบกที่ 25 (ร้อย.มทบ.25)', 'ร้อย.มทบ.25', 'ร้อย.มทบ.25', 3, 'MTB_25', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_26', 'กองร้อยมณฑลทหารบกที่ 26 (ร้อย.มทบ.26)', 'ร้อย.มทบ.26', 'ร้อย.มทบ.26', 3, 'MTB_26', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_27', 'กองร้อยมณฑลทหารบกที่ 27 (ร้อย.มทบ.27)', 'ร้อย.มทบ.27', 'ร้อย.มทบ.27', 3, 'MTB_27', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_28', 'กองร้อยมณฑลทหารบกที่ 28 (ร้อย.มทบ.28)', 'ร้อย.มทบ.28', 'ร้อย.มทบ.28', 3, 'MTB_28', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_29', 'กองร้อยมณฑลทหารบกที่ 29 (ร้อย.มทบ.29)', 'ร้อย.มทบ.29', 'ร้อย.มทบ.29', 3, 'MTB_29', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_31', 'กองร้อยมณฑลทหารบกที่ 31 (ร้อย.มทบ.31)', 'ร้อย.มทบ.31', 'ร้อย.มทบ.31', 3, 'MTB_31', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_310', 'กองร้อยมณฑลทหารบกที่ 310 (ร้อย.มทบ.310)', 'ร้อย.มทบ.310', 'ร้อย.มทบ.310', 3, 'MTB_310', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_32', 'กองร้อยมณฑลทหารบกที่ 32 (ร้อย.มทบ.32)', 'ร้อย.มทบ.32', 'ร้อย.มทบ.32', 3, 'MTB_32', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_34', 'กองร้อยมณฑลทหารบกที่ 34 (ร้อย.มทบ.34)', 'ร้อย.มทบ.34', 'ร้อย.มทบ.34', 3, 'MTB_34', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_35', 'กองร้อยมณฑลทหารบกที่ 35 (ร้อย.มทบ.35)', 'ร้อย.มทบ.35', 'ร้อย.มทบ.35', 3, 'MTB_35', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_36', 'กองร้อยมณฑลทหารบกที่ 36 (ร้อย.มทบ.36)', 'ร้อย.มทบ.36', 'ร้อย.มทบ.36', 3, 'MTB_36', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_37', 'กองร้อยมณฑลทหารบกที่ 37 (ร้อย.มทบ.37)', 'ร้อย.มทบ.37', 'ร้อย.มทบ.37', 3, 'MTB_37', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_38', 'กองร้อยมณฑลทหารบกที่ 38 (ร้อย.มทบ.38)', 'ร้อย.มทบ.38', 'ร้อย.มทบ.38', 3, 'MTB_38', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_39', 'กองร้อยมณฑลทหารบกที่ 39 (ร้อย.มทบ.39)', 'ร้อย.มทบ.39', 'ร้อย.มทบ.39', 3, 'MTB_39', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_41', 'กองร้อยมณฑลทหารบกที่ 41 (ร้อย.มทบ.41)', 'ร้อย.มทบ.41', 'ร้อย.มทบ.41', 3, 'MTB_41', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_43', 'กองร้อยมณฑลทหารบกที่ 43 (ร้อย.มทบ.43)', 'ร้อย.มทบ.43', 'ร้อย.มทบ.43', 3, 'MTB_43', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_44', 'กองร้อยมณฑลทหารบกที่ 44 (ร้อย.มทบ.44)', 'ร้อย.มทบ.44', 'ร้อย.มทบ.44', 3, 'MTB_44', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_45', 'กองร้อยมณฑลทหารบกที่ 45 (ร้อย.มทบ.45)', 'ร้อย.มทบ.45', 'ร้อย.มทบ.45', 3, 'MTB_45', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_MTB_46', 'กองร้อยมณฑลทหารบกที่ 46 (ร้อย.มทบ.46)', 'ร้อย.มทบ.46', 'ร้อย.มทบ.46', 3, 'MTB_46', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_ORD_LIGHT1', 'กองสรรพาวุธเบา 1 (กอง สพบ.1)', 'กอง สพบ.1', 'กอง สพบ.1', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_ORD_LIGHTAAD_DIV', 'กองสรรพาวุธเบา พล.ปตอ. (กอง สพบ.พล.ปตอ.)', 'กอง สพบ.พล.ปตอ.', 'กอง สพบ.พล.ปตอ.', 3, 'AAD_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_ORD_LIGHTCAV_DIV1', 'กองสรรพาวุธเบา พล.ม.1 (กอง สพบ.พล.ม.1)', 'กอง สพบ.พล.ม.1', 'กอง สพบ.พล.ม.1', 3, '1st_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_ORD_LIGHTINF_DIV3', 'กองสรรพาวุธเบา พล.ร.3 (กอง สพบ.พล.ร.3)', 'กอง สพบ.พล.ร.3', 'กอง สพบ.พล.ร.3', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_ORD_LIGHTINF_DIV4', 'กองสรรพาวุธเบา พล.ร.4 (กอง สพบ.พล.ร.4)', 'กอง สพบ.พล.ร.4', 'กอง สพบ.พล.ร.4', 3, '4th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_ORD_LIGHTINF_DIV5', 'กองสรรพาวุธเบา พล.ร.5 (กอง สพบ.พล.ร.5)', 'กอง สพบ.พล.ร.5', 'กอง สพบ.พล.ร.5', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_ORD_LIGHTINF_DIV6', 'กองสรรพาวุธเบา พล.ร.6 (กอง สพบ.พล.ร.6)', 'กอง สพบ.พล.ร.6', 'กอง สพบ.พล.ร.6', 3, '6th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_11', 'กองเรือนจำ มณฑลทหารบกที่ 11 (กอง รจ.มทบ.11)', 'กอง รจ.มทบ.11', 'กอง รจ.มทบ.11', 3, 'MTB_11', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_12', 'กองเรือนจำ มณฑลทหารบกที่ 12 (กอง รจ.มทบ.12)', 'กอง รจ.มทบ.12', 'กอง รจ.มทบ.12', 3, 'MTB_12', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_13', 'กองเรือนจำ มณฑลทหารบกที่ 13 (กอง รจ.มทบ.13)', 'กอง รจ.มทบ.13', 'กอง รจ.มทบ.13', 3, 'MTB_13', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_14', 'กองเรือนจำ มณฑลทหารบกที่ 14 (กอง รจ.มทบ.14)', 'กอง รจ.มทบ.14', 'กอง รจ.มทบ.14', 3, 'MTB_14', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_15', 'กองเรือนจำ มณฑลทหารบกที่ 15 (กอง รจ.มทบ.15)', 'กอง รจ.มทบ.15', 'กอง รจ.มทบ.15', 3, 'MTB_15', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_21', 'กองเรือนจำ มณฑลทหารบกที่ 21 (กอง รจ.มทบ.21)', 'กอง รจ.มทบ.21', 'กอง รจ.มทบ.21', 3, 'MTB_21', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_22', 'กองเรือนจำ มณฑลทหารบกที่ 22 (กอง รจ.มทบ.22)', 'กอง รจ.มทบ.22', 'กอง รจ.มทบ.22', 3, 'MTB_22', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_23', 'กองเรือนจำ มณฑลทหารบกที่ 23 (กอง รจ.มทบ.23)', 'กอง รจ.มทบ.23', 'กอง รจ.มทบ.23', 3, 'MTB_23', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_24', 'กองเรือนจำ มณฑลทหารบกที่ 24 (กอง รจ.มทบ.24)', 'กอง รจ.มทบ.24', 'กอง รจ.มทบ.24', 3, 'MTB_24', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_31', 'กองเรือนจำ มณฑลทหารบกที่ 31 (กอง รจ.มทบ.31)', 'กอง รจ.มทบ.31', 'กอง รจ.มทบ.31', 3, 'MTB_31', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_32', 'กองเรือนจำ มณฑลทหารบกที่ 32 (กอง รจ.มทบ.32)', 'กอง รจ.มทบ.32', 'กอง รจ.มทบ.32', 3, 'MTB_32', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_33', 'กองเรือนจำ มณฑลทหารบกที่ 33 (กอง รจ.มทบ.33)', 'กอง รจ.มทบ.33', 'กอง รจ.มทบ.33', 3, 'MTB_33', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_41', 'กองเรือนจำ มณฑลทหารบกที่ 41 (กอง รจ.มทบ.41)', 'กอง รจ.มทบ.41', 'กอง รจ.มทบ.41', 3, 'MTB_41', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_PRISON_MTB_42', 'กองเรือนจำ มณฑลทหารบกที่ 42 (กอง รจ.มทบ.42)', 'กอง รจ.มทบ.42', 'กอง รจ.มทบ.42', 3, 'MTB_42', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_QM', 'กองพลาธิการ สกอ. (กอง พธ.สกอ.)', 'กอง พธ.สกอ.', 'กอง พธ.สกอ.', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_QM1', 'กองพลาธิการ 1 (กอง พธ.1)', 'กอง พธ.1', 'กอง พธ.1', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_QM12', 'กองพลาธิการ 12 (กอง พธ.12)', 'กอง พธ.12', 'กอง พธ.12', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_QM2', 'กองพลาธิการ 2 (กอง พธ.2)', 'กอง พธ.2', 'กอง พธ.2', 3, '1st_LOG_CMD', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_QMAAD_DIV', 'กองพลาธิการ พล.ปตอ. (กอง พธ.พล.ปตอ.)', 'กอง พธ.พล.ปตอ.', 'กอง พธ.พล.ปตอ.', 3, 'AAD_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_QMCAV_DIV1', 'กองพลาธิการ พล.ม.1 (กอง พธ.พล.ม.1)', 'กอง พธ.พล.ม.1', 'กอง พธ.พล.ม.1', 3, '1st_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_QMINF_DIV3', 'กองพลาธิการ พล.ร.3 (กอง พธ.พล.ร.3)', 'กอง พธ.พล.ร.3', 'กอง พธ.พล.ร.3', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_QMINF_DIV4', 'กองพลาธิการ พล.ร.4 (กอง พธ.พล.ร.4)', 'กอง พธ.พล.ร.4', 'กอง พธ.พล.ร.4', 3, '4th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_QMINF_DIV5', 'กองพลาธิการ พล.ร.5 (กอง พธ.พล.ร.5)', 'กอง พธ.พล.ร.5', 'กอง พธ.พล.ร.5', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_QMINF_DIV6', 'กองพลาธิการ พล.ร.6 (กอง พธ.พล.ร.6)', 'กอง พธ.พล.ร.6', 'กอง พธ.พล.ร.6', 3, '6th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_SIG_TEAM1', 'ชุดสื่อสารสนามที่ 1 (ชสบ.1)', 'ชสบ.1', 'ชสบ.1', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_SIG_TEAM2', 'ชุดสื่อสารสนามที่ 2 (ชสบ.2)', 'ชสบ.2', 'ชสบ.2', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_SIG_TEAM3', 'ชุดสื่อสารสนามที่ 3 (ชสบ.3)', 'ชสบ.3', 'ชสบ.3', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_SIG_TEAM4', 'ชุดสื่อสารสนามที่ 4 (ชสบ.4)', 'ชสบ.4', 'ชสบ.4', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_SIG_TEAM5', 'ชุดสื่อสารสนามที่ 5 (ชสบ.5)', 'ชสบ.5', 'ชสบ.5', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_SIG_TEAM6', 'ชุดสื่อสารสนามที่ 6 (ชสบ.6)', 'ชสบ.6', 'ชสบ.6', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_SIG_TEAM7', 'ชุดสื่อสารสนามที่ 7 (ชสบ.7)', 'ชสบ.7', 'ชสบ.7', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_SIG_TEAM8', 'ชุดสื่อสารสนามที่ 8 (ชสบ.8)', 'ชสบ.8', 'ชสบ.8', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('COY_SIG_TEAM9', 'ชุดสื่อสารสนามที่ 9 (ชสบ.9)', 'ชสบ.9', 'ชสบ.9', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CTR_TD_MTB_12', 'ศูนย์การฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 12 (ศฝ.นศท.มทบ.12)', 'ศฝ.นศท.มทบ.12', 'ศฝ.นศท.มทบ.12', 3, 'MTB_12', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CTR_TD_MTB_13', 'ศูนย์การฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 13 (ศฝ.นศท.มทบ.13)', 'ศฝ.นศท.มทบ.13', 'ศฝ.นศท.มทบ.13', 3, 'MTB_13', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CTR_TD_MTB_14', 'ศูนย์การฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 14 (ศฝ.นศท.มทบ.14)', 'ศฝ.นศท.มทบ.14', 'ศฝ.นศท.มทบ.14', 3, 'MTB_14', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CTR_TD_MTB_21', 'ศูนย์การฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 21 (ศฝ.นศท.มทบ.21)', 'ศฝ.นศท.มทบ.21', 'ศฝ.นศท.มทบ.21', 3, 'MTB_21', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CTR_TD_MTB_22', 'ศูนย์การฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 22 (ศฝ.นศท.มทบ.22)', 'ศฝ.นศท.มทบ.22', 'ศฝ.นศท.มทบ.22', 3, 'MTB_22', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CTR_TD_MTB_23', 'ศูนย์การฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 23 (ศฝ.นศท.มทบ.23)', 'ศฝ.นศท.มทบ.23', 'ศฝ.นศท.มทบ.23', 3, 'MTB_23', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CTR_TD_MTB_24', 'ศูนย์การฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 24 (ศฝ.นศท.มทบ.24)', 'ศฝ.นศท.มทบ.24', 'ศฝ.นศท.มทบ.24', 3, 'MTB_24', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CTR_TD_MTB_31', 'ศูนย์การฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 31 (ศฝ.นศท.มทบ.31)', 'ศฝ.นศท.มทบ.31', 'ศฝ.นศท.มทบ.31', 3, 'MTB_31', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CTR_TD_MTB_32', 'ศูนย์การฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 32 (ศฝ.นศท.มทบ.32)', 'ศฝ.นศท.มทบ.32', 'ศฝ.นศท.มทบ.32', 3, 'MTB_32', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CTR_TD_MTB_33', 'ศูนย์การฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 33 (ศฝ.นศท.มทบ.33)', 'ศฝ.นศท.มทบ.33', 'ศฝ.นศท.มทบ.33', 3, 'MTB_33', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CTR_TD_MTB_41', 'ศูนย์การฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 41 (ศฝ.นศท.มทบ.41)', 'ศฝ.นศท.มทบ.41', 'ศฝ.นศท.มทบ.41', 3, 'MTB_41', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('CTR_TD_MTB_42', 'ศูนย์การฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 42 (ศฝ.นศท.มทบ.42)', 'ศฝ.นศท.มทบ.42', 'ศฝ.นศท.มทบ.42', 3, 'MTB_42', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_BN_1', 'กองพันทหารช่างที่ 1 (ช.พัน.1)', 'ช.พัน.1', 'ช.พัน.1', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_BN_15__INF_DIV15', 'กองพันทหารช่างที่ 15 พล.ร.15 (ช.พัน.15 พล.ร.15)', 'ช.พัน.15 พล.ร.15', 'ช.พัน.15 พล.ร.15', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_BN_2', 'กองพันทหารช่างที่ 2 (ช.พัน.2)', 'ช.พัน.2', 'ช.พัน.2', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_BN_3__INF_DIV3', 'กองพันทหารช่างที่ 3 พล.ร.3 (ช.พัน.3 พล.ร.3)', 'ช.พัน.3 พล.ร.3', 'ช.พัน.3 พล.ร.3', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_BN_401__DEV_DIV_4', 'กองพันทหารช่างที่ 401 พล.พัฒนา 4 (ช.พัน.401 พล.พัฒนา 4)', 'ช.พัน.401 พล.พัฒนา 4', 'ช.พัน.401 พล.พัฒนา 4', 3, 'DEV_DIV_4', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_BN_402__DEV_DIV_4', 'กองพันทหารช่างที่ 402 พล.พัฒนา 4 (ช.พัน.402 พล.พัฒนา 4)', 'ช.พัน.402 พล.พัฒนา 4', 'ช.พัน.402 พล.พัฒนา 4', 3, 'DEV_DIV_4', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_BN_4__INF_DIV4', 'กองพันทหารช่างที่ 4 พล.ร.4 (ช.พัน.4 พล.ร.4)', 'ช.พัน.4 พล.ร.4', 'ช.พัน.4 พล.ร.4', 3, '4th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_BN_51', 'กองพันทหารช่างที่ 51 (ช.พัน.51)', 'ช.พัน.51', 'ช.พัน.51', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_BN_5__INF_DIV5', 'กองพันทหารช่างที่ 5 พล.ร.5 (ช.พัน.5 พล.ร.5)', 'ช.พัน.5 พล.ร.5', 'ช.พัน.5 พล.ร.5', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_BN_6__INF_DIV6', 'กองพันทหารช่างที่ 6 พล.ร.6 (ช.พัน.6 พล.ร.6)', 'ช.พัน.6 พล.ร.6', 'ช.พัน.6 พล.ร.6', 3, '6th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_BN_8__CAV_DIV1', 'กองพันทหารช่างที่ 8 พล.ม.1 (ช.พัน.8 พล.ม.1)', 'ช.พัน.8 พล.ม.1', 'ช.พัน.8 พล.ม.1', 3, '1st_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_BN_9__INF_DIV9', 'กองพันทหารช่างที่ 9 พล.ร.9 (ช.พัน.9 พล.ร.9)', 'ช.พัน.9 พล.ร.9', 'ช.พัน.9 พล.ร.9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_REG_1', 'กรมทหารช่างที่ 1 (ช.1)', 'ช.1', 'ช.1', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_REG_11', 'กรมทหารช่างที่ 11 (ช.11)', 'ช.11', 'ช.11', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_REG_11_BN_111', 'กองพันทหารช่างที่ 111 กรมทหารช่างที่ 11 (ช.11 พัน.111)', 'ช.11 พัน.111', 'ช.11 พัน.111', 3, 'ENG_REG_11', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_REG_11_BN_602', 'กองพันทหารช่างที่ 602 กรมทหารช่างที่ 11 (ช.11 พัน.602)', 'ช.11 พัน.602', 'ช.11 พัน.602', 3, 'ENG_REG_11', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_REG_1_BN_112', 'กองพันทหารช่างที่ 112 กรมทหารช่างที่ 1 (ช.1 พัน.112)', 'ช.1 พัน.112', 'ช.1 พัน.112', 3, 'ENG_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_REG_1_BN_52', 'กองพันทหารช่างที่ 52 กรมทหารช่างที่ 1 (ช.1 พัน.52)', 'ช.1 พัน.52', 'ช.1 พัน.52', 3, 'ENG_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_REG_2', 'กรมทหารช่างที่ 2 (ช.2)', 'ช.2', 'ช.2', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_REG_21', 'กรมทหารช่างที่ 21 (ช.21)', 'ช.21', 'ช.21', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_REG_2_BN_201', 'กองพันทหารช่างที่ 201 กรมทหารช่างที่ 2 (ช.2 พัน.201)', 'ช.2 พัน.201', 'ช.2 พัน.201', 3, 'ENG_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_REG_2_BN_202', 'กองพันทหารช่างที่ 202 กรมทหารช่างที่ 2 (ช.2 พัน.202)', 'ช.2 พัน.202', 'ช.2 พัน.202', 3, 'ENG_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_REG_3', 'กรมทหารช่างที่ 3 (ช.3)', 'ช.3', 'ช.3', 3, 'DIV_ENG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_REG_3_BN_302', 'กองพันทหารช่างที่ 302 กรมทหารช่างที่ 3 (ช.3 พัน.302)', 'ช.3 พัน.302', 'ช.3 พัน.302', 3, 'ENG_REG_3', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_ADISORN', 'โรงพยาบาลค่ายอดิศร', 'รพ.ค่ายอดิศร', 'รพ.ค่ายอดิศร', 3, 'MTB_18', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_ANAND', 'โรงพยาบาลอานันทมหิดล (รพ.อ.ป.ร.)', 'รพ.อ.ป.ร.', 'รพ.อ.ป.ร.', 3, 'DEPT_MED_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_CHAKRAPHONG', 'โรงพยาบาลค่ายจักรพงษ์', 'รพ.ค่ายจักรพงษ์', 'รพ.ค่ายจักรพงษ์', 3, 'MTB_12', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_CHAOPHRAYA_BURIRAM', 'โรงพยาบาลค่ายสมเด็จเจ้าพระยามหากษัตริย์ศึก', 'รพ.ค่ายสมเด็จเจ้าพระยามหากษัตริย์ศึก', 'รพ.ค่ายสมเด็จเจ้าพระยามหากษัตริย์ศึก', 3, 'MTB_26', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_CRMA', 'โรงพยาบาลโรงเรียนนายร้อยพระจุลจอมเกล้า', 'รพ.รร.จปร.', 'รพ.รร.จปร.', 3, 'CRMA_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_INGKHAYUT', 'โรงพยาบาลค่ายอิงคยุทธบริหาร', 'รพ.ค่ายอิงคยุทธบริหาร', 'รพ.ค่ายอิงคยุทธบริหาร', 3, 'MTB_46', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_JIRAPRAWAT', 'โรงพยาบาลค่ายจิรประวัติ', 'รพ.ค่ายจิรประวัติ', 'รพ.ค่ายจิรประวัติ', 3, 'MTB_31', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_KAWILA', 'โรงพยาบาลค่ายกาวิละ', 'รพ.ค่ายกาวิละ', 'รพ.ค่ายกาวิละ', 3, 'MTB_33', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_KHETUDOMSAK', 'โรงพยาบาลค่ายเขตอุดมศักดิ์', 'รพ.ค่ายเขตอุดมศักดิ์', 'รพ.ค่ายเขตอุดมศักดิ์', 3, 'MTB_44', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_KHUNCHUEANG', 'โรงพยาบาลค่ายขุนเจืองธรรมิกราช', 'รพ.ค่ายขุนเจืองธรรมิกราช', 'รพ.ค่ายขุนเจืองธรรมิกราช', 3, 'MTB_34', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_KRITSIWARA', 'โรงพยาบาลค่ายกฤษณ์สีวะรา', 'รพ.ค่ายกฤษณ์สีวะรา', 'รพ.ค่ายกฤษณ์สีวะรา', 3, 'MTB_29', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_MENGRAI', 'โรงพยาบาลค่ายเม็งรายมหาราช', 'รพ.ค่ายเม็งรายมหาราช', 'รพ.ค่ายเม็งรายมหาราช', 3, 'MTB_37', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_NARESUAN', 'โรงพยาบาลค่ายสมเด็จพระนเรศวรมหาราช', 'รพ.ค่ายสมเด็จพระนเรศวรมหาราช', 'รพ.ค่ายสมเด็จพระนเรศวรมหาราช', 3, 'MTB_39', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_NAWAMIN', 'โรงพยาบาลค่ายนวมินทราชินี', 'รพ.ค่ายนวมินทราชินี', 'รพ.ค่ายนวมินทราชินี', 3, 'MTB_14', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_PHAMUEANG', 'โรงพยาบาลค่ายพ่อขุนผาเมือง', 'รพ.ค่ายพ่อขุนผาเมือง', 'รพ.ค่ายพ่อขุนผาเมือง', 3, 'MTB_36', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_PHANURANGSI', 'โรงพยาบาลค่ายภาณุรังษี', 'รพ.ค่ายภาณุรังษี', 'รพ.ค่ายภาณุรังษี', 3, 'MTB_16', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_PHICHAIDABHAK', 'โรงพยาบาลค่ายพิชัยดาบหัก', 'รพ.ค่ายพิชัยดาบหัก', 'รพ.ค่ายพิชัยดาบหัก', 3, 'MTB_35', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_PHRAMONGKUT', 'โรงพยาบาลพระมงกุฎเกล้า (รร.6)', 'รพ.รร.6', 'รพ.รร.6', 3, 'DEPT_MED_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_PRAJAX', 'โรงพยาบาลค่ายประจักษ์ศิลปาคม', 'รพ.ค่ายประจักษ์ศิลปาคม', 'รพ.ค่ายประจักษ์ศิลปาคม', 3, 'MTB_24', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_PRAYOD', 'โรงพยาบาลค่ายพระยอดเมืองขวาง', 'รพ.ค่ายพระยอดเมืองขวาง', 'รพ.ค่ายพระยอดเมืองขวาง', 3, 'MTB_210', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_RAMA1_ROIET', 'โรงพยาบาลค่ายสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช', 'รพ.ค่ายสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช', 'รพ.ค่ายสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช', 3, 'MTB_27', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_RAMRACHANIWET', 'โรงพยาบาลค่ายรามราชนิเวศน์', 'รพ.ค่ายรามราชนิเวศน์', 'รพ.ค่ายรามราชนิเวศน์', 3, 'MTB_15', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_SAPPASIT', 'โรงพยาบาลค่ายสรรพสิทธิประสงค์', 'รพ.ค่ายสรรพสิทธิประสงค์', 'รพ.ค่ายสรรพสิทธิประสงค์', 3, 'MTB_22', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_SENANARONG', 'โรงพยาบาลค่ายเสนาณรงค์', 'รพ.ค่ายเสนาณรงค์', 'รพ.ค่ายเสนาณรงค์', 3, 'MTB_42', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_SRIPHATCHA', 'โรงพยาบาลค่ายศรีพัชรินทร', 'รพ.ค่ายศรีพัชรินทร', 'รพ.ค่ายศรีพัชรินทร', 3, 'MTB_23', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_SRISONGRAK', 'โรงพยาบาลค่ายศรีสองรัก', 'รพ.ค่ายศรีสองรัก', 'รพ.ค่ายศรีสองรัก', 3, 'MTB_28', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_SURANARI', 'โรงพยาบาลค่ายสุรนารี', 'รพ.ค่ายสุรนารี', 'รพ.ค่ายสุรนารี', 3, 'MTB_21', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_SURASAK', 'โรงพยาบาลค่ายสุรศักดิ์มนตรี', 'รพ.ค่ายสุรศักดิ์มนตรี', 'รพ.ค่ายสุรศักดิ์มนตรี', 3, 'MTB_32', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_SURASI', 'โรงพยาบาลค่ายสุรสีห์', 'รพ.ค่ายสุรสีห์', 'รพ.ค่ายสุรสีห์', 3, 'MTB_17', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_SURASINGHANAT', 'โรงพยาบาลค่ายสุรสิงหนาท', 'รพ.ค่ายสุรสิงหนาท', 'รพ.ค่ายสุรสิงหนาท', 3, 'MTB_19', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_SURIYAPHONG', 'โรงพยาบาลค่ายสุริยพงษ์', 'รพ.ค่ายสุริยพงษ์', 'รพ.ค่ายสุริยพงษ์', 3, 'MTB_38', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_THANARAT', 'โรงพยาบาลค่ายธนะรัชต์', 'รพ.ค่ายธนะรัชต์', 'รพ.ค่ายธนะรัชต์', 3, 'MTB_15', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_THEPSATRI', 'โรงพยาบาลค่ายเทพสตรีศรีสุนทร', 'รพ.ค่ายเทพสตรีศรีสุนทร', 'รพ.ค่ายเทพสตรีศรีสุนทร', 3, 'MTB_43', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_VACHIRAPRAKAN', 'โรงพยาบาลค่ายวชิรปราการ', 'รพ.ค่ายวชิรปราการ', 'รพ.ค่ายวชิรปราการ', 3, 'MTB_310', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_VACHIRAVUDH', 'โรงพยาบาลค่ายวชิราวุธ', 'รพ.ค่ายวชิราวุธ', 'รพ.ค่ายวชิราวุธ', 3, 'MTB_41', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_VIPHAVADI', 'โรงพยาบาลค่ายวิภาวดีรังสิต', 'รพ.ค่ายวิภาวดีรังสิต', 'รพ.ค่ายวิภาวดีรังสิต', 3, 'MTB_45', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('HOSP_WEERAWAT', 'โรงพยาบาลค่ายวีรวัฒน์โยธิน', 'รพ.ค่ายวีรวัฒน์โยธิน', 'รพ.ค่ายวีรวัฒน์โยธิน', 3, 'MTB_25', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_11', 'หมวดดุริยางค์ มณฑลทหารบกที่ 11 (มว.ดย.มทบ.11)', 'มว.ดย.มทบ.11', 'มว.ดย.มทบ.11', 3, 'MTB_11', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_12', 'หมวดดุริยางค์ มณฑลทหารบกที่ 12 (มว.ดย.มทบ.12)', 'มว.ดย.มทบ.12', 'มว.ดย.มทบ.12', 3, 'MTB_12', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_13', 'หมวดดุริยางค์ มณฑลทหารบกที่ 13 (มว.ดย.มทบ.13)', 'มว.ดย.มทบ.13', 'มว.ดย.มทบ.13', 3, 'MTB_13', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_14', 'หมวดดุริยางค์ มณฑลทหารบกที่ 14 (มว.ดย.มทบ.14)', 'มว.ดย.มทบ.14', 'มว.ดย.มทบ.14', 3, 'MTB_14', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_15', 'หมวดดุริยางค์ มณฑลทหารบกที่ 15 (มว.ดย.มทบ.15)', 'มว.ดย.มทบ.15', 'มว.ดย.มทบ.15', 3, 'MTB_15', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_16', 'หมวดดุริยางค์ มณฑลทหารบกที่ 16 (มว.ดย.มทบ.16)', 'มว.ดย.มทบ.16', 'มว.ดย.มทบ.16', 3, 'MTB_16', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_17', 'หมวดดุริยางค์ มณฑลทหารบกที่ 17 (มว.ดย.มทบ.17)', 'มว.ดย.มทบ.17', 'มว.ดย.มทบ.17', 3, 'MTB_17', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_18', 'หมวดดุริยางค์ มณฑลทหารบกที่ 18 (มว.ดย.มทบ.18)', 'มว.ดย.มทบ.18', 'มว.ดย.มทบ.18', 3, 'MTB_18', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_19', 'หมวดดุริยางค์ มณฑลทหารบกที่ 19 (มว.ดย.มทบ.19)', 'มว.ดย.มทบ.19', 'มว.ดย.มทบ.19', 3, 'MTB_19', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_21', 'หมวดดุริยางค์ มณฑลทหารบกที่ 21 (มว.ดย.มทบ.21)', 'มว.ดย.มทบ.21', 'มว.ดย.มทบ.21', 3, 'MTB_21', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_210', 'หมวดดุริยางค์ มณฑลทหารบกที่ 210 (มว.ดย.มทบ.210)', 'มว.ดย.มทบ.210', 'มว.ดย.มทบ.210', 3, 'MTB_210', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_22', 'หมวดดุริยางค์ มณฑลทหารบกที่ 22 (มว.ดย.มทบ.22)', 'มว.ดย.มทบ.22', 'มว.ดย.มทบ.22', 3, 'MTB_22', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_23', 'หมวดดุริยางค์ มณฑลทหารบกที่ 23 (มว.ดย.มทบ.23)', 'มว.ดย.มทบ.23', 'มว.ดย.มทบ.23', 3, 'MTB_23', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_24', 'หมวดดุริยางค์ มณฑลทหารบกที่ 24 (มว.ดย.มทบ.24)', 'มว.ดย.มทบ.24', 'มว.ดย.มทบ.24', 3, 'MTB_24', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_25', 'หมวดดุริยางค์ มณฑลทหารบกที่ 25 (มว.ดย.มทบ.25)', 'มว.ดย.มทบ.25', 'มว.ดย.มทบ.25', 3, 'MTB_25', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_26', 'หมวดดุริยางค์ มณฑลทหารบกที่ 26 (มว.ดย.มทบ.26)', 'มว.ดย.มทบ.26', 'มว.ดย.มทบ.26', 3, 'MTB_26', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_27', 'หมวดดุริยางค์ มณฑลทหารบกที่ 27 (มว.ดย.มทบ.27)', 'มว.ดย.มทบ.27', 'มว.ดย.มทบ.27', 3, 'MTB_27', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_28', 'หมวดดุริยางค์ มณฑลทหารบกที่ 28 (มว.ดย.มทบ.28)', 'มว.ดย.มทบ.28', 'มว.ดย.มทบ.28', 3, 'MTB_28', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_29', 'หมวดดุริยางค์ มณฑลทหารบกที่ 29 (มว.ดย.มทบ.29)', 'มว.ดย.มทบ.29', 'มว.ดย.มทบ.29', 3, 'MTB_29', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_31', 'หมวดดุริยางค์ มณฑลทหารบกที่ 31 (มว.ดย.มทบ.31)', 'มว.ดย.มทบ.31', 'มว.ดย.มทบ.31', 3, 'MTB_31', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_310', 'หมวดดุริยางค์ มณฑลทหารบกที่ 310 (มว.ดย.มทบ.310)', 'มว.ดย.มทบ.310', 'มว.ดย.มทบ.310', 3, 'MTB_310', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_32', 'หมวดดุริยางค์ มณฑลทหารบกที่ 32 (มว.ดย.มทบ.32)', 'มว.ดย.มทบ.32', 'มว.ดย.มทบ.32', 3, 'MTB_32', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_33', 'หมวดดุริยางค์ มณฑลทหารบกที่ 33 (มว.ดย.มทบ.33)', 'มว.ดย.มทบ.33', 'มว.ดย.มทบ.33', 3, 'MTB_33', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_34', 'หมวดดุริยางค์ มณฑลทหารบกที่ 34 (มว.ดย.มทบ.34)', 'มว.ดย.มทบ.34', 'มว.ดย.มทบ.34', 3, 'MTB_34', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_35', 'หมวดดุริยางค์ มณฑลทหารบกที่ 35 (มว.ดย.มทบ.35)', 'มว.ดย.มทบ.35', 'มว.ดย.มทบ.35', 3, 'MTB_35', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_36', 'หมวดดุริยางค์ มณฑลทหารบกที่ 36 (มว.ดย.มทบ.36)', 'มว.ดย.มทบ.36', 'มว.ดย.มทบ.36', 3, 'MTB_36', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_37', 'หมวดดุริยางค์ มณฑลทหารบกที่ 37 (มว.ดย.มทบ.37)', 'มว.ดย.มทบ.37', 'มว.ดย.มทบ.37', 3, 'MTB_37', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_38', 'หมวดดุริยางค์ มณฑลทหารบกที่ 38 (มว.ดย.มทบ.38)', 'มว.ดย.มทบ.38', 'มว.ดย.มทบ.38', 3, 'MTB_38', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_39', 'หมวดดุริยางค์ มณฑลทหารบกที่ 39 (มว.ดย.มทบ.39)', 'มว.ดย.มทบ.39', 'มว.ดย.มทบ.39', 3, 'MTB_39', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_41', 'หมวดดุริยางค์ มณฑลทหารบกที่ 41 (มว.ดย.มทบ.41)', 'มว.ดย.มทบ.41', 'มว.ดย.มทบ.41', 3, 'MTB_41', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_42', 'หมวดดุริยางค์ มณฑลทหารบกที่ 42 (มว.ดย.มทบ.42)', 'มว.ดย.มทบ.42', 'มว.ดย.มทบ.42', 3, 'MTB_42', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_43', 'หมวดดุริยางค์ มณฑลทหารบกที่ 43 (มว.ดย.มทบ.43)', 'มว.ดย.มทบ.43', 'มว.ดย.มทบ.43', 3, 'MTB_43', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_44', 'หมวดดุริยางค์ มณฑลทหารบกที่ 44 (มว.ดย.มทบ.44)', 'มว.ดย.มทบ.44', 'มว.ดย.มทบ.44', 3, 'MTB_44', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_45', 'หมวดดุริยางค์ มณฑลทหารบกที่ 45 (มว.ดย.มทบ.45)', 'มว.ดย.มทบ.45', 'มว.ดย.มทบ.45', 3, 'MTB_45', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_BAND_MTB_46', 'หมวดดุริยางค์ มณฑลทหารบกที่ 46 (มว.ดย.มทบ.46)', 'มว.ดย.มทบ.46', 'มว.ดย.มทบ.46', 3, 'MTB_46', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_FEMALE_RANGER_11', 'หมวดทหารพรานหญิงที่ 11 (มว.ทพ.หญิง 11)', 'มว.ทพ.หญิง 11', 'มว.ทพ.หญิง 11', 3, 'RANGER_REG_11', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_FEMALE_RANGER_12', 'หมวดทหารพรานหญิงที่ 12 (มว.ทพ.หญิง 12)', 'มว.ทพ.หญิง 12', 'มว.ทพ.หญิง 12', 3, 'RANGER_REG_12', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_FEMALE_RANGER_21', 'หมวดทหารพรานหญิงที่ 21 (มว.ทพ.หญิง 21)', 'มว.ทพ.หญิง 21', 'มว.ทพ.หญิง 21', 3, 'RANGER_REG_21', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_FEMALE_RANGER_22', 'หมวดทหารพรานหญิงที่ 22 (มว.ทพ.หญิง 22)', 'มว.ทพ.หญิง 22', 'มว.ทพ.หญิง 22', 3, 'RANGER_REG_22', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_FEMALE_RANGER_31', 'หมวดทหารพรานหญิงที่ 31 (มว.ทพ.หญิง 31)', 'มว.ทพ.หญิง 31', 'มว.ทพ.หญิง 31', 3, 'RANGER_REG_31', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_FEMALE_RANGER_32', 'หมวดทหารพรานหญิงที่ 32 (มว.ทพ.หญิง 32)', 'มว.ทพ.หญิง 32', 'มว.ทพ.หญิง 32', 3, 'RANGER_REG_32', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_FEMALE_RANGER_41', 'หมวดทหารพรานหญิงที่ 41 (มว.ทพ.หญิง 41)', 'มว.ทพ.หญิง 41', 'มว.ทพ.หญิง 41', 3, 'RANGERS_REG_41', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_FEMALE_RANGER_42', 'หมวดทหารพรานหญิงที่ 42 (มว.ทพ.หญิง 42)', 'มว.ทพ.หญิง 42', 'มว.ทพ.หญิง 42', 3, 'RANGERS_REG_42', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_FEMALE_RANGER_43', 'หมวดทหารพรานหญิงที่ 43 (มว.ทพ.หญิง 43)', 'มว.ทพ.หญิง 43', 'มว.ทพ.หญิง 43', 3, 'RANGERS_REG_43', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_FEMALE_RANGER_44', 'หมวดทหารพรานหญิงที่ 44 (มว.ทพ.หญิง 44)', 'มว.ทพ.หญิง 44', 'มว.ทพ.หญิง 44', 3, 'RANGER_REG_44', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_FEMALE_RANGER_45', 'หมวดทหารพรานหญิงที่ 45 (มว.ทพ.หญิง 45)', 'มว.ทพ.หญิง 45', 'มว.ทพ.หญิง 45', 3, 'RANGERS_REG_45', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('PLT_FEMALE_RANGER_46', 'หมวดทหารพรานหญิงที่ 46 (มว.ทพ.หญิง 46)', 'มว.ทพ.หญิง 46', 'มว.ทพ.หญิง 46', 3, 'RANGER_REG_46', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R111_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 111 (ร.111 พัน.1)', 'ร.111 พัน.1', 'ร.111 พัน.1', 3, 'R111_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R111_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 111 (ร.111 พัน.2)', 'ร.111 พัน.2', 'ร.111 พัน.2', 3, 'R111_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R111_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 111 (ร.111 พัน.3)', 'ร.111 พัน.3', 'ร.111 พัน.3', 3, 'R111_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R111_REG', 'กรมทหารราบที่ 111 (ร.111)', 'ร.111', 'ร.111', 3, '11th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R112_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 112 (ร.112 พัน.1)', 'ร.112 พัน.1', 'ร.112 พัน.1', 3, 'R112_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R112_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 112 (ร.112 พัน.2)', 'ร.112 พัน.2', 'ร.112 พัน.2', 3, 'R112_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R112_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 112 (ร.112 พัน.3)', 'ร.112 พัน.3', 'ร.112 พัน.3', 3, 'R112_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R112_REG', 'กรมทหารราบที่ 112 (ร.112)', 'ร.112', 'ร.112', 3, '11th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R12_BN1_INF_KG', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 12 รักษาพระองค์ (ร.12 พัน.1 รอ.)', 'ร.12 พัน.1 รอ.', 'ร.12 พัน.1 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R12_BN2_INF_KG', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 12 รักษาพระองค์ (ร.12 พัน.2 รอ.)', 'ร.12 พัน.2 รอ.', 'ร.12 พัน.2 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R12_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 12 รักษาพระองค์ (ร.12 พัน.3 รอ.)', 'ร.12 พัน.3 รอ.', 'ร.12 พัน.3 รอ.', 3, 'R12_REG_KG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R12_REG_KG', 'กรมทหารราบที่ 12 รักษาพระองค์ (ร.12 รอ.)', 'ร.12 รอ.', 'ร.12 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R13_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 13 (ร.13 พัน.1)', 'ร.13 พัน.1', 'ร.13 พัน.1', 3, 'R13_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R13_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 13 (ร.13 พัน.2)', 'ร.13 พัน.2', 'ร.13 พัน.2', 3, 'R13_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R13_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 13 (ร.13 พัน.3)', 'ร.13 พัน.3', 'ร.13 พัน.3', 3, 'R13_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R13_REG', 'กรมทหารราบที่ 13 (ร.13)', 'ร.13', 'ร.13', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R14_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 14 (ร.14 พัน.1)', 'ร.14 พัน.1', 'ร.14 พัน.1', 3, 'R14_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R14_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 14 (ร.14 พัน.2)', 'ร.14 พัน.2', 'ร.14 พัน.2', 3, 'R14_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R14_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 14 (ร.14 พัน.3)', 'ร.14 พัน.3', 'ร.14 พัน.3', 3, 'R14_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R14_REG', 'กรมทหารราบที่ 14 (ร.14)', 'ร.14', 'ร.14', 3, '4th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R151_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 151 (ร.151 พัน.1)', 'ร.151 พัน.1', 'ร.151 พัน.1', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R151_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 151 (ร.151 พัน.2)', 'ร.151 พัน.2', 'ร.151 พัน.2', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R151_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 151 (ร.151 พัน.3)', 'ร.151 พัน.3', 'ร.151 พัน.3', 3, 'R151_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R151_REG', 'กรมทหารราบที่ 151 (ร.151)', 'ร.151', 'ร.151', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R152_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 152 (ร.152 พัน.1)', 'ร.152 พัน.1', 'ร.152 พัน.1', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R152_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 152 (ร.152 พัน.2)', 'ร.152 พัน.2', 'ร.152 พัน.2', 3, 'R152_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R152_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 152 (ร.152 พัน.3)', 'ร.152 พัน.3', 'ร.152 พัน.3', 3, 'R152_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R152_REG', 'กรมทหารราบที่ 152 (ร.152)', 'ร.152', 'ร.152', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R153_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 153 (ร.153 พัน.1)', 'ร.153 พัน.1', 'ร.153 พัน.1', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R153_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 153 (ร.153 พัน.2)', 'ร.153 พัน.2', 'ร.153 พัน.2', 3, 'R153_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R153_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 153 (ร.153 พัน.3)', 'ร.153 พัน.3', 'ร.153 พัน.3', 3, 'R153_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R153_REG', 'กรมทหารราบที่ 153 (ร.153)', 'ร.153', 'ร.153', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R15_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 15 (ร.15 พัน.1)', 'ร.15 พัน.1', 'ร.15 พัน.1', 3, 'R15_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R15_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 15 (ร.15 พัน.2)', 'ร.15 พัน.2', 'ร.15 พัน.2', 3, 'R15_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R15_BN4', 'กองพันทหารราบที่ 4 กรมทหารราบที่ 15 (ร.15 พัน.4)', 'ร.15 พัน.4', 'ร.15 พัน.4', 3, 'R15_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R15_REG', 'กรมทหารราบที่ 15 (ร.15)', 'ร.15', 'ร.15', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R16_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 16 (ร.16 พัน.1)', 'ร.16 พัน.1', 'ร.16 พัน.1', 3, 'R16_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R16_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 16 (ร.16 พัน.2)', 'ร.16 พัน.2', 'ร.16 พัน.2', 3, 'R16_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R16_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 16 (ร.16 พัน.3)', 'ร.16 พัน.3', 'ร.16 พัน.3', 3, 'R16_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R16_REG', 'กรมทหารราบที่ 16 (ร.16)', 'ร.16', 'ร.16', 3, '6th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R17_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 17 (ร.17 พัน.2)', 'ร.17 พัน.2', 'ร.17 พัน.2', 3, 'R17_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R17_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 17 (ร.17 พัน.3)', 'ร.17 พัน.3', 'ร.17 พัน.3', 3, 'R17_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R17_BN4', 'กองพันทหารราบที่ 4 กรมทหารราบที่ 17 (ร.17 พัน.4)', 'ร.17 พัน.4', 'ร.17 พัน.4', 3, 'R17_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R17_REG', 'กรมทหารราบที่ 17 (ร.17)', 'ร.17', 'ร.17', 3, '7th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R19_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 19 (ร.19 พัน.1)', 'ร.19 พัน.1', 'ร.19 พัน.1', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R19_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 19 (ร.19 พัน.2)', 'ร.19 พัน.2', 'ร.19 พัน.2', 3, 'R19_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R19_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 19 (ร.19 พัน.3)', 'ร.19 พัน.3', 'ร.19 พัน.3', 3, 'R19_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R19_REG', 'กรมทหารราบที่ 19 (ร.19)', 'ร.19', 'ร.19', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R21_BN1_INF_KG', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 21 รักษาพระองค์ (ร.21 พัน.1 รอ.)', 'ร.21 พัน.1 รอ.', 'ร.21 พัน.1 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R21_BN2_INF_KG', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 21 รักษาพระองค์ (ร.21 พัน.2 รอ.)', 'ร.21 พัน.2 รอ.', 'ร.21 พัน.2 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R21_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 21 รักษาพระองค์ (ร.21 พัน.3 รอ.)', 'ร.21 พัน.3 รอ.', 'ร.21 พัน.3 รอ.', 3, 'R21_REG_KG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R21_REG_KG', 'กรมทหารราบที่ 21 รักษาพระองค์ (ร.21 รอ. ทหารเสือราชินี)', 'ร.21 รอ.', 'ร.21 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R23_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 23 (ร.23 พัน.1)', 'ร.23 พัน.1', 'ร.23 พัน.1', 3, 'R23_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R23_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 23 (ร.23 พัน.3)', 'ร.23 พัน.3', 'ร.23 พัน.3', 3, 'R23_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R23_BN4', 'กองพันทหารราบที่ 4 กรมทหารราบที่ 23 (ร.23 พัน.4)', 'ร.23 พัน.4', 'ร.23 พัน.4', 3, 'R23_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R23_REG', 'กรมทหารราบที่ 23 (ร.23)', 'ร.23', 'ร.23', 3, '6th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R25_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 25 (ร.25 พัน.1)', 'ร.25 พัน.1', 'ร.25 พัน.1', 3, 'R25_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R25_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 25 (ร.25 พัน.2)', 'ร.25 พัน.2', 'ร.25 พัน.2', 3, 'R25_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R25_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 25 (ร.25 พัน.3)', 'ร.25 พัน.3', 'ร.25 พัน.3', 3, 'R25_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R25_REG', 'กรมทหารราบที่ 25 (ร.25)', 'ร.25', 'ร.25', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R29_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 29 (ร.29 พัน.1)', 'ร.29 พัน.1', 'ร.29 พัน.1', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R29_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 29 (ร.29 พัน.2)', 'ร.29 พัน.2', 'ร.29 พัน.2', 3, 'R29_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R29_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 29 (ร.29 พัน.3)', 'ร.29 พัน.3', 'ร.29 พัน.3', 3, 'R29_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R29_REG', 'กรมทหารราบที่ 29 (ร.29)', 'ร.29', 'ร.29', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R2_BN1_INF_KG', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 2 รักษาพระองค์ (ร.2 พัน.1 รอ.)', 'ร.2 พัน.1 รอ.', 'ร.2 พัน.1 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R2_BN2_INF_KG', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 2 รักษาพระองค์ (ร.2 พัน.2 รอ.)', 'ร.2 พัน.2 รอ.', 'ร.2 พัน.2 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R2_BN3_INF_KG', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 2 รักษาพระองค์ (ร.2 พัน.3 รอ.)', 'ร.2 พัน.3 รอ.', 'ร.2 พัน.3 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R2_REG_KG', 'กรมทหารราบที่ 2 รักษาพระองค์ (ร.2 รอ.)', 'ร.2 รอ.', 'ร.2 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R31_BN1_KG', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 31 รักษาพระองค์ (ร.31 พัน.1 รอ.)', 'ร.31 พัน.1 รอ.', 'ร.31 พัน.1 รอ.', 3, '1st_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R31_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 31 รักษาพระองค์ (ร.31 พัน.2 รอ.)', 'ร.31 พัน.2 รอ.', 'ร.31 พัน.2 รอ.', 3, 'R31_REG_KG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R31_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 31 รักษาพระองค์ (ร.31 พัน.3 รอ.)', 'ร.31 พัน.3 รอ.', 'ร.31 พัน.3 รอ.', 3, 'R31_REG_KG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R31_REG_KG', 'กรมทหารราบที่ 31 รักษาพระองค์ (ร.31 รอ. กองพลร่ม)', 'ร.31 รอ.', 'ร.31 รอ.', 3, '1st_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R3_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 3 (ร.3 พัน.1)', 'ร.3 พัน.1', 'ร.3 พัน.1', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R3_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 3 (ร.3 พัน.2)', 'ร.3 พัน.2', 'ร.3 พัน.2', 3, 'R3_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R3_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 3 (ร.3 พัน.3)', 'ร.3 พัน.3', 'ร.3 พัน.3', 3, 'R3_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R3_REG', 'กรมทหารราบที่ 3 (ร.3)', 'ร.3', 'ร.3', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R4_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 4 (ร.4 พัน.1)', 'ร.4 พัน.1', 'ร.4 พัน.1', 3, '4th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R4_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 4 (ร.4 พัน.2)', 'ร.4 พัน.2', 'ร.4 พัน.2', 3, 'R4_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R4_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 4 (ร.4 พัน.3)', 'ร.4 พัน.3', 'ร.4 พัน.3', 3, 'R4_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R4_REG', 'กรมทหารราบที่ 4 (ร.4)', 'ร.4', 'ร.4', 3, '4th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R5_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 5 (ร.5 พัน.1)', 'ร.5 พัน.1', 'ร.5 พัน.1', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R5_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 5 (ร.5 พัน.2)', 'ร.5 พัน.2', 'ร.5 พัน.2', 3, 'R5_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R5_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 5 (ร.5 พัน.3)', 'ร.5 พัน.3', 'ร.5 พัน.3', 3, 'R5_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R5_REG', 'กรมทหารราบที่ 5 (ร.5)', 'ร.5', 'ร.5', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R6_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 6 (ร.6 พัน.1)', 'ร.6 พัน.1', 'ร.6 พัน.1', 3, 'R6_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R6_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 6 (ร.6 พัน.2)', 'ร.6 พัน.2', 'ร.6 พัน.2', 3, 'R6_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R6_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 6 (ร.6 พัน.3)', 'ร.6 พัน.3', 'ร.6 พัน.3', 3, 'R6_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R6_REG', 'กรมทหารราบที่ 6 (ร.6)', 'ร.6', 'ร.6', 3, '6th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R7_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 7 (ร.7 พัน.1)', 'ร.7 พัน.1', 'ร.7 พัน.1', 3, 'R7_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R7_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 7 (ร.7 พัน.2)', 'ร.7 พัน.2', 'ร.7 พัน.2', 3, 'R7_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R7_BN5', 'กองพันทหารราบที่ 5 กรมทหารราบที่ 7 (ร.7 พัน.5)', 'ร.7 พัน.5', 'ร.7 พัน.5', 3, 'R7_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R7_REG', 'กรมทหารราบที่ 7 (ร.7)', 'ร.7', 'ร.7', 3, '7th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R8_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 8 (ร.8 พัน.1)', 'ร.8 พัน.1', 'ร.8 พัน.1', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R8_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 8 (ร.8 พัน.2)', 'ร.8 พัน.2', 'ร.8 พัน.2', 3, 'R8_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R8_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 8 (ร.8 พัน.3)', 'ร.8 พัน.3', 'ร.8 พัน.3', 3, 'R8_REG', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R8_REG', 'กรมทหารราบที่ 8 (ร.8)', 'ร.8', 'ร.8', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R9_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 9 (ร.9 พัน.1)', 'ร.9 พัน.1', 'ร.9 พัน.1', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R9_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 9 (ร.9 พัน.2)', 'ร.9 พัน.2', 'ร.9 พัน.2', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R9_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 9 (ร.9 พัน.3)', 'ร.9 พัน.3', 'ร.9 พัน.3', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R9_REG', 'กรมทหารราบที่ 9 (ร.9)', 'ร.9', 'ร.9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_11', 'กรมทหารพรานที่ 11 (กรม ทพ.11)', 'กรม ทพ.11', 'กรม ทพ.11', 3, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_12', 'กรมทหารพรานที่ 12 (กรม ทพ.12)', 'กรม ทพ.12', 'กรม ทพ.12', 3, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_13', 'กรมทหารพรานที่ 13 (กรม ทพ.13)', 'กรม ทพ.13', 'กรม ทพ.13', 3, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_14', 'กรมทหารพรานที่ 14 (กรม ทพ.14)', 'กรม ทพ.14', 'กรม ทพ.14', 3, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_21', 'กรมทหารพรานที่ 21 (กรม ทพ.21)', 'กรม ทพ.21', 'กรม ทพ.21', 3, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_22', 'กรมทหารพรานที่ 22 (กรม ทพ.22)', 'กรม ทพ.22', 'กรม ทพ.22', 3, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_23', 'กรมทหารพรานที่ 23 (กรม ทพ.23)', 'กรม ทพ.23', 'กรม ทพ.23', 3, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_26', 'กรมทหารพรานที่ 26 (กรม ทพ.26)', 'กรม ทพ.26', 'กรม ทพ.26', 3, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_31', 'กรมทหารพรานที่ 31 (กรม ทพ.31)', 'กรม ทพ.31', 'กรม ทพ.31', 3, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_32', 'กรมทหารพรานที่ 32 (กรม ทพ.32)', 'กรม ทพ.32', 'กรม ทพ.32', 3, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_33', 'กรมทหารพรานที่ 33 (กรม ทพ.33)', 'กรม ทพ.33', 'กรม ทพ.33', 3, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_35', 'กรมทหารพรานที่ 35 (กรม ทพ.35)', 'กรม ทพ.35', 'กรม ทพ.35', 3, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_36', 'กรมทหารพรานที่ 36 (กรม ทพ.36)', 'กรม ทพ.36', 'กรม ทพ.36', 3, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_44', 'กรมทหารพรานที่ 44 (กรม ทพ.44)', 'กรม ทพ.44', 'กรม ทพ.44', 3, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_46', 'กรมทหารพรานที่ 46 (กรม ทพ.46)', 'กรม ทพ.46', 'กรม ทพ.46', 3, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_48', 'กรมทหารพรานที่ 48 (กรม ทพ.48)', 'กรม ทพ.48', 'กรม ทพ.48', 3, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGER_REG_49', 'กรมทหารพรานที่ 49 (กรม ทพ.49)', 'กรม ทพ.49', 'กรม ทพ.49', 3, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGERS_REG_41', 'กรมทหารพรานที่ 41 (ทภ.4)', 'กรม ทพ.41', 'กรม ทพ.41', 3, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGERS_REG_42', 'กรมทหารพรานที่ 42 (ทภ.4)', 'กรม ทพ.42', 'กรม ทพ.42', 3, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGERS_REG_43', 'กรมทหารพรานที่ 43 (ทภ.4)', 'กรม ทพ.43', 'กรม ทพ.43', 3, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGERS_REG_45', 'กรมทหารพรานที่ 45 (ทภ.4)', 'กรม ทพ.45', 'กรม ทพ.45', 3, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('RANGERS_REG_47', 'กรมทหารพรานที่ 47 (ทภ.4)', 'กรม ทพ.47', 'กรม ทพ.47', 3, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_CENTER', 'ศูนย์สงครามพิเศษ (ศสพ.)', 'ศสพ.', 'ศสพ.', 3, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_1', 'กรมรบพิเศษที่ 1 (รพศ.1 ป่าหวาย)', 'รพศ.1', 'รพศ.1', 3, '1st_SF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_1_BN_1', 'กองพันรบพิเศษที่ 1 กรมรบพิเศษที่ 1 (รพศ.1 พัน.1)', 'รพศ.1 พัน.1', 'รพศ.1 พัน.1', 3, 'SF_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_1_BN_2', 'กองพันรบพิเศษที่ 2 กรมรบพิเศษที่ 1 (รพศ.1 พัน.2)', 'รพศ.1 พัน.2', 'รพศ.1 พัน.2', 3, 'SF_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_2', 'กรมรบพิเศษที่ 2 (รพศ.2)', 'รพศ.2', 'รพศ.2', 3, '1st_SF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_2_BN_1', 'กองพันรบพิเศษที่ 1 กรมรบพิเศษที่ 2 (รพศ.2 พัน.1)', 'รพศ.2 พัน.1', 'รพศ.2 พัน.1', 3, 'SF_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_2_BN_2', 'กองพันรบพิเศษที่ 2 กรมรบพิเศษที่ 2 (รพศ.2 พัน.2)', 'รพศ.2 พัน.2', 'รพศ.2 พัน.2', 3, 'SF_REG_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_3', 'กรมรบพิเศษที่ 3 (รพศ.3)', 'รพศ.3', 'รพศ.3', 3, '1st_SF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_4', 'กรมรบพิเศษที่ 4 (รพศ.4)', 'รพศ.4', 'รพศ.4', 3, '1st_SF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_4_BN_1', 'กองพันรบพิเศษที่ 1 กรมรบพิเศษที่ 4 (รพศ.4 พัน.1)', 'รพศ.4 พัน.1', 'รพศ.4 พัน.1', 3, 'SF_REG_4', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_4_BN_2', 'กองพันรบพิเศษที่ 2 กรมรบพิเศษที่ 4 (รพศ.4 พัน.2)', 'รพศ.4 พัน.2', 'รพศ.4 พัน.2', 3, 'SF_REG_4', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_5', 'กรมรบพิเศษที่ 5 (รพศ.5)', 'รพศ.5', 'รพศ.5', 3, '1st_SF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_5_BN_1', 'กองพันรบพิเศษที่ 1 กรมรบพิเศษที่ 5 (รพศ.5 พัน.1)', 'รพศ.5 พัน.1', 'รพศ.5 พัน.1', 3, 'SF_REG_5', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_5_BN_2', 'กองพันรบพิเศษที่ 2 กรมรบพิเศษที่ 5 (รพศ.5 พัน.2)', 'รพศ.5 พัน.2', 'รพศ.5 พัน.2', 3, 'SF_REG_5', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_1', 'กองพันทหารสื่อสารที่ 1 (ส.พัน.1)', 'ส.พัน.1', 'ส.พัน.1', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_11__CAV_DIV1', 'กองพันทหารสื่อสารที่ 11 พล.ม.1 (ส.พัน.11 พล.ม.1)', 'ส.พัน.11 พล.ม.1', 'ส.พัน.11 พล.ม.1', 3, '1st_CAV_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_12', 'กองพันทหารสื่อสารที่ 12 (ส.พัน.12)', 'ส.พัน.12', 'ส.พัน.12', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_13__AAD_DIV', 'กองพันทหารสื่อสารที่ 13 พล.ปตอ. (ส.พัน.13 พล.ปตอ.)', 'ส.พัน.13 พล.ปตอ.', 'ส.พัน.13 พล.ปตอ.', 3, 'AAD_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_15__INF_DIV15', 'กองพันทหารสื่อสารที่ 15 พล.ร.15 (ส.พัน.15 พล.ร.15)', 'ส.พัน.15 พล.ร.15', 'ส.พัน.15 พล.ร.15', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_2', 'กองพันทหารสื่อสารที่ 2 (ส.พัน.2)', 'ส.พัน.2', 'ส.พัน.2', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_21__ARMY1', 'กองพันทหารสื่อสารที่ 21 ทภ.1 (ส.พัน.21 ทภ.1)', 'ส.พัน.21 ทภ.1', 'ส.พัน.21 ทภ.1', 3, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_22__ARMY2', 'กองพันทหารสื่อสารที่ 22 ทภ.2 (ส.พัน.22 ทภ.2)', 'ส.พัน.22 ทภ.2', 'ส.พัน.22 ทภ.2', 3, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_23__ARMY3', 'กองพันทหารสื่อสารที่ 23 ทภ.3 (ส.พัน.23 ทภ.3)', 'ส.พัน.23 ทภ.3', 'ส.พัน.23 ทภ.3', 3, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_24__ARMY4', 'กองพันทหารสื่อสารที่ 24 ทภ.4 (ส.พัน.24 ทภ.4)', 'ส.พัน.24 ทภ.4', 'ส.พัน.24 ทภ.4', 3, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_35__', 'กองพันทหารสื่อสารที่ 35 นสศ. (ส.พัน.35 นสศ.)', 'ส.พัน.35 นสศ.', 'ส.พัน.35 นสศ.', 3, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_3__INF_DIV3', 'กองพันทหารสื่อสารที่ 3 พล.ร.3 (ส.พัน.3 พล.ร.3)', 'ส.พัน.3 พล.ร.3', 'ส.พัน.3 พล.ร.3', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_4__INF_DIV4', 'กองพันทหารสื่อสารที่ 4 พล.ร.4 (ส.พัน.4 พล.ร.4)', 'ส.พัน.4 พล.ร.4', 'ส.พัน.4 พล.ร.4', 3, '4th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_5__INF_DIV5', 'กองพันทหารสื่อสารที่ 5 พล.ร.5 (ส.พัน.5 พล.ร.5)', 'ส.พัน.5 พล.ร.5', 'ส.พัน.5 พล.ร.5', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_6__INF_DIV6', 'กองพันทหารสื่อสารที่ 6 พล.ร.6 (ส.พัน.6 พล.ร.6)', 'ส.พัน.6 พล.ร.6', 'ส.พัน.6 พล.ร.6', 3, '6th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_BN_9__INF_DIV9', 'กองพันทหารสื่อสารที่ 9 พล.ร.9 (ส.พัน.9 พล.ร.9)', 'ส.พัน.9 พล.ร.9', 'ส.พัน.9 พล.ร.9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_REG_1', 'กรมทหารสื่อสารที่ 1 (ส.1)', 'ส.1', 'ส.1', 3, 'DEPT_SIG_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_REG_1_BN_101', 'กองพันทหารสื่อสารที่ 101 กรมทหารสื่อสารที่ 1 (ส.1 พัน.101)', 'ส.1 พัน.101', 'ส.1 พัน.101', 3, 'SIG_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SIG_REG_1_BN_102', 'กองพันทหารสื่อสารที่ 102 กรมทหารสื่อสารที่ 1 (ส.1 พัน.102)', 'ส.1 พัน.102', 'ส.1 พัน.102', 3, 'SIG_REG_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_', 'กรมการบินทหารบก (กรม บ.)', 'กรม บ.', 'กรม บ.', 3, 'AVN_CTR_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT__733', 'ศูนย์ฝึกยุทธวิธี กองทัพบก (ศฝยว.ทบ.)', 'ศฝยว.ทบ.', 'ศฝยว.ทบ.', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_AAD_CTR', 'ศูนย์ต่อสู้ป้องกันภัยทางอากาศกองทัพบก . (ศปภอ.ทบ.)', 'ศปภอ.ทบ.', 'ศปภอ.ทบ.', 3, 'AADC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_AAD_CTR_1', 'ศูนย์ต่อสู้ป้องกันภัยทางอากาศกองทัพบก .1 (ศปภอ.ทบ.1)', 'ศปภอ.ทบ.1', 'ศปภอ.ทบ.1', 3, 'AADC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_AAD_CTR_2', 'ศูนย์ต่อสู้ป้องกันภัยทางอากาศกองทัพบก .2 (ศปภอ.ทบ.2)', 'ศปภอ.ทบ.2', 'ศปภอ.ทบ.2', 3, 'AADC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_AAD_CTR_3', 'ศูนย์ต่อสู้ป้องกันภัยทางอากาศกองทัพบก .3 (ศปภอ.ทบ.3)', 'ศปภอ.ทบ.3', 'ศปภอ.ทบ.3', 3, 'AADC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_AAD_CTR_4', 'ศูนย์ต่อสู้ป้องกันภัยทางอากาศกองทัพบก .4 (ศปภอ.ทบ.4)', 'ศปภอ.ทบ.4', 'ศปภอ.ทบ.4', 3, 'AADC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_CRMA_ACAD_R_R', 'ส่วนการศึกษา โรงเรียนนายร้อยพระจุลจอมเกล้า (สกศ.รร.จปร.)', 'สกศ.รร.จปร.', 'สกศ.รร.จปร.', 3, 'CRMA_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_DEPT_OPS', 'กรมยุทธการทหารบก (ยก.ทบ.)', 'ยก.ทบ.', 'ยก.ทบ.', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_DEV_REG_1', 'กรมพัฒนาที่ 1 (กรมพัฒนา 1)', 'กรมพัฒนา 1', 'กรมพัฒนา 1', 3, 'DEV_DIV_1', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_DEV_REG_2', 'กรมพัฒนาที่ 2 (กรมพัฒนา 2)', 'กรมพัฒนา 2', 'กรมพัฒนา 2', 3, 'DEV_DIV_2', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_DEV_REG_4', 'กรมพัฒนาที่ 4 (กรมพัฒนา 4)', 'กรมพัฒนา 4', 'กรมพัฒนา 4', 3, 'DEV_DIV_4', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_ED_CTR', 'ศูนย์การศึกษาทางทหาร (ศศท.)', 'ศศท.', 'ศศท.', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_HQ_SPT_BN', 'กองพันทหารสารบรรณสนับสนุน บก.ทบ. (สสน.บก.ทบ.)', 'สสน.บก.ทบ.', 'สสน.บก.ทบ.', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_INF_DIV15', 'หน่วยข่าวกรองทางทหาร กองพลทหารราบที่ 15 (หน่วย ขกท.พล.ร.15)', 'หน่วย ขกท.พล.ร.15', 'หน่วย ขกท.พล.ร.15', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_LOG_CTRLOG1', 'ศูนย์ควบคุมการส่งกำลังบำรุง กองบัญชาการช่วยรบ 1 (ศคบ.บชร.1)', 'ศคบ.บชร.1', 'ศคบ.บชร.1', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_LOG_CTRLOG2', 'ศูนย์ควบคุมการส่งกำลังบำรุง กองบัญชาการช่วยรบ 2 (ศคบ.บชร.2)', 'ศคบ.บชร.2', 'ศคบ.บชร.2', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_LOG_CTRLOG3', 'ศูนย์ควบคุมการส่งกำลังบำรุง กองบัญชาการช่วยรบ 3 (ศคบ.บชร.3)', 'ศคบ.บชร.3', 'ศคบ.บชร.3', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_LOG_CTRLOG4', 'ศูนย์ควบคุมการส่งกำลังบำรุง กองบัญชาการช่วยรบ 4 (ศคบ.บชร.4)', 'ศคบ.บชร.4', 'ศคบ.บชร.4', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_M', 'ศูนย์การทหารม้า (ศม.)', 'ศม.', 'ศม.', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_MAINT_CTR', 'ศูนย์ซ่อมบำรุงยุทธโธปกรณ์สายสรรพาวุธ กองทัพบก (ศซบ.ทบ.)', 'ศซบ.ทบ.', 'ศซบ.ทบ.', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_MAT_CTR', 'ศูนย์ควบคุมยุทธภัณฑ์ กองทัพบก (ศคย.ทบ.)', 'ศคย.ทบ.', 'ศคย.ทบ.', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_MED_RND', 'สถาบันวิจัยวิทยาศาสตร์การแพทย์ทหาร (สวพท.)', 'สวพท.', 'สวพท.', 3, 'DEPT_MED_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_ORD', 'ศูนย์อำนวยการสร้างอาวุธ กรมสรรพาวุธทหารบก (ศอ.สพ.ทบ.)', 'ศอ.สพ.ทบ.', 'ศอ.สพ.ทบ.', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_P', 'ศูนย์การทหารปืนใหญ่ (ศป.)', 'ศป.', 'ศป.', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_QM', 'สำนักส่งกำลังพลาธิการ กรมพลาธิการทหารบก (สพธ.)', 'สพธ.', 'สพธ.', 3, 'QM_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_R', 'ศูนย์การทหารราบ (ศร.)', 'ศร.', 'ศร.', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_R_742', 'ศูนย์การกำลังสำรอง (ศสร.)', 'ศสร.', 'ศสร.', 3, 'TD_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_RBN1', 'กองพันศูนย์การทหารราบที่ 1 (ศร.พัน.1)', 'ศร.พัน.1', 'ศร.พัน.1', 3, 'UNIT_R', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_RBN2', 'กองพันศูนย์การทหารราบที่ 2 (ศร.พัน.2)', 'ศร.พัน.2', 'ศร.พัน.2', 3, 'UNIT_R', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_R_R', 'ส่วนวิชาทหาร โรงเรียนนายร้อยพระจุลจอมเกล้า (สวท.รร.จปร.)', 'สวท.รร.จปร.', 'สวท.รร.จปร.', 3, 'CRMA_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_RRO_R_R', 'กรมนักเรียนนายร้อยรักษาพระองค์ โรงเรียนนายร้อยพระจุลจอมเกล้า (กรม นนร.รอ.รร.จปร.)', 'กรม นนร.รอ.รร.จปร.', 'กรม นนร.รอ.รร.จปร.', 3, 'CRMA_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_R_R_R', 'ส่วนสนับสนุนและบริการ โรงเรียนนายร้อยพระจุลจอมเกล้า (สบร.รร.จปร.)', 'สบร.รร.จปร.', 'สบร.รร.จปร.', 3, 'CRMA_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_SIG', 'กรมการขนส่งทหารบก (กรม ขส.)', 'กรม ขส.', 'กรม ขส.', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_SIGORD', 'ศูนย์ซ่อมสร้างสิ่งอุปกรณ์สายสรรพาวุธ กรมสรรพาวุธทหารบก (ศซส.สพ.ทบ.)', 'ศซส.สพ.ทบ.', 'ศซส.สพ.ทบ.', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_SIG_SIG', 'ศูนย์เทคโนโลยีสารสนเทศ กรมการสื่อสารทหารบก (ศทส.สส.)', 'ศทส.สส.', 'ศทส.สส.', 3, 'TRADOC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_SPT_REGINF_DIV11', 'กรมสนับสนุน กองพลทหารราบที่ 11 (กรม สน.พล.ร.11)', 'กรม สน.พล.ร.11', 'กรม สน.พล.ร.11', 3, '11th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_SPT_REGINF_DIV15', 'กรมสนับสนุน กองพลทหารราบที่ 15 (กรม สน.พล.ร.15)', 'กรม สน.พล.ร.15', 'กรม สน.พล.ร.15', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_SPT_REGINF_DIV9', 'กรมสนับสนุน กองพลทหารราบที่ 9 (กรม สน.พล.ร.9)', 'กรม สน.พล.ร.9', 'กรม สน.พล.ร.9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_SPT_REGINF_DIV9_844', 'สำนักงานฝ่ายส่งกำลัง กรม สน.พล.ร.9 (สง.สล.กรม สน.พล.ร.9)', 'สง.สล.กรม สน.พล.ร.9', 'สง.สล.กรม สน.พล.ร.9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_15', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 15 (นฝ.นศท.มทบ.15)', 'นฝ.นศท.มทบ.15', 'นฝ.นศท.มทบ.15', 3, 'MTB_15', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_16', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 16 (นฝ.นศท.มทบ.16)', 'นฝ.นศท.มทบ.16', 'นฝ.นศท.มทบ.16', 3, 'MTB_16', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_17', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 17 (นฝ.นศท.มทบ.17)', 'นฝ.นศท.มทบ.17', 'นฝ.นศท.มทบ.17', 3, 'MTB_17', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_18', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 18 (นฝ.นศท.มทบ.18)', 'นฝ.นศท.มทบ.18', 'นฝ.นศท.มทบ.18', 3, 'MTB_18', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_19', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 19 (นฝ.นศท.มทบ.19)', 'นฝ.นศท.มทบ.19', 'นฝ.นศท.มทบ.19', 3, 'MTB_19', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_210', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 210 (นฝ.นศท.มทบ.210)', 'นฝ.นศท.มทบ.210', 'นฝ.นศท.มทบ.210', 3, 'MTB_210', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_25', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 25 (นฝ.นศท.มทบ.25)', 'นฝ.นศท.มทบ.25', 'นฝ.นศท.มทบ.25', 3, 'MTB_25', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_26', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 26 (นฝ.นศท.มทบ.26)', 'นฝ.นศท.มทบ.26', 'นฝ.นศท.มทบ.26', 3, 'MTB_26', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_27', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 27 (นฝ.นศท.มทบ.27)', 'นฝ.นศท.มทบ.27', 'นฝ.นศท.มทบ.27', 3, 'MTB_27', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_28', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 28 (นฝ.นศท.มทบ.28)', 'นฝ.นศท.มทบ.28', 'นฝ.นศท.มทบ.28', 3, 'MTB_28', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_29', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 29 (นฝ.นศท.มทบ.29)', 'นฝ.นศท.มทบ.29', 'นฝ.นศท.มทบ.29', 3, 'MTB_29', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_310', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 310 (นฝ.นศท.มทบ.310)', 'นฝ.นศท.มทบ.310', 'นฝ.นศท.มทบ.310', 3, 'MTB_310', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_34', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 34 (นฝ.นศท.มทบ.34)', 'นฝ.นศท.มทบ.34', 'นฝ.นศท.มทบ.34', 3, 'MTB_34', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_35', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 35 (นฝ.นศท.มทบ.35)', 'นฝ.นศท.มทบ.35', 'นฝ.นศท.มทบ.35', 3, 'MTB_35', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_36', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 36 (นฝ.นศท.มทบ.36)', 'นฝ.นศท.มทบ.36', 'นฝ.นศท.มทบ.36', 3, 'MTB_36', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_37', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 37 (นฝ.นศท.มทบ.37)', 'นฝ.นศท.มทบ.37', 'นฝ.นศท.มทบ.37', 3, 'MTB_37', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_38', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 38 (นฝ.นศท.มทบ.38)', 'นฝ.นศท.มทบ.38', 'นฝ.นศท.มทบ.38', 3, 'MTB_38', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_39', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 39 (นฝ.นศท.มทบ.39)', 'นฝ.นศท.มทบ.39', 'นฝ.นศท.มทบ.39', 3, 'MTB_39', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_43', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 43 (นฝ.นศท.มทบ.43)', 'นฝ.นศท.มทบ.43', 'นฝ.นศท.มทบ.43', 3, 'MTB_43', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_44', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 44 (นฝ.นศท.มทบ.44)', 'นฝ.นศท.มทบ.44', 'นฝ.นศท.มทบ.44', 3, 'MTB_44', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_45', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 45 (นฝ.นศท.มทบ.45)', 'นฝ.นศท.มทบ.45', 'นฝ.นศท.มทบ.45', 3, 'MTB_45', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_TD_MTB_46', 'หน่วยฝึกนักศึกษาวิชาทหาร มณฑลทหารบกที่ 46 (นฝ.นศท.มทบ.46)', 'นฝ.นศท.มทบ.46', 'นฝ.นศท.มทบ.46', 3, 'MTB_46', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('UNIT_VET_CTR_SIG', 'ศูนย์การสุนัขทหาร กรมการสัตว์ทหารบก (ศสท.กส.ทบ.)', 'ศสท.กส.ทบ.', 'ศสท.กส.ทบ.', 3, 'DEPT_VET_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('INSURANCE_CO', 'บริษัท ทิพยประกันภัย จำกัด (มหาชน)', 'ทิพยประกันภัย', 'INS', 1, NULL, 'ส่วนกลาง', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. ผู้ใช้งานระบบ
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-unit-1', '1100500123456', 'ร.อ.', 'สมหมาย', 'กล้าหาญ', 'นายทหารธุรการและกำลังพล', '9th_INF_DIV', 'กองพลทหารราบที่ 9 (พล.ร.9)', '081-234-5678', 'unit.officer@army.mil.th', 'scrypt$81cae7c177ff593b466e62ed1023412c$830f8cc1e5395c427b43f3f94387876b71bd87d67c08c7357d2ee0e3652086170976a44c21b20c9f2b297aa14ac4470d5ceaedb6eff9d922e19bc33c07959147', 'UNIT_OFFICER', 'UNIT_OFFICER', 'APPROVED', TRUE, '2026-11-09T04:24:13.139Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-unit-2', '1100500987654', 'พ.ต.', 'ยุทธนา', 'มีชัย', 'นายทหารกำลังพล', 'RANGERS_REG_41', 'กรมทหารพรานที่ 41 (ทภ.4)', '089-876-5432', 'ranger41@army.mil.th', 'scrypt$25134e0036212905af44116762a9994e$07399aeb51b53bdfd4a427e2ca5f8875949dc5175556cf2ad684ac84d73b8adf2f5be3cf081642416bdebb2c75d41ffe6e5a13dfdfae1f033e13bac35b131ff8', 'UNIT_OFFICER', 'UNIT_OFFICER', 'APPROVED', TRUE, '2026-11-09T04:24:13.141Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-ksp-1', '1100500778899', 'พ.ท.', 'อภิสิทธิ์', 'กสพการ', 'ประจำ กสพ.กพ.ทบ.', 'KSP_RTA', 'กรมกำลังพลทหารบก (กสพ.ฯ)', '02-297-7000', 'ksp.rta@army.mil.th', 'scrypt$95a5250e4da0022f94ff31a69bd00a19$0cd42b3aacaf1a60a38849fc253771f782e250123917e2519ef2b73f3db554cde2ac307c23e7620de8bba12595c45714fb7e891f6a72c2af309b88d72defe2da', 'KSP_OFFICER', 'KSP_OFFICER', 'APPROVED', TRUE, '2026-11-09T04:24:13.141Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-cmd-1', '1100500554433', 'พล.ท.', 'พงศกร', 'จิราภรณ์', 'เจ้ากรมกำลังพลทหารบก (จก.กพ.ทบ.)', 'KSP_RTA', 'บก.ทบ. / กรมกำลังพลทหารบก', '02-297-7111', 'commander@army.mil.th', 'scrypt$cc09a8882b37d8942a7b5ecc85a8536d$e60dc07a6c4d50c43ab518e8d2f7a038f25c154439eff92fc5952bf5b24f3f02971a2605e6f304432ac880e5e60877937a0814e65e59521495ad23d2e758778d', 'COMMANDER', 'COMMANDER', 'APPROVED', TRUE, '2026-11-09T04:24:13.141Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-ins-1', '1100500223344', 'นาย', 'วิชัย', 'คุ้มครองภัย', 'ผู้จัดการฝ่ายสินไหมทดแทนภาครัฐ', 'INSURANCE_CO', 'บริษัท ทิพยประกันภัย จำกัด (มหาชน)', '02-123-4567', 'insurance@insurance.co.th', 'scrypt$e500f8b31fe5ba2d264a2d30cab19e9e$96f65b46ca7f931df7ad9c52253276e148d5de1adbde6efcf9ac2d286a11e686968eb2bebbc2f01920e5171105018b973632c7c9ab543b90f25148d558041f0a', 'INSURANCE_REP', 'INSURANCE_REP', 'APPROVED', TRUE, '2026-11-09T04:24:13.141Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-sk-1', '1100500998877', 'พ.อ.', 'ธนากร', 'สวัสดิ์ทบ', 'หัวหน้าแผนกสงเคราะห์ สก.ทบ.', 'SK_RTA', 'กรมสวัสดิการทหารบก (สก.ทบ.)', '02-281-5555', 'sk.rta@army.mil.th', 'scrypt$433b261ba448a2f4ccc700d5ce39349e$f6332f2f6799e04a7716113d896c9eb23902e178a2d131d4f2af7ada682cac82b35bdf38c2efe5ac264198d51b5eeaa5e4d3b37772a4dc86fc72a9efaf426bf8', 'SK_OFFICER', 'SK_OFFICER', 'APPROVED', TRUE, '2026-11-09T04:24:13.141Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-admin-1', '1100500001122', 'พ.อ.', 'ชนินทร์', 'ปฏิบัติการ', 'ผู้ดูแลระบบส่วนกลาง', 'KSP_RTA', 'ศูนย์เทคโนโลยีสารสนเทศ ทบ.', '02-297-8000', 'admin@army.mil.th', 'scrypt$1d1ef0bf28aaf04ff03bd9dc8da8c1fd$a028fa65954fa9fdedd285b7ae2168fab90b97a6a16fa568ad3e541322155abff6584ef41f0f765ec59574f2a5081772334aad79eb658ccc05d2aee61ae8302a', 'ADMIN', 'ADMIN', 'APPROVED', TRUE, '2026-11-09T04:24:13.141Z')
ON CONFLICT (id) DO NOTHING;

-- 3. รายการคำร้องสินไหม
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2026-0003', 'ทบ-กพ-67/015', 'usr-unit-1', 'ร.อ. สมหมาย กล้าหาญ', '9th_INF_DIV', 'กองพลทหารราบที่ 9 (พล.ร.9)', 'SUBMITTED', 30, NULL, NULL, '1700100554422', 'พลทหาร', 'ธนกฤต', 'แก้ววิเชียร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 60000, NULL, NULL, NULL, NULL, NULL, NULL, '[{"name":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","index":1,"status":"PENDING","comment":"","fileUrl":"/uploads/sample_1.pdf","fileName":"doc_1.pdf","uploaded":true},{"name":"ใบมรณบัตร","index":2,"status":"PENDING","comment":"","fileUrl":"/uploads/sample_2.pdf","fileName":"doc_2.pdf","uploaded":true},{"name":"รายงานการสอบสวนข้อเท็จจริงของหน่วย","index":3,"status":"PENDING","comment":"","fileUrl":"/uploads/sample_3.pdf","fileName":"doc_3.pdf","uploaded":true},{"name":"หนังสือแสดงเจตนาทายาทรับเงินสินไหมทดแทน","index":4,"status":"PENDING","comment":"","fileUrl":"/uploads/sample_4.pdf","fileName":"doc_4.pdf","uploaded":true},{"name":"สำเนาบัตร ปชช. และทะเบียนบ้านผู้รับเงิน","index":5,"status":"PENDING","comment":"","fileUrl":"/uploads/sample_5.pdf","fileName":"doc_5.pdf","uploaded":true},{"name":"ใบรับรองแพทย์","index":6,"status":"PENDING","comment":"","fileUrl":"/uploads/sample_6.pdf","fileName":"doc_6.pdf","uploaded":true},{"name":"คำสั่งปลดพ้นหรือปลดออกจากราชการ","index":7,"status":"PENDING","comment":"","fileUrl":"/uploads/sample_7.pdf","fileName":"doc_7.pdf","uploaded":false},{"name":"หลักฐานพิสูจน์ระดับสารเสพติดหรือแอลกอฮอล์ในเลือด","index":8,"status":"PENDING","comment":"","fileUrl":"/uploads/sample_8.pdf","fileName":"doc_8.pdf","uploaded":true},{"name":"ผลการสอบสวนของเจ้าหน้าที่ตำรวจ (กรณีตายผิดธรรมชาติ)","index":9,"status":"PENDING","comment":"","fileUrl":"/uploads/sample_9.pdf","fileName":"doc_9.pdf","uploaded":false},{"name":"รูปถ่ายขนาด 4x6 นิ้ว","index":10,"status":"PENDING","comment":"","fileUrl":"/uploads/sample_10.pdf","fileName":"doc_10.pdf","uploaded":false}]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-01T01:05:17.452Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2026-0001', 'ทบ-กพ-67/012', 'usr-unit-1', 'ร.อ. สมหมาย กล้าหาญ', '9th_INF_DIV', 'กองพลทหารราบที่ 9 (พล.ร.9)', 'UNDER_REVIEW', 30, NULL, NULL, '3100500112233', 'ส.อ.', 'ประวิทย์', 'มั่นคง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[{"name":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","index":1,"status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน","fileUrl":"/uploads/sample_1.pdf","fileName":"doc_1_attached.pdf","uploaded":true},{"name":"ใบมรณบัตร","index":2,"status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน","fileUrl":"/uploads/sample_2.pdf","fileName":"doc_2_attached.pdf","uploaded":true},{"name":"รายงานการสอบสวนข้อเท็จจริงของหน่วย","index":3,"status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน","fileUrl":"/uploads/sample_3.pdf","fileName":"doc_3_attached.pdf","uploaded":true},{"name":"หนังสือแสดงเจตนาทายาทรับเงินสินไหมทดแทน","index":4,"status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน","fileUrl":"/uploads/sample_4.pdf","fileName":"doc_4_attached.pdf","uploaded":true},{"name":"สำเนาบัตร ปชช. และทะเบียนบ้านผู้รับเงิน","index":5,"status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน","fileUrl":"/uploads/sample_5.pdf","fileName":"doc_5_attached.pdf","uploaded":true},{"name":"ใบรับรองแพทย์","index":6,"status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน","fileUrl":"/uploads/sample_6.pdf","fileName":"doc_6_attached.pdf","uploaded":true},{"name":"คำสั่งปลดพ้นหรือปลดออกจากราชการ","index":7,"status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน","fileUrl":"/uploads/sample_7.pdf","fileName":"doc_7_attached.pdf","uploaded":true},{"name":"หลักฐานพิสูจน์ระดับสารเสพติดหรือแอลกอฮอล์ในเลือด","index":8,"status":"REJECTED","comment":"ผลตรวจระดับแอลกอฮอล์ยังไม่ระบุตราประทับแพทย์ กรุณาส่งฉบับจริง","fileUrl":"/uploads/sample_8.pdf","fileName":"doc_8_attached.pdf","uploaded":true},{"name":"ผลการสอบสวนของเจ้าหน้าที่ตำรวจ (กรณีตายผิดธรรมชาติ)","index":9,"status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน","fileUrl":"/uploads/sample_9.pdf","fileName":"doc_9_attached.pdf","uploaded":true},{"name":"รูปถ่ายขนาด 4x6 นิ้ว","index":10,"status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน","fileUrl":"/uploads/sample_10.pdf","fileName":"doc_10_attached.pdf","uploaded":true}]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-29T01:05:17.452Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2026-0002', 'ทบ-กพ-67/008', 'usr-unit-2', 'พ.ต. ยุทธนา มีชัย', 'RANGERS_REG_41', 'กรมทหารพรานที่ 41', 'PAID', 30, NULL, NULL, '1909800223344', 'อส.ทพ.', 'เดชา', 'แสงสุข', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[{"name":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","index":1,"status":"VERIFIED","comment":"ผ่านการตรวจสอบ","fileUrl":"/uploads/sample_1.pdf","fileName":"doc_1_signed.pdf","uploaded":true},{"name":"ใบมรณบัตร","index":2,"status":"VERIFIED","comment":"ผ่านการตรวจสอบ","fileUrl":"/uploads/sample_2.pdf","fileName":"doc_2_signed.pdf","uploaded":true},{"name":"รายงานการสอบสวนข้อเท็จจริงของหน่วย","index":3,"status":"VERIFIED","comment":"ผ่านการตรวจสอบ","fileUrl":"/uploads/sample_3.pdf","fileName":"doc_3_signed.pdf","uploaded":true},{"name":"หนังสือแสดงเจตนาทายาทรับเงินสินไหมทดแทน","index":4,"status":"VERIFIED","comment":"ผ่านการตรวจสอบ","fileUrl":"/uploads/sample_4.pdf","fileName":"doc_4_signed.pdf","uploaded":true},{"name":"สำเนาบัตร ปชช. และทะเบียนบ้านผู้รับเงิน","index":5,"status":"VERIFIED","comment":"ผ่านการตรวจสอบ","fileUrl":"/uploads/sample_5.pdf","fileName":"doc_5_signed.pdf","uploaded":true},{"name":"ใบรับรองแพทย์","index":6,"status":"VERIFIED","comment":"ผ่านการตรวจสอบ","fileUrl":"/uploads/sample_6.pdf","fileName":"doc_6_signed.pdf","uploaded":true},{"name":"คำสั่งปลดพ้นหรือปลดออกจากราชการ","index":7,"status":"VERIFIED","comment":"ผ่านการตรวจสอบ","fileUrl":"/uploads/sample_7.pdf","fileName":"doc_7_signed.pdf","uploaded":true},{"name":"หลักฐานพิสูจน์ระดับสารเสพติดหรือแอลกอฮอล์ในเลือด","index":8,"status":"VERIFIED","comment":"ผ่านการตรวจสอบ","fileUrl":"/uploads/sample_8.pdf","fileName":"doc_8_signed.pdf","uploaded":true},{"name":"ผลการสอบสวนของเจ้าหน้าที่ตำรวจ (กรณีตายผิดธรรมชาติ)","index":9,"status":"VERIFIED","comment":"ผ่านการตรวจสอบ","fileUrl":"/uploads/sample_9.pdf","fileName":"doc_9_signed.pdf","uploaded":true},{"name":"รูปถ่ายขนาด 4x6 นิ้ว","index":10,"status":"VERIFIED","comment":"ผ่านการตรวจสอบ","fileUrl":"/uploads/sample_10.pdf","fileName":"doc_10_signed.pdf","uploaded":true}]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-02T01:05:17.452Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0008', 'ทบ-กพ-69/085', NULL, NULL, NULL, 'กองพลทหารราบที่ 2 รักษาพระองค์', 'PAID', 30, NULL, NULL, '3100500112228', 'จ.ส.ท.', 'สมปอง', 'ยอดเยี่ยม', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 60000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-28T15:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0007', 'ทบ-กพ-69/068', NULL, NULL, NULL, 'กองพลทหารราบที่ 7', 'PAID', 30, NULL, NULL, '1700100554427', 'พลทหาร', 'ธนากร', 'คงเจริญ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 60000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-15T09:30:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0006', 'ทบ-กพ-69/052', NULL, NULL, NULL, 'กรมทหารพรานที่ 45', 'PAID', 30, NULL, NULL, '1909800223326', 'อส.ทพ.', 'พงษ์ศักดิ์', 'นาวา', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-20T10:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0005', 'ทบ-กพ-69/035', NULL, NULL, NULL, 'กองพลทหารราบที่ 5', 'PAID', 30, NULL, NULL, '3100500112225', 'ส.ต.', 'วีรยุทธ', 'ใจกล้า', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-12T13:30:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0004', 'ทบ-กพ-69/012', NULL, NULL, NULL, 'กองพลทหารราบที่ 4', 'PAID', 30, NULL, NULL, '1100500123424', 'ร.ต.', 'วรภัทร', 'เด่นดวง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-16T11:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0003', 'ทบ-กพ-68/132', NULL, NULL, NULL, 'กองพลทหารราบที่ 15', 'PAID', 30, NULL, NULL, '1700100554423', 'พลทหาร', 'ชัยวัฒน์', 'ศรีบุญ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 60000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-22T14:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0002', 'ทบ-กพ-68/118', NULL, NULL, NULL, 'กรมทหารพรานที่ 41', 'PAID', 30, NULL, NULL, '1909800223322', 'อส.ทพ.', 'กิตติพงษ์', 'วรสาร', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-18T10:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0001', 'ทบ-กพ-68/105', NULL, NULL, NULL, 'กองพลทหารราบที่ 9 (พล.ร.9)', 'PAID', 30, NULL, NULL, '3100500112221', 'ส.อ.', 'ประเสริฐ', 'แก้วงาม', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14T09:15:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0007', 'ทบ-กพ-68/088', NULL, NULL, NULL, 'กรมทหารพรานที่ 45', 'PAID', 30, NULL, NULL, '1909800223317', 'อส.ทพ.', 'มนัส', 'แสงทอง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-08T10:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0006', 'ทบ-กพ-68/065', NULL, NULL, NULL, 'กองพลทหารราบที่ 6', 'PAID', 30, NULL, NULL, '1700100554416', 'พลทหาร', 'ธีระพงษ์', 'จิตมั่น', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 60000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-22T14:30:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0005', 'ทบ-กพ-68/042', NULL, NULL, NULL, 'กองพลทหารราบที่ 4', 'PAID', 30, NULL, NULL, '3100500112215', 'ส.ต.', 'สุรเชษฐ์', 'บุญมี', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-14T09:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0004', 'ทบ-กพ-68/028', NULL, NULL, NULL, 'กองพลทหารราบที่ 15', 'PAID', 30, NULL, NULL, '1100500123414', 'ร.อ.', 'ปิยะ', 'หาญศึก', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-03-18T13:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0003', 'ทบ-กพ-68/005', NULL, NULL, NULL, 'กองพลทหารราบที่ 3', 'PAID', 30, NULL, NULL, '1700100554413', 'พลทหาร', 'อนุสรณ์', 'คำดี', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 60000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-01-12T11:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0002', 'ทบ-กพ-67/125', NULL, NULL, NULL, 'กรมทหารพรานที่ 41', 'PAID', 30, NULL, NULL, '1909800223312', 'อส.ทพ.', 'ธนา', 'ภักดี', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2024-11-20T10:30:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0001', 'ทบ-กพ-67/110', NULL, NULL, NULL, 'กองพลทหารราบที่ 9 (พล.ร.9)', 'PAID', 30, NULL, NULL, '3100500112211', 'ส.อ.', 'อดุลย์', 'คงมั่น', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2024-10-15T09:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2567-0005', 'ทบ-กพ-67/072', NULL, NULL, NULL, 'กองพลทหารราบที่ 2 รักษาพระองค์', 'PAID', 30, NULL, NULL, '3100500112205', 'จ.ส.อ.', 'บุญเลิศ', 'สุขใจ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 60000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2024-08-16T14:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2567-0004', 'ทบ-กพ-67/045', NULL, NULL, NULL, 'กองพลทหารราบที่ 4', 'PAID', 30, NULL, NULL, '1100500123404', 'ร.ท.', 'เกียรติศักดิ์', 'วัฒนา', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2024-05-22T11:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2567-0003', 'ทบ-กพ-67/018', NULL, NULL, NULL, 'กองพลทหารราบที่ 15', 'PAID', 30, NULL, NULL, '1700100554403', 'พลทหาร', 'มานพ', 'แสงทอง', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 60000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2024-02-14T10:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2567-0002', 'ทบ-กพ-66/102', NULL, NULL, NULL, 'กรมทหารพรานที่ 41', 'PAID', 30, NULL, NULL, '1909800223302', 'อส.ทพ.', 'สมศักดิ์', 'ศรีสวัสดิ์', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2023-12-08T09:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2567-0001', 'ทบ-กพ-66/089', NULL, NULL, NULL, 'กองพลทหารราบที่ 9 (พล.ร.9)', 'PAID', 30, NULL, NULL, '3100500112201', 'ส.ต.', 'วิชาญ', 'คงกระพัน', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300000, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2023-10-18T08:30:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- 4. ชุดแบบทดสอบความรู้
INSERT INTO knowledge_exams (id, title, description, category, passing_score, time_limit_minutes, question_count, randomize_questions, randomize_options, question_source, is_active, instructions, question_ids, created_at)
VALUES ('exm-claims-basic', 'แบบทดสอบความรู้การใช้งานระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน', 'ทดสอบความเข้าใจเกี่ยวกับกระบวนการยื่นเสนอเรื่อง การจัดทำเอกสาร และการใช้งานระบบสำหรับเจ้าหน้าที่กำลังพล', 'ทั่วไป', 80, 30, 10, TRUE, TRUE, 'combined', TRUE, 'อ่านคู่มือและวิดีโอในคลังความรู้ก่อนเข้าทำแบบทดสอบ คะแนนเต็ม 100 ต้องได้คะแนนไม่ต่ำกว่า 80 คะแนนจึงผ่านและสามารถใช้งานระบบได้', '[]'::jsonb, '2026-11-04T01:05:17.452Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_exams (id, title, description, category, passing_score, time_limit_minutes, question_count, randomize_questions, randomize_options, question_source, is_active, instructions, question_ids, created_at)
VALUES ('exm-1793754959727', 'องค์ความรู้เบื้องต้น', NULL, 'ทั่วไป', 80, 30, 10, TRUE, TRUE, 'combined', TRUE, 'ศึกษาเนื้อหาตามระเบียบสินไหมพิทักษ์พล ปี68', '[]'::jsonb, '2026-11-04T01:15:59.727Z')
ON CONFLICT (id) DO NOTHING;

-- 5. ข้อสอบประจำชุด
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-1793756152066', 'exm-1793754959727', '1+1*1 มีค่าได้เท่าไร', '[]'::jsonb, 10, 1, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-1', 'exm-claims-basic', 'เอกสารใดเป็นเอกสารหลักที่ต้องแนบในการยื่นเสนอเรื่องขอรับเงินสินไหมทดแทน?', '[{"id":"a","text":"สำเนาบัตรประชาชนผู้สูญเสีย","isCorrect":false},{"id":"b","text":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","isCorrect":true},{"id":"c","text":"ใบเสร็จรับเงิน","isCorrect":false},{"id":"d","text":"หนังสือเดินทาง","isCorrect":false}]'::jsonb, 10, 1, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-1793756197286', 'exm-1793754959727', 'ผู้ถามต้องการสื่อสิ่งใด', '[]'::jsonb, 10, 1, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-2', 'exm-claims-basic', 'ระยะเวลาระบุคำร้องสินไหมตามมาตรฐาน SLA คือกี่วัน?', '[{"id":"a","text":"15 วัน","isCorrect":false},{"id":"b","text":"30 วัน","isCorrect":true},{"id":"c","text":"45 วัน","isCorrect":false},{"id":"d","text":"60 วัน","isCorrect":false}]'::jsonb, 10, 2, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-3', 'exm-claims-basic', 'หากพบว่าเลขประจำตัวประชาชนผู้สูญเสียเคยมีการยื่นเรื่องในระบบแล้ว จะทำอย่างไร?', '[{"id":"a","text":"ยื่นเรื่องซ้ำได้เลย","isCorrect":false},{"id":"b","text":"ระบบจะป้องกันการยื่นซ้ำและแจ้งเลขอ้างอิงเดิม","isCorrect":true},{"id":"c","text":"ลบข้อมูลเดิมแล้วค่อยยื่นใหม่","isCorrect":false},{"id":"d","text":"ติดต่อบริษัทประกันภัยโดยตรง","isCorrect":false}]'::jsonb, 10, 3, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-4', 'exm-claims-basic', 'ใครเป็นผู้มีอำนาจอนุมัติคำร้องเสนอขอรับเงินสินไหมทดแทน?', '[{"id":"a","text":"เจ้าหน้าที่หน่วย (UNIT_OFFICER)","isCorrect":false},{"id":"b","text":"เจ้ากรมกำลังพลทหารบก (จก.กพ.ทบ.)","isCorrect":true},{"id":"c","text":"บริษัทประกันภัย","isCorrect":false},{"id":"d","text":"สก.ทบ.","isCorrect":false}]'::jsonb, 10, 4, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-5', 'exm-claims-basic', 'คำร้องสถานะใดหมายถึงการโอนเงินสินไหมแล้ว?', '[{"id":"a","text":"SUBMITTED","isCorrect":false},{"id":"b","text":"APPROVED","isCorrect":false},{"id":"c","text":"PAID","isCorrect":true},{"id":"d","text":"REJECTED_BY_KSP","isCorrect":false}]'::jsonb, 10, 5, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-6', 'exm-claims-basic', 'ผู้ใช้งานจะได้รับสิทธิใช้งานระบบเมื่อใด?', '[{"id":"a","text":"ทันทีหลังสมัครสมาชิก","isCorrect":false},{"id":"b","text":"เมื่อผ่านการทดสอบความรู้ในคลังความรู้","isCorrect":true},{"id":"c","text":"หลังจากรอ 7 วันทำการ","isCorrect":false},{"id":"d","text":"เมื่อผู้บังคับบัญชาอนุมัติเป็นรายบุคคล","isCorrect":false}]'::jsonb, 10, 6, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-7', 'exm-claims-basic', 'คะแนนขั้นต่ำที่ต้องได้เพื่อผ่านแบบทดสอบความรู้คือเท่าใด?', '[{"id":"a","text":"50 คะแนน","isCorrect":false},{"id":"b","text":"60 คะแนน","isCorrect":false},{"id":"c","text":"80 คะแนน","isCorrect":true},{"id":"d","text":"90 คะแนน","isCorrect":false}]'::jsonb, 10, 7, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-8', 'exm-claims-basic', 'หากยังไม่ผ่านการทดสอบความรู้ จะสามารถใช้งานฟังก์ชันหลักของระบบได้หรือไม่?', '[{"id":"a","text":"ใช้งานได้ตามปกติ","isCorrect":false},{"id":"b","text":"ใช้งานไม่ได้ จนกว่าจะผ่านการทดสอบ","isCorrect":true},{"id":"c","text":"ใช้งานได้เฉพาะดูรายงาน","isCorrect":false},{"id":"d","text":"ใช้งานได้เฉพาะในช่วงเวลาที่เปิดสอบ","isCorrect":false}]'::jsonb, 10, 8, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-9', 'exm-claims-basic', 'แบบทดสอบความรู้มีช่วงเวลาเปิดปิดหรือไม่?', '[{"id":"a","text":"ไม่มี เปิดสอบตลอดเวลา","isCorrect":false},{"id":"b","text":"มี ผู้ดูแลระบบกำหนดช่วงเปิด-ปิดให้ทำแบบทดสอบ","isCorrect":true},{"id":"c","text":"เปิดเฉพาะวันหยุดราชการ","isCorrect":false},{"id":"d","text":"เปิดเฉพาะเช้าวันจันทร์","isCorrect":false}]'::jsonb, 10, 9, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-10', 'exm-claims-basic', 'เมื่อผ่านแบบทดสอบแล้ว ผู้ใช้งานสามารถเข้าถึงเมนูใดเป็นอันดับแรก?', '[{"id":"a","text":"จัดการคู่มือและวิดีโอ","isCorrect":false},{"id":"b","text":"ยื่นเสนอเรื่องใหม่ / รายการคำร้อง / Dashboard ตามสิทธิบทบาท","isCorrect":true},{"id":"c","text":"รีเซ็ตรหัสผ่านเท่านั้น","isCorrect":false},{"id":"d","text":"ไม่สามารถเข้าถึงเมนูใดได้","isCorrect":false}]'::jsonb, 10, 10, NULL)
ON CONFLICT (id) DO NOTHING;

-- 6. ธนาคารคำถามกลาง

-- 7. คู่มือและเอกสารดาวน์โหลด

-- 8. วิดีโอสอนการใช้งาน

-- 9. การตั้งค่าห้วงการสอบ
INSERT INTO system_settings (key, value) VALUES ('exam_settings', '{"updatedAt":"2026-11-11T02:39:20.537Z","updatedBy":"ระบบส่วนกลาง","isExamPeriodActive":false}'::jsonb) ON CONFLICT (key) DO NOTHING;

COMMIT;
