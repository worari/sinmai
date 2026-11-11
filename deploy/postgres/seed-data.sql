-- ข้อมูลเริ่มต้นสำหรับระบบสินไหม ทบ. (Seed Data 14 ตาราง จาก data-store.json)
BEGIN;

-- 1. โครงสร้างหน่วยทหาร
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('1st_ARMY', 'กองทัพภาคที่ 1 (ทภ.1)', 'ทภ.1', 'ทภ.1', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('2nd_ARMY', 'กองทัพภาคที่ 2 (ทภ.2)', 'ทภ.2', 'ทภ.2', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('3rd_ARMY', 'กองทัพภาคที่ 3 (ทภ.3)', 'ทภ.3', 'ทภ.3', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('4th_ARMY', 'กองทัพภาคที่ 4 (ทภ.4)', 'ทภ.4', 'ทภ.4', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SWC_RTA', 'หน่วยบัญชาการสงครามพิเศษ (นสศ.)', 'นสศ.', 'นสศ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AADC_RTA', 'หน่วยบัญชาการป้องกันภัยทางอากาศกองทัพบก (นปอ.)', 'นปอ.', 'นปอ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('TRADOC_RTA', 'กรมยุทธศึกษาทหารบก (ยศ.ทบ.)', 'ยศ.ทบ.', 'ยศ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('KSP_RTA', 'กรมกำลังพลทหารบก (กพ.ทบ. / กสพ.ฯ)', 'กพ.ทบ.', 'กพ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SK_RTA', 'กรมสวัสดิการทหารบก (สก.ทบ.)', 'สก.ทบ.', 'สก.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ORD_RTA', 'กรมสรรพาวุธทหารบก (สพ.ทบ.)', 'สพ.ทบ.', 'สพ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('TRANS_RTA', 'กรมการขนส่งทหารบก (ขส.ทบ.)', 'ขส.ทบ.', 'ขส.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ENG_RTA', 'กรมการทหารช่าง (ช.ทบ.)', 'ช.ทบ.', 'ช.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('QM_RTA', 'กรมพลาธิการทหารบก (พธ.ทบ.)', 'พธ.ทบ.', 'พธ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MED_RTA', 'กรมแพทย์ทหารบก (พบ.ทบ.)', 'พบ.ทบ.', 'พบ.ทบ.', 1, NULL, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('1st_DIV', 'กองพลที่ 1 รักษาพระองค์ (พล.1 รอ.)', 'พล.1 รอ.', 'พล.1 รอ.', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('2nd_INF_DIV', 'กองพลทหารราบที่ 2 รักษาพระองค์ (พล.ร.2 รอ. บูรพาพยัคฆ์)', 'พล.ร.2 รอ.', 'พล.ร.2 รอ.', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('9th_INF_DIV', 'กองพลทหารราบที่ 9 (พล.ร.9 ค่ายสุรสีห์)', 'พล.ร.9', 'พล.ร.9', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('11th_INF_DIV', 'กองพลทหารราบที่ 11 (พล.ร.11 สไตรเกอร์)', 'พล.ร.11', 'พล.ร.11', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('2nd_CAV_DIV', 'กองพลทหารม้าที่ 2 รักษาพระองค์ (พล.ม.2 รอ.)', 'พล.ม.2 รอ.', 'พล.ม.2 รอ.', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEV_DIV_1', 'กองพลพัฒนาที่ 1 (พล.พัฒนา 1)', 'พล.พัฒนา 1', 'พล.พัฒนา 1', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_11', 'มณฑลทหารบกที่ 11 (มทบ.11)', 'มทบ.11', 'มทบ.11', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_12', 'มณฑลทหารบกที่ 12 (มทบ.12)', 'มทบ.12', 'มทบ.12', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_14', 'มณฑลทหารบกที่ 14 (มทบ.14)', 'มทบ.14', 'มทบ.14', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_17', 'มณฑลทหารบกที่ 17 (มทบ.17)', 'มทบ.17', 'มทบ.17', 2, '1st_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('3rd_INF_DIV', 'กองพลทหารราบที่ 3 (พล.ร.3 ค่ายสุรนารี)', 'พล.ร.3', 'พล.ร.3', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('6th_INF_DIV', 'กองพลทหารราบที่ 6 (พล.ร.6)', 'พล.ร.6', 'พล.ร.6', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('3rd_CAV_DIV', 'กองพลทหารม้าที่ 3 (พล.ม.3)', 'พล.ม.3', 'พล.ม.3', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEV_DIV_2', 'กองพลพัฒนาที่ 2 (พล.พัฒนา 2)', 'พล.พัฒนา 2', 'พล.พัฒนา 2', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_21', 'มณฑลทหารบกที่ 21 (มทบ.21)', 'มทบ.21', 'มทบ.21', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_22', 'มณฑลทหารบกที่ 22 (มทบ.22)', 'มทบ.22', 'มทบ.22', 2, '2nd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('4th_INF_DIV', 'กองพลทหารราบที่ 4 (พล.ร.4 ค่ายสมเด็จพระนเรศวรมหาราช)', 'พล.ร.4', 'พล.ร.4', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('7th_INF_DIV', 'กองพลทหารราบที่ 7 (พล.ร.7)', 'พล.ร.7', 'พล.ร.7', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('1st_CAV_DIV', 'กองพลทหารม้าที่ 1 (พล.ม.1)', 'พล.ม.1', 'พล.ม.1', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEV_DIV_3', 'กองพลพัฒนาที่ 3 (พล.พัฒนา 3)', 'พล.พัฒนา 3', 'พล.พัฒนา 3', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_31', 'มณฑลทหารบกที่ 31 (มทบ.31)', 'มทบ.31', 'มทบ.31', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_33', 'มณฑลทหารบกที่ 33 (มทบ.33)', 'มทบ.33', 'มทบ.33', 2, '3rd_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('5th_INF_DIV', 'กองพลทหารราบที่ 5 (พล.ร.5 ค่ายเทพสตรีศรีสุนทร)', 'พล.ร.5', 'พล.ร.5', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('15th_INF_DIV', 'กองพลทหารราบที่ 15 (พล.ร.15 ค่ายสมเด็จพระสุริโยทัย)', 'พล.ร.15', 'พล.ร.15', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('DEV_DIV_4', 'กองพลพัฒนาที่ 4 (พล.พัฒนา 4)', 'พล.พัฒนา 4', 'พล.พัฒนา 4', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_41', 'มณฑลทหารบกที่ 41 (มทบ.41)', 'มทบ.41', 'มทบ.41', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_42', 'มณฑลทหารบกที่ 42 (มทบ.42)', 'มทบ.42', 'มทบ.42', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('MTB_46', 'มณฑลทหารบกที่ 46 (มทบ.46 ปัตตานี)', 'มทบ.46', 'มทบ.46', 2, '4th_ARMY', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('1st_SF_DIV', 'กองพลรบพิเศษที่ 1 (พล.รพศ.1)', 'พล.รพศ.1', 'พล.รพศ.1', 2, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_CENTER', 'ศูนย์สงครามพิเศษ (ศสพ.)', 'ศสพ.', 'ศสพ.', 2, 'SWC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AAD_DIV', 'กองพลทหารต่อสู้อากาศยาน (พล.ปตอ.)', 'พล.ปตอ.', 'พล.ปตอ.', 2, 'AADC_RTA', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R2_REG_KG', 'กรมทหารราบที่ 2 รักษาพระองค์ (ร.2 รอ.)', 'ร.2 รอ.', 'ร.2 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
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
VALUES ('R12_REG_KG', 'กรมทหารราบที่ 12 รักษาพระองค์ (ร.12 รอ.)', 'ร.12 รอ.', 'ร.12 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R12_BN1_INF_KG', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 12 รักษาพระองค์ (ร.12 พัน.1 รอ.)', 'ร.12 พัน.1 รอ.', 'ร.12 พัน.1 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R12_BN2_INF_KG', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 12 รักษาพระองค์ (ร.12 พัน.2 รอ.)', 'ร.12 พัน.2 รอ.', 'ร.12 พัน.2 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R21_REG_KG', 'กรมทหารราบที่ 21 รักษาพระองค์ (ร.21 รอ. ทหารเสือราชินี)', 'ร.21 รอ.', 'ร.21 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R21_BN1_INF_KG', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 21 รักษาพระองค์ (ร.21 พัน.1 รอ.)', 'ร.21 พัน.1 รอ.', 'ร.21 พัน.1 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R21_BN2_INF_KG', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 21 รักษาพระองค์ (ร.21 พัน.2 รอ.)', 'ร.21 พัน.2 รอ.', 'ร.21 พัน.2 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_2', 'กรมทหารปืนใหญ่ที่ 2 รักษาพระองค์ (ป.2 รอ.)', 'ป.2 รอ.', 'ป.2 รอ.', 3, '2nd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R1_REG_KG', 'กรมทหารราบที่ 1 มหาดเล็กราชวัลลภรักษาพระองค์ (ร.1 รอ.)', 'ร.1 รอ.', 'ร.1 รอ.', 3, '1st_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R11_REG_KG', 'กรมทหารราบที่ 11 มหาดเล็กราชวัลลภรักษาพระองค์ (ร.11 รอ.)', 'ร.11 รอ.', 'ร.11 รอ.', 3, '1st_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R31_REG_KG', 'กรมทหารราบที่ 31 รักษาพระองค์ (ร.31 รอ. กองพลร่ม)', 'ร.31 รอ.', 'ร.31 รอ.', 3, '1st_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R31_BN1_KG', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 31 รักษาพระองค์ (ร.31 พัน.1 รอ.)', 'ร.31 พัน.1 รอ.', 'ร.31 พัน.1 รอ.', 3, '1st_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_1', 'กรมทหารปืนใหญ่ที่ 1 รักษาพระองค์ (ป.1 รอ.)', 'ป.1 รอ.', 'ป.1 รอ.', 3, '1st_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R9_REG', 'กรมทหารราบที่ 9 (ร.9)', 'ร.9', 'ร.9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
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
VALUES ('R19_REG', 'กรมทหารราบที่ 19 (ร.19)', 'ร.19', 'ร.19', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R19_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 19 (ร.19 พัน.1)', 'ร.19 พัน.1', 'ร.19 พัน.1', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R29_REG', 'กรมทหารราบที่ 29 (ร.29)', 'ร.29', 'ร.29', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R29_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 29 (ร.29 พัน.1)', 'ร.29 พัน.1', 'ร.29 พัน.1', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('ART_REG_9', 'กรมทหารปืนใหญ่ที่ 9 (ป.9)', 'ป.9', 'ป.9', 3, '9th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R3_REG', 'กรมทหารราบที่ 3 (ร.3)', 'ร.3', 'ร.3', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R3_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 3 (ร.3 พัน.1)', 'ร.3 พัน.1', 'ร.3 พัน.1', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R8_REG', 'กรมทหารราบที่ 8 (ร.8)', 'ร.8', 'ร.8', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R8_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 8 (ร.8 พัน.1)', 'ร.8 พัน.1', 'ร.8 พัน.1', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R13_REG', 'กรมทหารราบที่ 13 (ร.13)', 'ร.13', 'ร.13', 3, '3rd_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R4_REG', 'กรมทหารราบที่ 4 (ร.4)', 'ร.4', 'ร.4', 3, '4th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R4_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 4 (ร.4 พัน.1)', 'ร.4 พัน.1', 'ร.4 พัน.1', 3, '4th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R14_REG', 'กรมทหารราบที่ 14 (ร.14)', 'ร.14', 'ร.14', 3, '4th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R5_REG', 'กรมทหารราบที่ 5 (ร.5)', 'ร.5', 'ร.5', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R5_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 5 (ร.5 พัน.1)', 'ร.5 พัน.1', 'ร.5 พัน.1', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R15_REG', 'กรมทหารราบที่ 15 (ร.15)', 'ร.15', 'ร.15', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R25_REG', 'กรมทหารราบที่ 25 (ร.25)', 'ร.25', 'ร.25', 3, '5th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R151_REG', 'กรมทหารราบที่ 151 (ร.151)', 'ร.151', 'ร.151', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R151_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 151 (ร.151 พัน.1)', 'ร.151 พัน.1', 'ร.151 พัน.1', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R151_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 151 (ร.151 พัน.2)', 'ร.151 พัน.2', 'ร.151 พัน.2', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R152_REG', 'กรมทหารราบที่ 152 (ร.152)', 'ร.152', 'ร.152', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R152_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 152 (ร.152 พัน.1)', 'ร.152 พัน.1', 'ร.152 พัน.1', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R153_REG', 'กรมทหารราบที่ 153 (ร.153)', 'ร.153', 'ร.153', 3, '15th_INF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('R153_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 153 (ร.153 พัน.1)', 'ร.153 พัน.1', 'ร.153 พัน.1', 3, '15th_INF_DIV', NULL, 'ACTIVE')
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
VALUES ('SF_REG_1', 'กรมรบพิเศษที่ 1 (รพศ.1 ป่าหวาย)', 'รพศ.1', 'รพศ.1', 3, '1st_SF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_2', 'กรมรบพิเศษที่ 2 (รพศ.2)', 'รพศ.2', 'รพศ.2', 3, '1st_SF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_3', 'กรมรบพิเศษที่ 3 (รพศ.3)', 'รพศ.3', 'รพศ.3', 3, '1st_SF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('SF_REG_4', 'กรมรบพิเศษที่ 4 (รพศ.4)', 'รพศ.4', 'รพศ.4', 3, '1st_SF_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AAD_REG_1', 'กรมทหารต่อสู้อากาศยานที่ 1 (ปตอ.1)', 'ปตอ.1', 'ปตอ.1', 3, 'AAD_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('AAD_REG_2', 'กรมทหารต่อสู้อากาศยานที่ 2 (ปตอ.2)', 'ปตอ.2', 'ปตอ.2', 3, 'AAD_DIV', NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status)
VALUES ('INSURANCE_CO', 'บริษัท ทิพยประกันภัย จำกัด (มหาชน)', 'ทิพยประกันภัย', 'INS', 1, NULL, 'ส่วนกลาง', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. ผู้ใช้งานระบบ
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-unit-1', '1100500123456', 'ร.อ.', 'สมหมาย', 'กล้าหาญ', 'นายทหารธุรการและกำลังพล', '9th_INF_DIV', 'กองพลทหารราบที่ 9 (พล.ร.9)', '081-234-5678', 'unit.officer@army.mil.th', 'scrypt$f482ac187eacbfc397e3cc9d1a1e419a$e450fa03ddd0fb7e34625b9ba6899a559da624b065a83ed7dbce557404d8f0cceda6a49b017eb536af25f92ab05bb712d77785b715047f17f609cf5b76541f71', 'UNIT_OFFICER', 'UNIT_OFFICER', 'APPROVED', TRUE, '2026-11-11T07:01:23.740Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-unit-2', '1100500987654', 'พ.ต.', 'ยุทธนา', 'มีชัย', 'นายทหารกำลังพล', 'RANGERS_REG_41', 'กรมทหารพรานที่ 41 (ทภ.4)', '089-876-5432', 'ranger41@army.mil.th', 'scrypt$8f707c2095c8108b50c5fd0e5cbdedca$5cebf2c62d4ac424e632d9a9e016c5566a4587abf7cd809e51a0173b6cfd1cc05fd77f91c52887feea760f813d81e22710cdb6eaa3d19b65e790e2275bd15465', 'UNIT_OFFICER', 'UNIT_OFFICER', 'APPROVED', TRUE, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-ksp-1', '1100500778899', 'พ.ท.', 'อภิสิทธิ์', 'กสพการ', 'ประจำ กสพ.กพ.ทบ.', 'KSP_RTA', 'กรมกำลังพลทหารบก (กสพ.ฯ)', '02-297-7000', 'ksp.rta@army.mil.th', 'scrypt$efbff0f6f6200806b7dbb38acfbf2ebc$a962837202454d3eac3ad3a7d6209a2cc8862bb143d2912f87fd67084f1072aab88c6a85b97d711da77717eb2929906313c088079d9d8af49c0d5da49cb63fac', 'KSP_OFFICER', 'KSP_OFFICER', 'APPROVED', TRUE, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-cmd-1', '1100500554433', 'พล.ท.', 'พงศกร', 'จิราภรณ์', 'เจ้ากรมกำลังพลทหารบก (จก.กพ.ทบ.)', 'KSP_RTA', 'บก.ทบ. / กรมกำลังพลทหารบก', '02-297-7111', 'commander@army.mil.th', 'scrypt$e04924d49d8ca322c7bf2c74a9d0ea63$939923bec020676a3278fdc318b851d8fc48e27065d34530c4199192d6b684bf76c96ac07eced5ec6b2c65adff7f7d892e1bab5109c78b54a3e8d682a2c48dbd', 'COMMANDER', 'COMMANDER', 'APPROVED', TRUE, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-ins-1', '1100500223344', 'นาย', 'วิชัย', 'คุ้มครองภัย', 'ผู้จัดการฝ่ายสินไหมทดแทนภาครัฐ', 'INSURANCE_CO', 'บริษัท ทิพยประกันภัย จำกัด (มหาชน)', '02-123-4567', 'insurance@insurance.co.th', 'scrypt$01eb55be3e93c32e084bf08ac3aed7e2$bf28ff25da1193e4fedfa54e4777b52140d53a164cf6422f8804a83d7f481e21e4335b4a0e813756f037078ee507e46432552b39eba8fc0267f6b9a0563d9f23', 'INSURANCE_REP', 'INSURANCE_REP', 'APPROVED', TRUE, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-sk-1', '1100500998877', 'พ.อ.', 'ธนากร', 'สวัสดิ์ทบ', 'หัวหน้าแผนกสงเคราะห์ สก.ทบ.', 'SK_RTA', 'กรมสวัสดิการทหารบก (สก.ทบ.)', '02-281-5555', 'sk.rta@army.mil.th', 'scrypt$0af4c19d30da91b147676823eb82278d$904b01ba6571d37e661d91c3d899c7933693864fc62629e6a0e08cef093529226e6dd036d439e938d87dadb792c193ebaf07dcad3a36a81cceaa258027aad9c8', 'SK_OFFICER', 'SK_OFFICER', 'APPROVED', TRUE, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-admin-1', '1100500001122', 'พ.อ.', 'ชนินทร์', 'ปฏิบัติการ', 'ผู้ดูแลระบบส่วนกลาง', 'KSP_RTA', 'ศูนย์เทคโนโลยีสารสนเทศ ทบ.', '02-297-8000', 'admin@army.mil.th', 'scrypt$666c4a80ad47af81f5a8ff0e844e00cf$80064baa9e3af0f6ef2cab3a5ecd5764798908556ac864604821c85d930797bb22596e7a210338c4adc68579a76c1959e5597af9029ee57e4694ed347fdc79af', 'ADMIN', 'ADMIN', 'APPROVED', TRUE, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-pending-1', '1100500889911', 'ร.ท.', 'วีรชัย', 'ใจหาญ', 'นายทหารส่งกำลังบำรุง', 'MTB_11', 'มณฑลทหารบกที่ 11 (มทบ.11)', '085-112-3344', 'veerachai@army.mil.th', 'scrypt$a0188a64ff5c7f1e2304da4f54b4f840$ec46d1fe79af79be3572b09e6294b3a425692b73f7905b8834cac74c2c24134edc307bb11002ca9d565d69f5e195cd80216c114fa4c7e15ea25189923858ab91', 'UNIT_OFFICER', 'UNIT_OFFICER', 'PENDING', FALSE, '2026-11-05T08:30:00.000Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, requested_role, status, is_active, created_at)
VALUES ('usr-pending-2', '1100500667788', 'พ.ต.', 'ณัฐพล', 'มั่นคง', 'ประจำแผนกกำลังพล', 'KSP_RTA', 'กรมกำลังพลทหารบก (กสพ.ฯ)', '089-554-1122', 'nattapon.ksp@army.mil.th', 'scrypt$754e2010dab68a4a2468e7affec85254$8a736a846119f880ae6675a06dae00a8c121cee5d6c57ec02b56644083f47a26766eeb3e532dcc39c6599ee0a6f6c5255e9e036ae345a45296c1fd601026e990', 'KSP_OFFICER', 'KSP_OFFICER', 'PENDING', FALSE, '2026-11-06T02:15:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- 3. รายการคำร้องสินไหม
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2026-0001', 'ทบ-กพ-67/012', 'usr-unit-1', 'ร.อ. สมหมาย กล้าหาญ', '9th_INF_DIV', 'กองพลทหารราบที่ 9 (พล.ร.9)', 'UNDER_REVIEW', 30, '2026-10-15', '2026-10-10', '3100500112233', 'ส.อ.', 'ประวิทย์', 'มั่นคง', '1995-04-12', 'ชาย', NULL, 'นายทหารประทวน', 'DECEASED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, 'บาดแผลจากสะเก็ดระเบิดรุนแรงหลายแห่ง เสียเลือดมากในช่องอก', NULL, 'ถูกซุ่มโจมตีด้วยระเบิดแสวงเครื่องขณะลาดตระเวนรักษาความปลอดภัยเส้นทาง', '{"locationName":"ถนนสายชนบท บ.บาเจาะ","houseNumber":"","village":"3","soi":"","street":"ทล.410","subdistrict":"บาเจาะ","district":"บันนังสตา","province":"ยะลา","lat":6.2625,"lng":101.2612,"fullAddress":"[ถนนสายชนบท บ.บาเจาะ] หมู่ 3 ถนนทล.410 ต.บาเจาะ อ.บันนังสตา จ.ยะลา"}'::jsonb, NULL, '[{"index":1,"name":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","uploaded":true,"fileName":"doc_1_attached.pdf","fileUrl":"/uploads/sample_1.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":2,"name":"ใบมรณบัตร","uploaded":true,"fileName":"doc_2_attached.pdf","fileUrl":"/uploads/sample_2.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":3,"name":"รายงานการสอบสวนข้อเท็จจริงของหน่วย","uploaded":true,"fileName":"doc_3_attached.pdf","fileUrl":"/uploads/sample_3.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":4,"name":"หนังสือแสดงเจตนาทายาทรับเงินสินไหมทดแทน","uploaded":true,"fileName":"doc_4_attached.pdf","fileUrl":"/uploads/sample_4.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":5,"name":"สำเนาบัตร ปชช. และทะเบียนบ้านผู้รับเงิน","uploaded":true,"fileName":"doc_5_attached.pdf","fileUrl":"/uploads/sample_5.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":6,"name":"ใบรับรองแพทย์","uploaded":true,"fileName":"doc_6_attached.pdf","fileUrl":"/uploads/sample_6.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":7,"name":"คำสั่งปลดพ้นหรือปลดออกจากราชการ","uploaded":true,"fileName":"doc_7_attached.pdf","fileUrl":"/uploads/sample_7.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":8,"name":"หลักฐานพิสูจน์ระดับสารเสพติดหรือแอลกอฮอล์ในเลือด","uploaded":true,"fileName":"doc_8_attached.pdf","fileUrl":"/uploads/sample_8.pdf","status":"REJECTED","comment":"ผลตรวจระดับแอลกอฮอล์ยังไม่ระบุตราประทับแพทย์ กรุณาส่งฉบับจริง"},{"index":9,"name":"ผลการสอบสวนของเจ้าหน้าที่ตำรวจ (กรณีตายผิดธรรมชาติ)","uploaded":true,"fileName":"doc_9_attached.pdf","fileUrl":"/uploads/sample_9.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":10,"name":"รูปถ่ายขนาด 4x6 นิ้ว","uploaded":true,"fileName":"doc_10_attached.pdf","fileUrl":"/uploads/sample_10.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"}]'::jsonb, '[{"action":"SUBMIT_CLAIM","by":"ร.อ. สมหมาย กล้าหาญ (พล.ร.9)","timestamp":"2026-10-29T01:05:17.452Z","remark":"ยื่นเสนอขอรับเงินค่าสินไหมทดแทนกรณีเสี่ยงภัย 300,000 บาท"},{"action":"KSP_RECEIVED","by":"พ.ท. อภิสิทธิ์ กสพการ (กพ.ทบ.)","timestamp":"2026-11-02T01:05:17.452Z","remark":"รับเรื่องตรวจหลักฐาน พบเอกสารหมายเลข 8 ยังไม่สมบูรณ์"}]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-29T01:05:17.452Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2026-0002', 'ทบ-กพ-67/008', 'usr-unit-2', 'พ.ต. ยุทธนา มีชัย', 'RANGERS_REG_41', 'กรมทหารพรานที่ 41', 'PAID', 30, '2026-09-18', '2026-09-12', '1909800223344', 'อส.ทพ.', 'เดชา', 'แสงสุข', NULL, 'ชาย', NULL, 'อส.ทพ. (อาสาสมัครทหารพราน)', 'DISABLED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'เหยียบกับระเบิดขณะปฏิบัติการปิดล้อมตรวจค้น ทำให้สูญเสียขาทั้งสองข้างระดับเหนือเข่า', NULL, NULL, '[{"index":1,"name":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","uploaded":true,"fileName":"doc_1_signed.pdf","fileUrl":"/uploads/sample_1.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":2,"name":"ใบมรณบัตร","uploaded":true,"fileName":"doc_2_signed.pdf","fileUrl":"/uploads/sample_2.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":3,"name":"รายงานการสอบสวนข้อเท็จจริงของหน่วย","uploaded":true,"fileName":"doc_3_signed.pdf","fileUrl":"/uploads/sample_3.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":4,"name":"หนังสือแสดงเจตนาทายาทรับเงินสินไหมทดแทน","uploaded":true,"fileName":"doc_4_signed.pdf","fileUrl":"/uploads/sample_4.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":5,"name":"สำเนาบัตร ปชช. และทะเบียนบ้านผู้รับเงิน","uploaded":true,"fileName":"doc_5_signed.pdf","fileUrl":"/uploads/sample_5.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":6,"name":"ใบรับรองแพทย์","uploaded":true,"fileName":"doc_6_signed.pdf","fileUrl":"/uploads/sample_6.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":7,"name":"คำสั่งปลดพ้นหรือปลดออกจากราชการ","uploaded":true,"fileName":"doc_7_signed.pdf","fileUrl":"/uploads/sample_7.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":8,"name":"หลักฐานพิสูจน์ระดับสารเสพติดหรือแอลกอฮอล์ในเลือด","uploaded":true,"fileName":"doc_8_signed.pdf","fileUrl":"/uploads/sample_8.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":9,"name":"ผลการสอบสวนของเจ้าหน้าที่ตำรวจ (กรณีตายผิดธรรมชาติ)","uploaded":true,"fileName":"doc_9_signed.pdf","fileUrl":"/uploads/sample_9.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":10,"name":"รูปถ่ายขนาด 4x6 นิ้ว","uploaded":true,"fileName":"doc_10_signed.pdf","fileUrl":"/uploads/sample_10.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"}]'::jsonb, '[{"action":"SUBMIT_CLAIM","by":"พ.ต. ยุทธนา มีชัย","timestamp":"2026-09-18T09:00:00Z","remark":"ยื่นเรื่อง"},{"action":"KSP_VERIFIED","by":"กสพ.กพ.ทบ.","timestamp":"2026-09-25T14:30:00Z","remark":"เอกสารครบถ้วน เสนอ จก.กพ.ทบ."},{"action":"COMMANDER_APPROVED","by":"พล.ท. พงศกร (จก.กพ.ทบ.)","timestamp":"2026-10-02T11:00:00Z","remark":"อนุมัติจ่ายเงินสินไหม 300,000 บาท"},{"action":"INSURANCE_TRANSFERRED","by":"บ.ทิพยประกันภัย","timestamp":"2026-10-19T10:15:00Z","remark":"โอนเงินเข้าบัญชีทายาทเรียบร้อย เลขที่อ้างอิง TX998124"}]'::jsonb, NULL, NULL, 'รอหนังสือคำสั่งปลดออกจากราชการเนื่องจากทุพพลภาพจากกรมกำลังพล และรอผลตรวจประเมินแพทย์ผู้เชี่ยวชาญ', '/uploads/delay_justification.pdf', '2026-11-02T01:05:17.452Z', NULL, '2026-10-02T01:05:17.452Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2026-0003', 'ทบ-กพ-67/015', 'usr-unit-1', 'ร.อ. สมหมาย กล้าหาญ', '9th_INF_DIV', 'กองพลทหารราบที่ 9 (พล.ร.9)', 'SUBMITTED', 30, '2026-10-18', '2026-10-16', '1700100554422', 'พลทหาร', 'ธนกฤต', 'แก้ววิเชียร', NULL, 'ชาย', NULL, 'พลทหาร', 'DECEASED', 'NORMAL', NULL, NULL, NULL, 60000, NULL, NULL, NULL, 'หัวใจวายเฉียบพลันขณะประจำการฝึกภาคสนาม', NULL, NULL, '[{"index":1,"name":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","uploaded":true,"fileName":"doc_1.pdf","fileUrl":"/uploads/sample_1.pdf","status":"PENDING","comment":""},{"index":2,"name":"ใบมรณบัตร","uploaded":true,"fileName":"doc_2.pdf","fileUrl":"/uploads/sample_2.pdf","status":"PENDING","comment":""},{"index":3,"name":"รายงานการสอบสวนข้อเท็จจริงของหน่วย","uploaded":true,"fileName":"doc_3.pdf","fileUrl":"/uploads/sample_3.pdf","status":"PENDING","comment":""},{"index":4,"name":"หนังสือแสดงเจตนาทายาทรับเงินสินไหมทดแทน","uploaded":true,"fileName":"doc_4.pdf","fileUrl":"/uploads/sample_4.pdf","status":"PENDING","comment":""},{"index":5,"name":"สำเนาบัตร ปชช. และทะเบียนบ้านผู้รับเงิน","uploaded":true,"fileName":"doc_5.pdf","fileUrl":"/uploads/sample_5.pdf","status":"PENDING","comment":""},{"index":6,"name":"ใบรับรองแพทย์","uploaded":true,"fileName":"doc_6.pdf","fileUrl":"/uploads/sample_6.pdf","status":"PENDING","comment":""},{"index":7,"name":"คำสั่งปลดพ้นหรือปลดออกจากราชการ","uploaded":false,"fileName":"doc_7.pdf","fileUrl":"/uploads/sample_7.pdf","status":"PENDING","comment":""},{"index":8,"name":"หลักฐานพิสูจน์ระดับสารเสพติดหรือแอลกอฮอล์ในเลือด","uploaded":true,"fileName":"doc_8.pdf","fileUrl":"/uploads/sample_8.pdf","status":"PENDING","comment":""},{"index":9,"name":"ผลการสอบสวนของเจ้าหน้าที่ตำรวจ (กรณีตายผิดธรรมชาติ)","uploaded":false,"fileName":"doc_9.pdf","fileUrl":"/uploads/sample_9.pdf","status":"PENDING","comment":""},{"index":10,"name":"รูปถ่ายขนาด 4x6 นิ้ว","uploaded":false,"fileName":"doc_10.pdf","fileUrl":"/uploads/sample_10.pdf","status":"PENDING","comment":""}]'::jsonb, '[{"action":"SUBMIT_CLAIM","by":"ร.อ. สมหมาย กล้าหาญ","timestamp":"2026-11-01T01:05:17.452Z","remark":"ยื่นเสนอขอรับสินไหมยามปกติ 60,000 บาท"}]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-01T01:05:17.452Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2567-0001', 'ทบ-กพ-66/089', NULL, NULL, NULL, 'กองพลทหารราบที่ 9 (พล.ร.9)', 'PAID', 30, '2023-10-18', '2023-10-15', '3100500112201', 'ส.ต.', 'วิชาญ', 'คงกระพัน', NULL, NULL, NULL, 'นายทหารประทวน', 'DECEASED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'ถูกซุ่มยิงขณะลาดตระเวนชายแดน', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2023-10-18T08:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2567-0002', 'ทบ-กพ-66/102', NULL, NULL, NULL, 'กรมทหารพรานที่ 41', 'PAID', 30, '2023-12-08', '2023-12-04', '1909800223302', 'อส.ทพ.', 'สมศักดิ์', 'ศรีสวัสดิ์', NULL, NULL, NULL, 'อส.ทพ. (อาสาสมัครทหารพราน)', 'DISABLED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'สะเก็ดระเบิดสูญเสียขาทั้ง 2 ข้าง', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2023-12-08T09:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2567-0003', 'ทบ-กพ-67/018', NULL, NULL, NULL, 'กองพลทหารราบที่ 15', 'PAID', 30, '2024-02-14', '2024-02-10', '1700100554403', 'พลทหาร', 'มานพ', 'แสงทอง', NULL, NULL, NULL, 'พลทหาร', 'DECEASED', 'NORMAL', NULL, NULL, NULL, 60000, NULL, NULL, NULL, 'ไข้ป่ามาลาเรียขึ้นสมองระหว่างเข้าค่ายประจำการ', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2024-02-14T10:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2567-0004', 'ทบ-กพ-67/045', NULL, NULL, NULL, 'กองพลทหารราบที่ 4', 'PAID', 30, '2024-05-22', '2024-05-18', '1100500123404', 'ร.ท.', 'เกียรติศักดิ์', 'วัฒนา', NULL, NULL, NULL, 'นายทหารสัญญาบัตร', 'DECEASED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'ปะทะขบวนการลักลอบตัดไม้พะยูงชายแดน', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2024-05-22T11:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2567-0005', 'ทบ-กพ-67/072', NULL, NULL, NULL, 'กองพลทหารราบที่ 2 รักษาพระองค์', 'PAID', 30, '2024-08-16', '2024-08-12', '3100500112205', 'จ.ส.อ.', 'บุญเลิศ', 'สุขใจ', NULL, NULL, NULL, 'นายทหารประทวน', 'DISABLED', 'NORMAL', NULL, NULL, NULL, 60000, NULL, NULL, NULL, 'กระดูกสันหลังหักทุพพลภาพขณะฝึกทางยุทธวิธี', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2024-08-16T14:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0001', 'ทบ-กพ-67/110', NULL, NULL, NULL, 'กองพลทหารราบที่ 9 (พล.ร.9)', 'PAID', 30, '2024-10-15', '2024-10-11', '3100500112211', 'ส.อ.', 'อดุลย์', 'คงมั่น', NULL, NULL, NULL, 'นายทหารประทวน', 'DECEASED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'ลอบวางระเบิดรถยนต์สายตรวจ', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2024-10-15T09:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0002', 'ทบ-กพ-67/125', NULL, NULL, NULL, 'กรมทหารพรานที่ 41', 'PAID', 30, '2024-11-20', '2024-11-16', '1909800223312', 'อส.ทพ.', 'ธนา', 'ภักดี', NULL, NULL, NULL, 'อส.ทพ. (อาสาสมัครทหารพราน)', 'DISABLED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'เหยียบกับระเบิดขาขวาขาดระดับข้อเท้า', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2024-11-20T10:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0003', 'ทบ-กพ-68/005', NULL, NULL, NULL, 'กองพลทหารราบที่ 3', 'PAID', 30, '2025-01-12', '2025-01-08', '1700100554413', 'พลทหาร', 'อนุสรณ์', 'คำดี', NULL, NULL, NULL, 'พลทหาร', 'DECEASED', 'NORMAL', NULL, NULL, NULL, 60000, NULL, NULL, NULL, 'หัวใจวายเฉียบพลันระหว่างฝึกประจำการ', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-01-12T11:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0004', 'ทบ-กพ-68/028', NULL, NULL, NULL, 'กองพลทหารราบที่ 15', 'PAID', 30, '2025-03-18', '2025-03-14', '1100500123414', 'ร.อ.', 'ปิยะ', 'หาญศึก', NULL, NULL, NULL, 'นายทหารสัญญาบัตร', 'DECEASED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'ปะทะกลุ่มผู้ก่อความไม่สงบ', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-03-18T13:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0005', 'ทบ-กพ-68/042', NULL, NULL, NULL, 'กองพลทหารราบที่ 4', 'PAID', 30, '2025-05-14', '2025-05-10', '3100500112215', 'ส.ต.', 'สุรเชษฐ์', 'บุญมี', NULL, NULL, NULL, 'นายทหารประทวน', 'DISABLED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'สะเก็ดระเบิดสูญเสียการมองเห็นตาข้างขวา', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-14T09:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0006', 'ทบ-กพ-68/065', NULL, NULL, NULL, 'กองพลทหารราบที่ 6', 'PAID', 30, '2025-07-22', '2025-07-18', '1700100554416', 'พลทหาร', 'ธีระพงษ์', 'จิตมั่น', NULL, NULL, NULL, 'พลทหาร', 'DECEASED', 'NORMAL', NULL, NULL, NULL, 60000, NULL, NULL, NULL, 'ไข้เลือดออกรุนแรงขณะปฏิบัติการชายแดน', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-07-22T14:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2568-0007', 'ทบ-กพ-68/088', NULL, NULL, NULL, 'กรมทหารพรานที่ 45', 'PAID', 30, '2025-09-08', '2025-09-04', '1909800223317', 'อส.ทพ.', 'มนัส', 'แสงทอง', NULL, NULL, NULL, 'อส.ทพ. (อาสาสมัครทหารพราน)', 'DECEASED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'ถูกซุ่มโจมตีขณะลาดตระเวนเดินเท้า', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-08T10:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0001', 'ทบ-กพ-68/105', NULL, NULL, NULL, 'กองพลทหารราบที่ 9 (พล.ร.9)', 'PAID', 30, '2025-10-14', '2025-10-10', '3100500112221', 'ส.อ.', 'ประเสริฐ', 'แก้วงาม', NULL, NULL, NULL, 'นายทหารประทวน', 'DECEASED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'ลอบวางระเบิดชุด รปภ.ครู', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-14T09:15:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0002', 'ทบ-กพ-68/118', NULL, NULL, NULL, 'กรมทหารพรานที่ 41', 'PAID', 30, '2025-11-18', '2025-11-14', '1909800223322', 'อส.ทพ.', 'กิตติพงษ์', 'วรสาร', NULL, NULL, NULL, 'อส.ทพ. (อาสาสมัครทหารพราน)', 'DISABLED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'กับระเบิดขาซ้ายขาดใต้เข่า', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-18T10:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0003', 'ทบ-กพ-68/132', NULL, NULL, NULL, 'กองพลทหารราบที่ 15', 'PAID', 30, '2025-12-22', '2025-12-19', '1700100554423', 'พลทหาร', 'ชัยวัฒน์', 'ศรีบุญ', NULL, NULL, NULL, 'พลทหาร', 'DECEASED', 'NORMAL', NULL, NULL, NULL, 60000, NULL, NULL, NULL, 'ลมแดดเฉียบพลันขณะฝึกทางยุทธวิธี', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-22T14:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0004', 'ทบ-กพ-69/012', NULL, NULL, NULL, 'กองพลทหารราบที่ 4', 'PAID', 30, '2026-01-16', '2026-01-12', '1100500123424', 'ร.ต.', 'วรภัทร', 'เด่นดวง', NULL, NULL, NULL, 'นายทหารสัญญาบัตร', 'DECEASED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'ปะทะขบวนการค้ายาเสพติดชายแดนภาคเหนือ', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-16T11:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0005', 'ทบ-กพ-69/035', NULL, NULL, NULL, 'กองพลทหารราบที่ 5', 'PAID', 30, '2026-03-12', '2026-03-08', '3100500112225', 'ส.ต.', 'วีรยุทธ', 'ใจกล้า', NULL, NULL, NULL, 'นายทหารประทวน', 'DISABLED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'สะเก็ดระเบิดสูญเสียการได้ยินถาวรและตาขวา', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-12T13:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0006', 'ทบ-กพ-69/052', NULL, NULL, NULL, 'กรมทหารพรานที่ 45', 'PAID', 30, '2026-04-20', '2026-04-16', '1909800223326', 'อส.ทพ.', 'พงษ์ศักดิ์', 'นาวา', NULL, NULL, NULL, 'อส.ทพ. (อาสาสมัครทหารพราน)', 'DECEASED', 'HIGH_RISK', NULL, NULL, NULL, 300000, NULL, NULL, NULL, 'ปะทะขณะปิดล้อมตรวจค้นเป้าหมาย', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-20T10:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0007', 'ทบ-กพ-69/068', NULL, NULL, NULL, 'กองพลทหารราบที่ 7', 'PAID', 30, '2026-06-15', '2026-06-11', '1700100554427', 'พลทหาร', 'ธนากร', 'คงเจริญ', NULL, NULL, NULL, 'พลทหาร', 'DECEASED', 'NORMAL', NULL, NULL, NULL, 60000, NULL, NULL, NULL, 'อุบัติเหตุยานยนต์ลำเลียงพลระหว่างสับเปลี่ยนกำลัง', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-15T09:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2569-0008', 'ทบ-กพ-69/085', NULL, NULL, NULL, 'กองพลทหารราบที่ 2 รักษาพระองค์', 'PAID', 30, '2026-07-28', '2026-07-24', '3100500112228', 'จ.ส.ท.', 'สมปอง', 'ยอดเยี่ยม', NULL, NULL, NULL, 'นายทหารประทวน', 'DISABLED', 'NORMAL', NULL, NULL, NULL, 60000, NULL, NULL, NULL, 'แขนหักและเอ็นฉีกขาดถาวรจากการซ้อมรบทางอากาศ', NULL, NULL, '[]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-28T15:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2026-0004', 'ทบ-กพ-67/021', 'usr-unit-1', 'ร.อ. สมหมาย กล้าหาญ', '9th_INF_DIV', 'กองพลทหารราบที่ 9 (พล.ร.9)', 'PENDING_APPROVAL', 30, '2026-10-22', '2026-10-20', '1100500998811', 'ร.ท.', 'ณัฐพงษ์', 'แก้วมณี', '1992-08-15', 'ชาย', NULL, 'นายทหารสัญญาบัตร', 'DECEASED', 'HIGH_RISK', 'COMBAT', 'NO', 'NOT_EXCEEDED', 300000, 'บาดแผลจากกระสุนปืนทำลายอวัยวะสำคัญภายในช่องอก', 'บาดแผลจากกระสุนปืนทำลายอวัยวะสำคัญภายในช่องอก', NULL, 'ถูกซุ่มยิงขณะนำกำลังเข้าปิดล้อมตรวจค้นพื้นที่เป้าหมายความมั่นคง', '{"locationName":"ต.รือเสาะ อ.รือเสาะ จ.นราธิวาส","fullAddress":"หมู่ 4 ต.รือเสาะ อ.รือเสาะ จ.นราธิวาส"}'::jsonb, NULL, '[{"index":1,"name":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","uploaded":true,"fileName":"doc_1_verified.pdf","fileUrl":"/uploads/sample_1.pdf","status":"VERIFIED","comment":"กสพ.กพ.ทบ. ตรวจสอบเอกสารความถูกต้องครบถ้วนสมบูรณ์แล้ว"},{"index":2,"name":"ใบมรณบัตร","uploaded":true,"fileName":"doc_2_verified.pdf","fileUrl":"/uploads/sample_2.pdf","status":"VERIFIED","comment":"กสพ.กพ.ทบ. ตรวจสอบเอกสารความถูกต้องครบถ้วนสมบูรณ์แล้ว"},{"index":3,"name":"รายงานการสอบสวนข้อเท็จจริงของหน่วย","uploaded":true,"fileName":"doc_3_verified.pdf","fileUrl":"/uploads/sample_3.pdf","status":"VERIFIED","comment":"กสพ.กพ.ทบ. ตรวจสอบเอกสารความถูกต้องครบถ้วนสมบูรณ์แล้ว"},{"index":4,"name":"หนังสือแสดงเจตนาทายาทรับเงินสินไหมทดแทน","uploaded":true,"fileName":"doc_4_verified.pdf","fileUrl":"/uploads/sample_4.pdf","status":"VERIFIED","comment":"กสพ.กพ.ทบ. ตรวจสอบเอกสารความถูกต้องครบถ้วนสมบูรณ์แล้ว"},{"index":5,"name":"สำเนาบัตร ปชช. และทะเบียนบ้านผู้รับเงิน","uploaded":true,"fileName":"doc_5_verified.pdf","fileUrl":"/uploads/sample_5.pdf","status":"VERIFIED","comment":"กสพ.กพ.ทบ. ตรวจสอบเอกสารความถูกต้องครบถ้วนสมบูรณ์แล้ว"},{"index":6,"name":"ใบรับรองแพทย์","uploaded":true,"fileName":"doc_6_verified.pdf","fileUrl":"/uploads/sample_6.pdf","status":"VERIFIED","comment":"กสพ.กพ.ทบ. ตรวจสอบเอกสารความถูกต้องครบถ้วนสมบูรณ์แล้ว"},{"index":7,"name":"คำสั่งปลดพ้นหรือปลดออกจากราชการ","uploaded":true,"fileName":"doc_7_verified.pdf","fileUrl":"/uploads/sample_7.pdf","status":"VERIFIED","comment":"กสพ.กพ.ทบ. ตรวจสอบเอกสารความถูกต้องครบถ้วนสมบูรณ์แล้ว"},{"index":8,"name":"หลักฐานพิสูจน์ระดับสารเสพติดหรือแอลกอฮอล์ในเลือด","uploaded":true,"fileName":"doc_8_verified.pdf","fileUrl":"/uploads/sample_8.pdf","status":"VERIFIED","comment":"กสพ.กพ.ทบ. ตรวจสอบเอกสารความถูกต้องครบถ้วนสมบูรณ์แล้ว"},{"index":9,"name":"ผลการสอบสวนของเจ้าหน้าที่ตำรวจ (กรณีตายผิดธรรมชาติ)","uploaded":true,"fileName":"doc_9_verified.pdf","fileUrl":"/uploads/sample_9.pdf","status":"VERIFIED","comment":"กสพ.กพ.ทบ. ตรวจสอบเอกสารความถูกต้องครบถ้วนสมบูรณ์แล้ว"},{"index":10,"name":"รูปถ่ายขนาด 4x6 นิ้ว","uploaded":true,"fileName":"doc_10_verified.pdf","fileUrl":"/uploads/sample_10.pdf","status":"VERIFIED","comment":"กสพ.กพ.ทบ. ตรวจสอบเอกสารความถูกต้องครบถ้วนสมบูรณ์แล้ว"}]'::jsonb, '[{"action":"SUBMIT_CLAIM","by":"ร.อ. สมหมาย กล้าหาญ","timestamp":"2026-11-07T02:39:20.537Z","remark":"ยื่นเสนอขอรับเงินสินไหมเสี่ยงภัย 300,000 บาท"},{"action":"UNDER_REVIEW","by":"พ.ท. อภิสิทธิ์ กสพการ (กพ.ทบ.)","timestamp":"2026-11-09T02:39:20.537Z","remark":"รับเรื่องและตรวจเอกสารครบ 10 รายการ"},{"action":"PENDING_APPROVAL","by":"พ.ท. อภิสิทธิ์ กสพการ (กพ.ทบ.)","timestamp":"2026-11-10T02:39:20.537Z","remark":"เอกสารถูกต้องครบถ้วน เสนอผู้บังคับบัญชา (จก.กพ.ทบ.) พิจารณาอนุมัติ"}]'::jsonb, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-07T02:39:20.537Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, report_date, loss_date, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, casualty_birth_date, casualty_gender, casualty_position, personnel_type, loss_type, claim_type, incident_type, is_driver, alcohol_test_result, compensation_amount, loss_specific_cause, death_certificate_cause, disabled_organ_detail, cause_of_loss, location_of_loss, heir_name, documents, timeline, approval_document, transfer_details, delay_reason, delay_attachment_url, paid_at, submitted_at, created_at)
VALUES ('CLM-2026-0005', 'ทบ-กพ-67/025', 'usr-unit-2', 'พ.ต. ยุทธนา มีชัย', 'RANGERS_REG_41', 'กรมทหารพรานที่ 41', 'APPROVED', 30, '2026-10-25', '2026-10-22', '1909800334455', 'อส.ทพ.', 'สมพงษ์', 'คงเจริญ', '1998-11-20', 'ชาย', NULL, 'อส.ทพ. (อาสาสมัครทหารพราน)', 'DECEASED', 'HIGH_RISK', 'COMBAT', 'NO', 'NOT_EXCEEDED', 300000, 'ช็อกจากการเสียเลือดและแผลสะเก็ดระเบิดรุนแรง', 'ช็อกจากการเสียเลือดและแผลสะเก็ดระเบิดรุนแรง', NULL, 'ถูกลอบวางระเบิดขณะลาดตระเวนรักษาความปลอดภัยครูและโรงเรียน', '{"locationName":"ต.กายูบอเกาะ อ.รามัน จ.ยะลา","fullAddress":"หมู่ 2 ต.กายูบอเกาะ อ.รามัน จ.ยะลา"}'::jsonb, NULL, '[{"index":1,"name":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","uploaded":true,"fileName":"doc_1_verified.pdf","fileUrl":"/uploads/sample_1.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":2,"name":"ใบมรณบัตร","uploaded":true,"fileName":"doc_2_verified.pdf","fileUrl":"/uploads/sample_2.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":3,"name":"รายงานการสอบสวนข้อเท็จจริงของหน่วย","uploaded":true,"fileName":"doc_3_verified.pdf","fileUrl":"/uploads/sample_3.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":4,"name":"หนังสือแสดงเจตนาทายาทรับเงินสินไหมทดแทน","uploaded":true,"fileName":"doc_4_verified.pdf","fileUrl":"/uploads/sample_4.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":5,"name":"สำเนาบัตร ปชช. และทะเบียนบ้านผู้รับเงิน","uploaded":true,"fileName":"doc_5_verified.pdf","fileUrl":"/uploads/sample_5.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":6,"name":"ใบรับรองแพทย์","uploaded":true,"fileName":"doc_6_verified.pdf","fileUrl":"/uploads/sample_6.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":7,"name":"คำสั่งปลดพ้นหรือปลดออกจากราชการ","uploaded":true,"fileName":"doc_7_verified.pdf","fileUrl":"/uploads/sample_7.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":8,"name":"หลักฐานพิสูจน์ระดับสารเสพติดหรือแอลกอฮอล์ในเลือด","uploaded":true,"fileName":"doc_8_verified.pdf","fileUrl":"/uploads/sample_8.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":9,"name":"ผลการสอบสวนของเจ้าหน้าที่ตำรวจ (กรณีตายผิดธรรมชาติ)","uploaded":true,"fileName":"doc_9_verified.pdf","fileUrl":"/uploads/sample_9.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":10,"name":"รูปถ่ายขนาด 4x6 นิ้ว","uploaded":true,"fileName":"doc_10_verified.pdf","fileUrl":"/uploads/sample_10.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"}]'::jsonb, '[{"action":"SUBMIT_CLAIM","by":"พ.ต. ยุทธนา มีชัย","timestamp":"2026-11-06T02:39:20.537Z","remark":"ยื่นเรื่องขอรับสินไหม 300,000 บาท"},{"action":"PENDING_APPROVAL","by":"พ.ท. อภิสิทธิ์ กสพการ (กพ.ทบ.)","timestamp":"2026-11-09T02:39:20.537Z","remark":"ตรวจเอกสารครบถ้วน เสนอ จก.กพ.ทบ. อนุมัติ"},{"action":"APPROVED","by":"พล.ท. พงศกร จิราภรณ์ (จก.กพ.ทบ.)","timestamp":"2026-11-10T02:39:20.537Z","remark":"จก.กพ.ทบ. อนุมัติการจ่ายเงินสินไหมทดแทน (คำสั่งเลขที่ กห ๐๔๐๑/อนุมัติ-๖๗/๐๒๕) พร้อมแนบตัวเรื่องส่ง บ.ประกันภัย"}]'::jsonb, '{"docNumber":"กห ๐๔๐๑/อนุมัติ-๖๗/๐๒๕","approvedDate":"2026-11-10","approverName":"พล.ท. พงศกร จิราภรณ์","approverTitle":"เจ้ากรมกำลังพลทหารบก (จก.กพ.ทบ.)","fileName":"คำสั่งอนุมัติสิทธิเงินสินไหม_ทบ_กพ_67_025.pdf","fileSize":"1.4 MB","notes":"อนุมัติการขอรับสิทธิเงินสินไหมทดแทน และส่งเอกสารตัวเรื่องให้ บริษัท ทิพยประกันภัย จำกัด (มหาชน) ตรวจสอบรับทราบการได้รับอนุมัติให้จ่ายเงินจากผู้บังคับบัญชา เพื่อดำเนินการโอนเงินให้แก่ทายาทต่อไป","uploadedAt":"2026-11-10T02:39:20.537Z","uploadedBy":"พล.ท. พงศกร จิราภรณ์ (COMMANDER)"}'::jsonb, NULL, NULL, NULL, NULL, NULL, '2026-11-06T02:39:20.537Z')
ON CONFLICT (id) DO NOTHING;

-- 4. ชุดแบบทดสอบความรู้
INSERT INTO knowledge_exams (id, title, description, category, passing_score, time_limit_minutes, question_count, randomize_questions, randomize_options, question_source, is_active, instructions, question_ids, created_at)
VALUES ('exm-claims-basic', 'แบบทดสอบความรู้การใช้งานระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน', 'ทดสอบความเข้าใจเกี่ยวกับกระบวนการยื่นเสนอเรื่อง การจัดทำเอกสาร และการใช้งานระบบสำหรับเจ้าหน้าที่กำลังพล', 'ทั่วไป', 80, 30, 10, TRUE, TRUE, 'combined', TRUE, 'อ่านคู่มือและวิดีโอในคลังความรู้ก่อนเข้าทำแบบทดสอบ คะแนนเต็ม 100 ต้องได้คะแนนไม่ต่ำกว่า 80 คะแนนจึงผ่านและสามารถใช้งานระบบได้', '[]'::jsonb, '2026-11-04T01:05:17.452Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_exams (id, title, description, category, passing_score, time_limit_minutes, question_count, randomize_questions, randomize_options, question_source, is_active, instructions, question_ids, created_at)
VALUES ('exm-1793754959727', 'องค์ความรู้เบื้องต้น', '', 'ทั่วไป', 80, 30, 10, TRUE, TRUE, 'combined', TRUE, 'ศึกษาเนื้อหาตามระเบียบสินไหมพิทักษ์พล ปี68', '[]'::jsonb, '2026-11-04T01:15:59.727Z')
ON CONFLICT (id) DO NOTHING;

-- 5. ข้อสอบประจำชุด
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-1', 'exm-claims-basic', 'เอกสารใดเป็นเอกสารหลักที่ต้องแนบในการยื่นเสนอเรื่องขอรับเงินสินไหมทดแทน?', '[{"id":"a","text":"สำเนาบัตรประชาชนผู้สูญเสีย","isCorrect":false},{"id":"b","text":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","isCorrect":true},{"id":"c","text":"ใบเสร็จรับเงิน","isCorrect":false},{"id":"d","text":"หนังสือเดินทาง","isCorrect":false}]'::jsonb, 10, 1, NULL)
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
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-1793756152066', 'exm-1793754959727', '1+1*1 มีค่าได้เท่าไร', '[]'::jsonb, 10, 1, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_questions (id, exam_id, question_text, options, points, order_index, explanation)
VALUES ('q-1793756197286', 'exm-1793754959727', 'ผู้ถามต้องการสื่อสิ่งใด', '[]'::jsonb, 10, 1, NULL)
ON CONFLICT (id) DO NOTHING;

-- 6. ธนาคารคำถามกลาง
INSERT INTO question_bank (id, question_text, options, points, category, difficulty, tags, exam_id, source, explanation)
VALUES ('qb-1', 'เอกสารหลักที่ต้องแนบในการยื่นเสนอเรื่องขอรับเงินสินไหมทดแทนคืออะไร?', '[{"id":"a","text":"สำเนาบัตรประชาชนผู้สูญเสีย","isCorrect":false},{"id":"b","text":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","isCorrect":true},{"id":"c","text":"ใบเสร็จรับเงิน","isCorrect":false},{"id":"d","text":"หนังสือเดินทาง","isCorrect":false}]'::jsonb, 10, 'เอกสารยื่นเรื่อง', 'easy', '["เอกสาร","พื้นฐาน"]'::jsonb, NULL, 'manual', NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO question_bank (id, question_text, options, points, category, difficulty, tags, exam_id, source, explanation)
VALUES ('qb-2', 'ระยะเวลาระบุคำร้องสินไหมตามมาตรฐาน SLA คือกี่วัน?', '[{"id":"a","text":"15 วัน","isCorrect":false},{"id":"b","text":"30 วัน","isCorrect":true},{"id":"c","text":"45 วัน","isCorrect":false},{"id":"d","text":"60 วัน","isCorrect":false}]'::jsonb, 10, 'ระยะเวลา SLA', 'easy', '["SLA","เวลา"]'::jsonb, NULL, 'manual', NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO question_bank (id, question_text, options, points, category, difficulty, tags, exam_id, source, explanation)
VALUES ('qb-3', 'หากพบว่าเลขประจำตัวประชาชนผู้สูญเสียเคยมีการยื่นเรื่องในระบบแล้ว จะทำอย่างไร?', '[{"id":"a","text":"ยื่นเรื่องซ้ำได้เลย","isCorrect":false},{"id":"b","text":"ระบบจะป้องกันการยื่นซ้ำและแจ้งเลขอ้างอิงเดิม","isCorrect":true},{"id":"c","text":"ลบข้อมูลเดิมแล้วค่อยยื่นใหม่","isCorrect":false},{"id":"d","text":"ติดต่อบริษัทประกันภัยโดยตรง","isCorrect":false}]'::jsonb, 10, 'การยื่นเรื่อง', 'easy', '["การยื่น","ข้อมูลซ้ำ"]'::jsonb, NULL, 'manual', NULL)
ON CONFLICT (id) DO NOTHING;

-- 7. คู่มือและเอกสารดาวน์โหลด
INSERT INTO manuals (id, title, description, category, format, file_name, file_path, file_size, has_attachment, uploaded_by, created_at)
VALUES ('man-1', 'แบบรายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)', 'แบบฟอร์มมาตรฐานสำหรับผู้บังคับหน่วยรายงานการสูญเสียกำลังพล', 'แบบฟอร์มรายงาน', 'PDF', NULL, '/downloads/form_kp4.pdf', '1.2 MB', FALSE, NULL, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO manuals (id, title, description, category, format, file_name, file_path, file_size, has_attachment, uploaded_by, created_at)
VALUES ('man-2', 'หนังสือแสดงเจตนาทายาทผู้มีสิทธิรับเงินสินไหมทดแทน', 'หนังสือมอบอำนาจและการแสดงเจตนายินยอมรับเงินของทายาทตามกฎหมาย', 'เอกสารทายาท', 'PDF', NULL, '/downloads/heir_authorization.pdf', '850 KB', FALSE, NULL, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO manuals (id, title, description, category, format, file_name, file_path, file_size, has_attachment, uploaded_by, created_at)
VALUES ('man-3', 'คู่มือระเบียบ กห. และ ทบ. ว่าด้วยการประกันชีวิตกำลังพล', 'ระเบียบหลักเกณฑ์การจ่ายเงินสินไหมทดแทน 60,000 บาท และ 300,000 บาท', 'ระเบียบข้อบังคับ', 'PDF', NULL, '/downloads/rta_life_insurance_rule.pdf', '3.4 MB', FALSE, NULL, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO manuals (id, title, description, category, format, file_name, file_path, file_size, has_attachment, uploaded_by, created_at)
VALUES ('man-4', 'แบบตรวจสอบเอกสารหลักฐานประกอบ 10 รายการ (Checklist)', 'รายการตรวจสอบความครบถ้วนก่อนส่งเรื่องมายัง กสพ.กพ.ทบ.', 'คู่มือตรวจสอบ', 'PDF', NULL, '/downloads/doc_checklist_10.pdf', '620 KB', FALSE, NULL, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO manuals (id, title, description, category, format, file_name, file_path, file_size, has_attachment, uploaded_by, created_at)
VALUES ('man-5', 'ตัวอย่างบันทึกการสอบสวนข้อเท็จจริงของหน่วยประกอบการขอรับสิทธิ', 'แนวทางการจัดทำสำนวนการสอบสวนกรณีเสียชีวิตหรือทุพพลภาพขณะปฏิบัติหน้าที่', 'ตัวอย่างเอกสาร', 'DOCX', NULL, '/downloads/sample_investigation_report.docx', '450 KB', FALSE, NULL, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;

-- 8. วิดีโอสอนการใช้งาน
INSERT INTO videos (id, title, role, url, duration, category, description, steps, uploaded_by, created_at)
VALUES ('vid-1', 'ขั้นตอนที่ 1: การลงทะเบียนและยื่นเสนอเรื่องผู้สูญเสียพร้อมแนบ 10 เอกสาร', 'สำหรับเจ้าหน้าที่หน่วยต้นสังกัด (ผู้เสนอเรื่อง)', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', '4:20 นาที', NULL, 'คู่มือการกรอกข้อมูลผู้สูญเสีย ปักหมุดสถานที่ตามใบมรณบัตร และการแนบเอกสาร กพ.4', '["เข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่หน่วย","กรอกข้อมูลผู้สูญเสีย ตรวจสอบเลข ปชช. ไม่ให้ซ้ำซ้อน","ปักหมุดพิกัดสถานที่เกิดเหตุตามใบมรณบัตร","อัปโหลดเอกสารประกอบ 10 รายการ"]'::jsonb, NULL, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO videos (id, title, role, url, duration, category, description, steps, uploaded_by, created_at)
VALUES ('vid-2', 'ขั้นตอนที่ 2: การตรวจเอกสารหลักฐาน และการตีกลับพร้อมคอมเมนต์', 'สำหรับ กสพ.กพ.ทบ. (เจ้าหน้าที่ตรวจสอบ)', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', '3:45 นาที', NULL, 'การตรวจสอบเอกสาร 10 รายการ การบันทึกผลผ่าน/ตีกลับให้แก้ไข และการเสนอ จก.กพ.ทบ.', '["เปิดรายการคำร้องที่หน่วยเสนอเรื่อง","ตรวจความสมบูรณ์ของเอกสารแต่ละรายการ","บันทึกข้อคิดเห็นกรณีให้แก้ไข","ส่งต่อเรื่องให้ผู้บังคับบัญชาอนุมัติ"]'::jsonb, NULL, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO videos (id, title, role, url, duration, category, description, steps, uploaded_by, created_at)
VALUES ('vid-3', 'ขั้นตอนที่ 3 & 4: การอนุมัติของผู้บังคับบัญชา และการโอนเงินของบริษัทประกันภัย', 'สำหรับ จก.กพ.ทบ. และ บริษัทประกันภัย', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', '3:10 นาที', NULL, 'การลงนามอนุมัติในระบบ และการตรวจสอบจ่ายเงินสินไหม 60,000 หรือ 300,000 บาท', '["จก.กพ.ทบ. พิจารณาลงนามอนุมัติ","ส่งเรื่องอัตโนมัติไปยัง บ.ประกันภัย","บ.ประกันภัย โอนเงินเข้าบัญชีทายาทพร้อมแนบสลิป","แจ้งเตือนสถานะทันทีบน Telegram"]'::jsonb, NULL, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO videos (id, title, role, url, duration, category, description, steps, uploaded_by, created_at)
VALUES ('vid-4', 'ขั้นตอนที่ 5: การติดตาม SLA 30 วัน และการรายงานชี้แจงความล่าช้า', 'สำหรับทุกหน่วยงาน และ สก.ทบ. รับทราบยอด', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', '2:50 นาที', NULL, 'การควบคุมกรอบเวลา SLA 30 วัน เตือนล่วงหน้า 7 วัน และการแนบหนังสือชี้แจงเหตุผล', '["ระบบตรวจนับจำนวนวันอัตโนมัติ","แจ้งเตือนสีส้มเมื่อเหลือ 7 วัน","ล็อคเตือนสีแดงเมื่อเกิน 30 วัน บังคับให้หน่วยชี้แจง","สก.ทบ. รับทราบยอดปิดเคส"]'::jsonb, NULL, '2026-11-11T07:01:23.742Z')
ON CONFLICT (id) DO NOTHING;

-- 9. การตั้งค่าห้วงการสอบ
INSERT INTO system_settings (key, value) VALUES ('exam_settings', '{"isExamPeriodActive":false,"updatedAt":"2026-11-11T02:39:20.537Z","updatedBy":"ระบบส่วนกลาง"}'::jsonb) ON CONFLICT (key) DO NOTHING;

COMMIT;
