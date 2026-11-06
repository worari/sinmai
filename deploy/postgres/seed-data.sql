-- ข้อมูลเริ่มต้นสำหรับระบบสินไหม ทบ. (Seed Data จาก data-store.json)
BEGIN;

-- 1. โครงสร้างหน่วยทหาร
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('1st_ARMY', 'กองทัพภาคที่ 1 (ทภ.1)', 'ทภ.1', 'ทภ.1', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('2nd_ARMY', 'กองทัพภาคที่ 2 (ทภ.2)', 'ทภ.2', 'ทภ.2', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('3rd_ARMY', 'กองทัพภาคที่ 3 (ทภ.3)', 'ทภ.3', 'ทภ.3', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('4th_ARMY', 'กองทัพภาคที่ 4 (ทภ.4)', 'ทภ.4', 'ทภ.4', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('SWC_RTA', 'หน่วยบัญชาการสงครามพิเศษ (นสศ.)', 'นสศ.', 'นสศ.', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('AADC_RTA', 'หน่วยบัญชาการป้องกันภัยทางอากาศกองทัพบก (นปอ.)', 'นปอ.', 'นปอ.', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('TRADOC_RTA', 'กรมยุทธศึกษาทหารบก (ยศ.ทบ.)', 'ยศ.ทบ.', 'ยศ.ทบ.', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('KSP_RTA', 'กรมกำลังพลทหารบก (กพ.ทบ. / กสพ.ฯ)', 'กพ.ทบ.', 'กพ.ทบ.', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('SK_RTA', 'กรมสวัสดิการทหารบก (สก.ทบ.)', 'สก.ทบ.', 'สก.ทบ.', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('ORD_RTA', 'กรมสรรพาวุธทหารบก (สพ.ทบ.)', 'สพ.ทบ.', 'สพ.ทบ.', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('TRANS_RTA', 'กรมการขนส่งทหารบก (ขส.ทบ.)', 'ขส.ทบ.', 'ขส.ทบ.', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('ENG_RTA', 'กรมการทหารช่าง (ช.ทบ.)', 'ช.ทบ.', 'ช.ทบ.', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('QM_RTA', 'กรมพลาธิการทหารบก (พธ.ทบ.)', 'พธ.ทบ.', 'พธ.ทบ.', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('MED_RTA', 'กรมแพทย์ทหารบก (พบ.ทบ.)', 'พบ.ทบ.', 'พบ.ทบ.', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('1st_DIV', 'กองพลที่ 1 รักษาพระองค์ (พล.1 รอ.)', 'พล.1 รอ.', 'พล.1 รอ.', '1st_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('2nd_INF_DIV', 'กองพลทหารราบที่ 2 รักษาพระองค์ (พล.ร.2 รอ. บูรพาพยัคฆ์)', 'พล.ร.2 รอ.', 'พล.ร.2 รอ.', '1st_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('9th_INF_DIV', 'กองพลทหารราบที่ 9 (พล.ร.9 ค่ายสุรสีห์)', 'พล.ร.9', 'พล.ร.9', '1st_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('11th_INF_DIV', 'กองพลทหารราบที่ 11 (พล.ร.11 สไตรเกอร์)', 'พล.ร.11', 'พล.ร.11', '1st_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('2nd_CAV_DIV', 'กองพลทหารม้าที่ 2 รักษาพระองค์ (พล.ม.2 รอ.)', 'พล.ม.2 รอ.', 'พล.ม.2 รอ.', '1st_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('DEV_DIV_1', 'กองพลพัฒนาที่ 1 (พล.พัฒนา 1)', 'พล.พัฒนา 1', 'พล.พัฒนา 1', '1st_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('MTB_11', 'มณฑลทหารบกที่ 11 (มทบ.11)', 'มทบ.11', 'มทบ.11', '1st_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('MTB_12', 'มณฑลทหารบกที่ 12 (มทบ.12)', 'มทบ.12', 'มทบ.12', '1st_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('MTB_14', 'มณฑลทหารบกที่ 14 (มทบ.14)', 'มทบ.14', 'มทบ.14', '1st_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('MTB_17', 'มณฑลทหารบกที่ 17 (มทบ.17)', 'มทบ.17', 'มทบ.17', '1st_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('3rd_INF_DIV', 'กองพลทหารราบที่ 3 (พล.ร.3 ค่ายสุรนารี)', 'พล.ร.3', 'พล.ร.3', '2nd_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('6th_INF_DIV', 'กองพลทหารราบที่ 6 (พล.ร.6)', 'พล.ร.6', 'พล.ร.6', '2nd_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('3rd_CAV_DIV', 'กองพลทหารม้าที่ 3 (พล.ม.3)', 'พล.ม.3', 'พล.ม.3', '2nd_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('DEV_DIV_2', 'กองพลพัฒนาที่ 2 (พล.พัฒนา 2)', 'พล.พัฒนา 2', 'พล.พัฒนา 2', '2nd_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('MTB_21', 'มณฑลทหารบกที่ 21 (มทบ.21)', 'มทบ.21', 'มทบ.21', '2nd_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('MTB_22', 'มณฑลทหารบกที่ 22 (มทบ.22)', 'มทบ.22', 'มทบ.22', '2nd_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('4th_INF_DIV', 'กองพลทหารราบที่ 4 (พล.ร.4 ค่ายสมเด็จพระนเรศวรมหาราช)', 'พล.ร.4', 'พล.ร.4', '3rd_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('7th_INF_DIV', 'กองพลทหารราบที่ 7 (พล.ร.7)', 'พล.ร.7', 'พล.ร.7', '3rd_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('1st_CAV_DIV', 'กองพลทหารม้าที่ 1 (พล.ม.1)', 'พล.ม.1', 'พล.ม.1', '3rd_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('DEV_DIV_3', 'กองพลพัฒนาที่ 3 (พล.พัฒนา 3)', 'พล.พัฒนา 3', 'พล.พัฒนา 3', '3rd_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('MTB_31', 'มณฑลทหารบกที่ 31 (มทบ.31)', 'มทบ.31', 'มทบ.31', '3rd_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('MTB_33', 'มณฑลทหารบกที่ 33 (มทบ.33)', 'มทบ.33', 'มทบ.33', '3rd_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('5th_INF_DIV', 'กองพลทหารราบที่ 5 (พล.ร.5 ค่ายเทพสตรีศรีสุนทร)', 'พล.ร.5', 'พล.ร.5', '4th_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('15th_INF_DIV', 'กองพลทหารราบที่ 15 (พล.ร.15 ค่ายสมเด็จพระสุริโยทัย)', 'พล.ร.15', 'พล.ร.15', '4th_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('DEV_DIV_4', 'กองพลพัฒนาที่ 4 (พล.พัฒนา 4)', 'พล.พัฒนา 4', 'พล.พัฒนา 4', '4th_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('MTB_41', 'มณฑลทหารบกที่ 41 (มทบ.41)', 'มทบ.41', 'มทบ.41', '4th_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('MTB_42', 'มณฑลทหารบกที่ 42 (มทบ.42)', 'มทบ.42', 'มทบ.42', '4th_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('MTB_46', 'มณฑลทหารบกที่ 46 (มทบ.46 ปัตตานี)', 'มทบ.46', 'มทบ.46', '4th_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('1st_SF_DIV', 'กองพลรบพิเศษที่ 1 (พล.รพศ.1)', 'พล.รพศ.1', 'พล.รพศ.1', 'SWC_RTA', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('SF_CENTER', 'ศูนย์สงครามพิเศษ (ศสพ.)', 'ศสพ.', 'ศสพ.', 'SWC_RTA', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('AAD_DIV', 'กองพลทหารต่อสู้อากาศยาน (พล.ปตอ.)', 'พล.ปตอ.', 'พล.ปตอ.', 'AADC_RTA', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R2_REG_KG', 'กรมทหารราบที่ 2 รักษาพระองค์ (ร.2 รอ.)', 'ร.2 รอ.', 'ร.2 รอ.', '2nd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R2_BN1_INF_KG', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 2 รักษาพระองค์ (ร.2 พัน.1 รอ.)', 'ร.2 พัน.1 รอ.', 'ร.2 พัน.1 รอ.', '2nd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R2_BN2_INF_KG', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 2 รักษาพระองค์ (ร.2 พัน.2 รอ.)', 'ร.2 พัน.2 รอ.', 'ร.2 พัน.2 รอ.', '2nd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R2_BN3_INF_KG', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 2 รักษาพระองค์ (ร.2 พัน.3 รอ.)', 'ร.2 พัน.3 รอ.', 'ร.2 พัน.3 รอ.', '2nd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R12_REG_KG', 'กรมทหารราบที่ 12 รักษาพระองค์ (ร.12 รอ.)', 'ร.12 รอ.', 'ร.12 รอ.', '2nd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R12_BN1_INF_KG', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 12 รักษาพระองค์ (ร.12 พัน.1 รอ.)', 'ร.12 พัน.1 รอ.', 'ร.12 พัน.1 รอ.', '2nd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R12_BN2_INF_KG', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 12 รักษาพระองค์ (ร.12 พัน.2 รอ.)', 'ร.12 พัน.2 รอ.', 'ร.12 พัน.2 รอ.', '2nd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R21_REG_KG', 'กรมทหารราบที่ 21 รักษาพระองค์ (ร.21 รอ. ทหารเสือราชินี)', 'ร.21 รอ.', 'ร.21 รอ.', '2nd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R21_BN1_INF_KG', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 21 รักษาพระองค์ (ร.21 พัน.1 รอ.)', 'ร.21 พัน.1 รอ.', 'ร.21 พัน.1 รอ.', '2nd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R21_BN2_INF_KG', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 21 รักษาพระองค์ (ร.21 พัน.2 รอ.)', 'ร.21 พัน.2 รอ.', 'ร.21 พัน.2 รอ.', '2nd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('ART_REG_2', 'กรมทหารปืนใหญ่ที่ 2 รักษาพระองค์ (ป.2 รอ.)', 'ป.2 รอ.', 'ป.2 รอ.', '2nd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R1_REG_KG', 'กรมทหารราบที่ 1 มหาดเล็กราชวัลลภรักษาพระองค์ (ร.1 รอ.)', 'ร.1 รอ.', 'ร.1 รอ.', '1st_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R11_REG_KG', 'กรมทหารราบที่ 11 มหาดเล็กราชวัลลภรักษาพระองค์ (ร.11 รอ.)', 'ร.11 รอ.', 'ร.11 รอ.', '1st_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R31_REG_KG', 'กรมทหารราบที่ 31 รักษาพระองค์ (ร.31 รอ. กองพลร่ม)', 'ร.31 รอ.', 'ร.31 รอ.', '1st_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R31_BN1_KG', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 31 รักษาพระองค์ (ร.31 พัน.1 รอ.)', 'ร.31 พัน.1 รอ.', 'ร.31 พัน.1 รอ.', '1st_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('ART_REG_1', 'กรมทหารปืนใหญ่ที่ 1 รักษาพระองค์ (ป.1 รอ.)', 'ป.1 รอ.', 'ป.1 รอ.', '1st_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R9_REG', 'กรมทหารราบที่ 9 (ร.9)', 'ร.9', 'ร.9', '9th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R9_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 9 (ร.9 พัน.1)', 'ร.9 พัน.1', 'ร.9 พัน.1', '9th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R9_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 9 (ร.9 พัน.2)', 'ร.9 พัน.2', 'ร.9 พัน.2', '9th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R9_BN3', 'กองพันทหารราบที่ 3 กรมทหารราบที่ 9 (ร.9 พัน.3)', 'ร.9 พัน.3', 'ร.9 พัน.3', '9th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R19_REG', 'กรมทหารราบที่ 19 (ร.19)', 'ร.19', 'ร.19', '9th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R19_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 19 (ร.19 พัน.1)', 'ร.19 พัน.1', 'ร.19 พัน.1', '9th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R29_REG', 'กรมทหารราบที่ 29 (ร.29)', 'ร.29', 'ร.29', '9th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R29_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 29 (ร.29 พัน.1)', 'ร.29 พัน.1', 'ร.29 พัน.1', '9th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('ART_REG_9', 'กรมทหารปืนใหญ่ที่ 9 (ป.9)', 'ป.9', 'ป.9', '9th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R3_REG', 'กรมทหารราบที่ 3 (ร.3)', 'ร.3', 'ร.3', '3rd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R3_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 3 (ร.3 พัน.1)', 'ร.3 พัน.1', 'ร.3 พัน.1', '3rd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R8_REG', 'กรมทหารราบที่ 8 (ร.8)', 'ร.8', 'ร.8', '3rd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R8_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 8 (ร.8 พัน.1)', 'ร.8 พัน.1', 'ร.8 พัน.1', '3rd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R13_REG', 'กรมทหารราบที่ 13 (ร.13)', 'ร.13', 'ร.13', '3rd_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R4_REG', 'กรมทหารราบที่ 4 (ร.4)', 'ร.4', 'ร.4', '4th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R4_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 4 (ร.4 พัน.1)', 'ร.4 พัน.1', 'ร.4 พัน.1', '4th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R14_REG', 'กรมทหารราบที่ 14 (ร.14)', 'ร.14', 'ร.14', '4th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R5_REG', 'กรมทหารราบที่ 5 (ร.5)', 'ร.5', 'ร.5', '5th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R5_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 5 (ร.5 พัน.1)', 'ร.5 พัน.1', 'ร.5 พัน.1', '5th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R15_REG', 'กรมทหารราบที่ 15 (ร.15)', 'ร.15', 'ร.15', '5th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R25_REG', 'กรมทหารราบที่ 25 (ร.25)', 'ร.25', 'ร.25', '5th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R151_REG', 'กรมทหารราบที่ 151 (ร.151)', 'ร.151', 'ร.151', '15th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R151_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 151 (ร.151 พัน.1)', 'ร.151 พัน.1', 'ร.151 พัน.1', '15th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R151_BN2', 'กองพันทหารราบที่ 2 กรมทหารราบที่ 151 (ร.151 พัน.2)', 'ร.151 พัน.2', 'ร.151 พัน.2', '15th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R152_REG', 'กรมทหารราบที่ 152 (ร.152)', 'ร.152', 'ร.152', '15th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R152_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 152 (ร.152 พัน.1)', 'ร.152 พัน.1', 'ร.152 พัน.1', '15th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R153_REG', 'กรมทหารราบที่ 153 (ร.153)', 'ร.153', 'ร.153', '15th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('R153_BN1', 'กองพันทหารราบที่ 1 กรมทหารราบที่ 153 (ร.153 พัน.1)', 'ร.153 พัน.1', 'ร.153 พัน.1', '15th_INF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('RANGERS_REG_41', 'กรมทหารพรานที่ 41 (ทภ.4)', 'กรม ทพ.41', 'กรม ทพ.41', '4th_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('RANGERS_REG_42', 'กรมทหารพรานที่ 42 (ทภ.4)', 'กรม ทพ.42', 'กรม ทพ.42', '4th_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('RANGERS_REG_43', 'กรมทหารพรานที่ 43 (ทภ.4)', 'กรม ทพ.43', 'กรม ทพ.43', '4th_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('RANGERS_REG_45', 'กรมทหารพรานที่ 45 (ทภ.4)', 'กรม ทพ.45', 'กรม ทพ.45', '4th_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('RANGERS_REG_47', 'กรมทหารพรานที่ 47 (ทภ.4)', 'กรม ทพ.47', 'กรม ทพ.47', '4th_ARMY', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('SF_REG_1', 'กรมรบพิเศษที่ 1 (รพศ.1 ป่าหวาย)', 'รพศ.1', 'รพศ.1', '1st_SF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('SF_REG_2', 'กรมรบพิเศษที่ 2 (รพศ.2)', 'รพศ.2', 'รพศ.2', '1st_SF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('SF_REG_3', 'กรมรบพิเศษที่ 3 (รพศ.3)', 'รพศ.3', 'รพศ.3', '1st_SF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('SF_REG_4', 'กรมรบพิเศษที่ 4 (รพศ.4)', 'รพศ.4', 'รพศ.4', '1st_SF_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('AAD_REG_1', 'กรมทหารต่อสู้อากาศยานที่ 1 (ปตอ.1)', 'ปตอ.1', 'ปตอ.1', 'AAD_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO military_units (id, name, short_name, code, parent_id, region)
VALUES ('AAD_REG_2', 'กรมทหารต่อสู้อากาศยานที่ 2 (ปตอ.2)', 'ปตอ.2', 'ปตอ.2', 'AAD_DIV', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. ผู้ใช้งานระบบ
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, status, is_active, created_at)
VALUES ('usr-unit-1', '1100500123456', 'ร.อ.', 'สมหมาย', 'กล้าหาญ', 'นายทหารธุรการและกำลังพล', '9th_INF_DIV', 'กองพลทหารราบที่ 9 (พล.ร.9)', '081-234-5678', 'unit.officer@army.mil.th', 'password123', 'UNIT_OFFICER', 'APPROVED', TRUE, '2026-11-06T13:51:19.215Z')
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, status, is_active, created_at)
VALUES ('usr-unit-2', '1100500987654', 'พ.ต.', 'ยุทธนา', 'มีชัย', 'นายทหารกำลังพล', 'RANGERS_REG_41', 'กรมทหารพรานที่ 41 (ทภ.4)', '089-876-5432', 'ranger41@army.mil.th', 'password123', 'UNIT_OFFICER', 'APPROVED', TRUE, '2026-11-06T13:51:19.218Z')
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, status, is_active, created_at)
VALUES ('usr-ksp-1', '1100500778899', 'พ.ท.', 'อภิสิทธิ์', 'กสพการ', 'ประจำ กสพ.กพ.ทบ.', 'KSP_RTA', 'กรมกำลังพลทหารบก (กสพ.ฯ)', '02-297-7000', 'ksp.rta@army.mil.th', 'password123', 'KSP_OFFICER', 'APPROVED', TRUE, '2026-11-06T13:51:19.218Z')
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, status, is_active, created_at)
VALUES ('usr-cmd-1', '1100500554433', 'พล.ท.', 'พงศกร', 'จิราภรณ์', 'เจ้ากรมกำลังพลทหารบก (จก.กพ.ทบ.)', 'KSP_RTA', 'บก.ทบ. / กรมกำลังพลทหารบก', '02-297-7111', 'commander@army.mil.th', 'password123', 'COMMANDER', 'APPROVED', TRUE, '2026-11-06T13:51:19.218Z')
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, status, is_active, created_at)
VALUES ('usr-ins-1', '1100500223344', 'นาย', 'วิชัย', 'คุ้มครองภัย', 'ผู้จัดการฝ่ายสินไหมทดแทนภาครัฐ', 'INSURANCE_CO', 'บริษัท ทิพยประกันภัย จำกัด (มหาชน)', '02-123-4567', 'insurance@insurance.co.th', 'password123', 'INSURANCE_REP', 'APPROVED', TRUE, '2026-11-06T13:51:19.218Z')
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, status, is_active, created_at)
VALUES ('usr-sk-1', '1100500998877', 'พ.อ.', 'ธนากร', 'สวัสดิ์ทบ', 'หัวหน้าแผนกสงเคราะห์ สก.ทบ.', 'SK_RTA', 'กรมสวัสดิการทหารบก (สก.ทบ.)', '02-281-5555', 'sk.rta@army.mil.th', 'password123', 'SK_OFFICER', 'APPROVED', TRUE, '2026-11-06T13:51:19.218Z')
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, status, is_active, created_at)
VALUES ('usr-admin-1', '1100500001122', 'พ.อ.', 'ชนินทร์', 'ปฏิบัติการ', 'ผู้ดูแลระบบส่วนกลาง', 'KSP_RTA', 'ศูนย์เทคโนโลยีสารสนเทศ ทบ.', '02-297-8000', 'admin@army.mil.th', 'password123', 'ADMIN', 'APPROVED', TRUE, '2026-11-06T13:51:19.218Z')
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, status, is_active, created_at)
VALUES ('usr-pending-1', '1100500889911', 'ร.ท.', 'วีรชัย', 'ใจหาญ', 'นายทหารส่งกำลังบำรุง', 'MTB_11', 'มณฑลทหารบกที่ 11 (มทบ.11)', '085-112-3344', 'veerachai@army.mil.th', 'password123', 'UNIT_OFFICER', 'PENDING', FALSE, '2026-11-05T08:30:00.000Z')
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO users (id, citizen_id, rank, first_name, last_name, position, unit_id, unit_name, phone, email, password, role, status, is_active, created_at)
VALUES ('usr-pending-2', '1100500667788', 'พ.ต.', 'ณัฐพล', 'มั่นคง', 'ประจำแผนกกำลังพล', 'KSP_RTA', 'กรมกำลังพลทหารบก (กสพ.ฯ)', '089-554-1122', 'nattapon.ksp@army.mil.th', 'password123', 'KSP_OFFICER', 'PENDING', FALSE, '2026-11-06T02:15:00.000Z')
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, status = EXCLUDED.status;

-- 3. รายการคำร้องสินไหม
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2026-0001', 'ทบ-กพ-67/012', 'usr-unit-1', 'ร.อ. สมหมาย กล้าหาญ', '9th_INF_DIV', 'กองพลทหารราบที่ 9 (พล.ร.9)', 'UNDER_REVIEW', 30, '3100500112233', 'ส.อ.', 'ประวิทย์', 'มั่นคง', NULL, 300000, '[{"index":1,"name":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","uploaded":true,"fileName":"doc_1_attached.pdf","fileUrl":"/uploads/sample_1.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":2,"name":"ใบมรณบัตร","uploaded":true,"fileName":"doc_2_attached.pdf","fileUrl":"/uploads/sample_2.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":3,"name":"รายงานการสอบสวนข้อเท็จจริงของหน่วย","uploaded":true,"fileName":"doc_3_attached.pdf","fileUrl":"/uploads/sample_3.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":4,"name":"หนังสือแสดงเจตนาทายาทรับเงินสินไหมทดแทน","uploaded":true,"fileName":"doc_4_attached.pdf","fileUrl":"/uploads/sample_4.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":5,"name":"สำเนาบัตร ปชช. และทะเบียนบ้านผู้รับเงิน","uploaded":true,"fileName":"doc_5_attached.pdf","fileUrl":"/uploads/sample_5.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":6,"name":"ใบรับรองแพทย์","uploaded":true,"fileName":"doc_6_attached.pdf","fileUrl":"/uploads/sample_6.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":7,"name":"คำสั่งปลดพ้นหรือปลดออกจากราชการ","uploaded":true,"fileName":"doc_7_attached.pdf","fileUrl":"/uploads/sample_7.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":8,"name":"หลักฐานพิสูจน์ระดับสารเสพติดหรือแอลกอฮอล์ในเลือด","uploaded":true,"fileName":"doc_8_attached.pdf","fileUrl":"/uploads/sample_8.pdf","status":"REJECTED","comment":"ผลตรวจระดับแอลกอฮอล์ยังไม่ระบุตราประทับแพทย์ กรุณาส่งฉบับจริง"},{"index":9,"name":"ผลการสอบสวนของเจ้าหน้าที่ตำรวจ (กรณีตายผิดธรรมชาติ)","uploaded":true,"fileName":"doc_9_attached.pdf","fileUrl":"/uploads/sample_9.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"},{"index":10,"name":"รูปถ่ายขนาด 4x6 นิ้ว","uploaded":true,"fileName":"doc_10_attached.pdf","fileUrl":"/uploads/sample_10.pdf","status":"VERIFIED","comment":"เอกสารถูกต้องครบถ้วน"}]'::jsonb, '[]'::jsonb, '2026-10-31T09:56:30.340Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2026-0002', 'ทบ-กพ-67/008', 'usr-unit-2', 'พ.ต. ยุทธนา มีชัย', 'RANGERS_REG_41', 'กรมทหารพรานที่ 41', 'PAID', 30, '1909800223344', 'อส.ทพ.', 'เดชา', 'แสงสุข', NULL, 300000, '[{"index":1,"name":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","uploaded":true,"fileName":"doc_1_signed.pdf","fileUrl":"/uploads/sample_1.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":2,"name":"ใบมรณบัตร","uploaded":true,"fileName":"doc_2_signed.pdf","fileUrl":"/uploads/sample_2.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":3,"name":"รายงานการสอบสวนข้อเท็จจริงของหน่วย","uploaded":true,"fileName":"doc_3_signed.pdf","fileUrl":"/uploads/sample_3.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":4,"name":"หนังสือแสดงเจตนาทายาทรับเงินสินไหมทดแทน","uploaded":true,"fileName":"doc_4_signed.pdf","fileUrl":"/uploads/sample_4.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":5,"name":"สำเนาบัตร ปชช. และทะเบียนบ้านผู้รับเงิน","uploaded":true,"fileName":"doc_5_signed.pdf","fileUrl":"/uploads/sample_5.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":6,"name":"ใบรับรองแพทย์","uploaded":true,"fileName":"doc_6_signed.pdf","fileUrl":"/uploads/sample_6.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":7,"name":"คำสั่งปลดพ้นหรือปลดออกจากราชการ","uploaded":true,"fileName":"doc_7_signed.pdf","fileUrl":"/uploads/sample_7.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":8,"name":"หลักฐานพิสูจน์ระดับสารเสพติดหรือแอลกอฮอล์ในเลือด","uploaded":true,"fileName":"doc_8_signed.pdf","fileUrl":"/uploads/sample_8.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":9,"name":"ผลการสอบสวนของเจ้าหน้าที่ตำรวจ (กรณีตายผิดธรรมชาติ)","uploaded":true,"fileName":"doc_9_signed.pdf","fileUrl":"/uploads/sample_9.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"},{"index":10,"name":"รูปถ่ายขนาด 4x6 นิ้ว","uploaded":true,"fileName":"doc_10_signed.pdf","fileUrl":"/uploads/sample_10.pdf","status":"VERIFIED","comment":"ผ่านการตรวจสอบ"}]'::jsonb, '[]'::jsonb, '2026-10-04T09:56:30.341Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2026-0003', 'ทบ-กพ-67/015', 'usr-unit-1', 'ร.อ. สมหมาย กล้าหาญ', '9th_INF_DIV', 'กองพลทหารราบที่ 9 (พล.ร.9)', 'SUBMITTED', 30, '1700100554422', 'พลทหาร', 'ธนกฤต', 'แก้ววิเชียร', NULL, 60000, '[{"index":1,"name":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","uploaded":true,"fileName":"doc_1.pdf","fileUrl":"/uploads/sample_1.pdf","status":"PENDING","comment":""},{"index":2,"name":"ใบมรณบัตร","uploaded":true,"fileName":"doc_2.pdf","fileUrl":"/uploads/sample_2.pdf","status":"PENDING","comment":""},{"index":3,"name":"รายงานการสอบสวนข้อเท็จจริงของหน่วย","uploaded":true,"fileName":"doc_3.pdf","fileUrl":"/uploads/sample_3.pdf","status":"PENDING","comment":""},{"index":4,"name":"หนังสือแสดงเจตนาทายาทรับเงินสินไหมทดแทน","uploaded":true,"fileName":"doc_4.pdf","fileUrl":"/uploads/sample_4.pdf","status":"PENDING","comment":""},{"index":5,"name":"สำเนาบัตร ปชช. และทะเบียนบ้านผู้รับเงิน","uploaded":true,"fileName":"doc_5.pdf","fileUrl":"/uploads/sample_5.pdf","status":"PENDING","comment":""},{"index":6,"name":"ใบรับรองแพทย์","uploaded":true,"fileName":"doc_6.pdf","fileUrl":"/uploads/sample_6.pdf","status":"PENDING","comment":""},{"index":7,"name":"คำสั่งปลดพ้นหรือปลดออกจากราชการ","uploaded":false,"fileName":"doc_7.pdf","fileUrl":"/uploads/sample_7.pdf","status":"PENDING","comment":""},{"index":8,"name":"หลักฐานพิสูจน์ระดับสารเสพติดหรือแอลกอฮอล์ในเลือด","uploaded":true,"fileName":"doc_8.pdf","fileUrl":"/uploads/sample_8.pdf","status":"PENDING","comment":""},{"index":9,"name":"ผลการสอบสวนของเจ้าหน้าที่ตำรวจ (กรณีตายผิดธรรมชาติ)","uploaded":false,"fileName":"doc_9.pdf","fileUrl":"/uploads/sample_9.pdf","status":"PENDING","comment":""},{"index":10,"name":"รูปถ่ายขนาด 4x6 นิ้ว","uploaded":false,"fileName":"doc_10.pdf","fileUrl":"/uploads/sample_10.pdf","status":"PENDING","comment":""}]'::jsonb, '[]'::jsonb, '2026-11-03T09:56:30.341Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2567-0001', 'ทบ-กพ-66/089', NULL, NULL, NULL, 'กองพลทหารราบที่ 9 (พล.ร.9)', 'PAID', 30, '3100500112201', 'ส.ต.', 'วิชาญ', 'คงกระพัน', NULL, 300000, '[]'::jsonb, '[]'::jsonb, '2023-10-18T08:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2567-0002', 'ทบ-กพ-66/102', NULL, NULL, NULL, 'กรมทหารพรานที่ 41', 'PAID', 30, '1909800223302', 'อส.ทพ.', 'สมศักดิ์', 'ศรีสวัสดิ์', NULL, 300000, '[]'::jsonb, '[]'::jsonb, '2023-12-08T09:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2567-0003', 'ทบ-กพ-67/018', NULL, NULL, NULL, 'กองพลทหารราบที่ 15', 'PAID', 30, '1700100554403', 'พลทหาร', 'มานพ', 'แสงทอง', NULL, 60000, '[]'::jsonb, '[]'::jsonb, '2024-02-14T10:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2567-0004', 'ทบ-กพ-67/045', NULL, NULL, NULL, 'กองพลทหารราบที่ 4', 'PAID', 30, '1100500123404', 'ร.ท.', 'เกียรติศักดิ์', 'วัฒนา', NULL, 300000, '[]'::jsonb, '[]'::jsonb, '2024-05-22T11:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2567-0005', 'ทบ-กพ-67/072', NULL, NULL, NULL, 'กองพลทหารราบที่ 2 รักษาพระองค์', 'PAID', 30, '3100500112205', 'จ.ส.อ.', 'บุญเลิศ', 'สุขใจ', NULL, 60000, '[]'::jsonb, '[]'::jsonb, '2024-08-16T14:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2568-0001', 'ทบ-กพ-67/110', NULL, NULL, NULL, 'กองพลทหารราบที่ 9 (พล.ร.9)', 'PAID', 30, '3100500112211', 'ส.อ.', 'อดุลย์', 'คงมั่น', NULL, 300000, '[]'::jsonb, '[]'::jsonb, '2024-10-15T09:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2568-0002', 'ทบ-กพ-67/125', NULL, NULL, NULL, 'กรมทหารพรานที่ 41', 'PAID', 30, '1909800223312', 'อส.ทพ.', 'ธนา', 'ภักดี', NULL, 300000, '[]'::jsonb, '[]'::jsonb, '2024-11-20T10:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2568-0003', 'ทบ-กพ-68/005', NULL, NULL, NULL, 'กองพลทหารราบที่ 3', 'PAID', 30, '1700100554413', 'พลทหาร', 'อนุสรณ์', 'คำดี', NULL, 60000, '[]'::jsonb, '[]'::jsonb, '2025-01-12T11:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2568-0004', 'ทบ-กพ-68/028', NULL, NULL, NULL, 'กองพลทหารราบที่ 15', 'PAID', 30, '1100500123414', 'ร.อ.', 'ปิยะ', 'หาญศึก', NULL, 300000, '[]'::jsonb, '[]'::jsonb, '2025-03-18T13:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2568-0005', 'ทบ-กพ-68/042', NULL, NULL, NULL, 'กองพลทหารราบที่ 4', 'PAID', 30, '3100500112215', 'ส.ต.', 'สุรเชษฐ์', 'บุญมี', NULL, 300000, '[]'::jsonb, '[]'::jsonb, '2025-05-14T09:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2568-0006', 'ทบ-กพ-68/065', NULL, NULL, NULL, 'กองพลทหารราบที่ 6', 'PAID', 30, '1700100554416', 'พลทหาร', 'ธีระพงษ์', 'จิตมั่น', NULL, 60000, '[]'::jsonb, '[]'::jsonb, '2025-07-22T14:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2568-0007', 'ทบ-กพ-68/088', NULL, NULL, NULL, 'กรมทหารพรานที่ 45', 'PAID', 30, '1909800223317', 'อส.ทพ.', 'มนัส', 'แสงทอง', NULL, 300000, '[]'::jsonb, '[]'::jsonb, '2025-09-08T10:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2569-0001', 'ทบ-กพ-68/105', NULL, NULL, NULL, 'กองพลทหารราบที่ 9 (พล.ร.9)', 'PAID', 30, '3100500112221', 'ส.อ.', 'ประเสริฐ', 'แก้วงาม', NULL, 300000, '[]'::jsonb, '[]'::jsonb, '2025-10-14T09:15:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2569-0002', 'ทบ-กพ-68/118', NULL, NULL, NULL, 'กรมทหารพรานที่ 41', 'PAID', 30, '1909800223322', 'อส.ทพ.', 'กิตติพงษ์', 'วรสาร', NULL, 300000, '[]'::jsonb, '[]'::jsonb, '2025-11-18T10:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2569-0003', 'ทบ-กพ-68/132', NULL, NULL, NULL, 'กองพลทหารราบที่ 15', 'PAID', 30, '1700100554423', 'พลทหาร', 'ชัยวัฒน์', 'ศรีบุญ', NULL, 60000, '[]'::jsonb, '[]'::jsonb, '2025-12-22T14:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2569-0004', 'ทบ-กพ-69/012', NULL, NULL, NULL, 'กองพลทหารราบที่ 4', 'PAID', 30, '1100500123424', 'ร.ต.', 'วรภัทร', 'เด่นดวง', NULL, 300000, '[]'::jsonb, '[]'::jsonb, '2026-01-16T11:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2569-0005', 'ทบ-กพ-69/035', NULL, NULL, NULL, 'กองพลทหารราบที่ 5', 'PAID', 30, '3100500112225', 'ส.ต.', 'วีรยุทธ', 'ใจกล้า', NULL, 300000, '[]'::jsonb, '[]'::jsonb, '2026-03-12T13:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2569-0006', 'ทบ-กพ-69/052', NULL, NULL, NULL, 'กรมทหารพรานที่ 45', 'PAID', 30, '1909800223326', 'อส.ทพ.', 'พงษ์ศักดิ์', 'นาวา', NULL, 300000, '[]'::jsonb, '[]'::jsonb, '2026-04-20T10:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2569-0007', 'ทบ-กพ-69/068', NULL, NULL, NULL, 'กองพลทหารราบที่ 7', 'PAID', 30, '1700100554427', 'พลทหาร', 'ธนากร', 'คงเจริญ', NULL, 60000, '[]'::jsonb, '[]'::jsonb, '2026-06-15T09:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO claims (id, tracking_code, reporter_id, reporter_name, unit_id, unit_name, status, sla_target_days, casualty_citizen_id, casualty_rank, casualty_first_name, casualty_last_name, incident_date, compensation_amount, documents, history, created_at)
VALUES ('CLM-2569-0008', 'ทบ-กพ-69/085', NULL, NULL, NULL, 'กองพลทหารราบที่ 2 รักษาพระองค์', 'PAID', 30, '3100500112228', 'จ.ส.ท.', 'สมปอง', 'ยอดเยี่ยม', NULL, 60000, '[]'::jsonb, '[]'::jsonb, '2026-07-28T15:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 4. ชุดแบบทดสอบความรู้
INSERT INTO knowledge_exams (id, title, description, category, passing_score, time_limit_minutes, question_count, randomize_questions, randomize_options, question_source, is_active, instructions, created_at)
VALUES ('exm-claims-basic', 'แบบทดสอบความรู้การใช้งานระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน', 'ทดสอบความเข้าใจเกี่ยวกับกระบวนการยื่นเสนอเรื่อง การจัดทำเอกสาร และการใช้งานระบบสำหรับเจ้าหน้าที่กำลังพล', 'ทั่วไป', 80, 30, 10, TRUE, TRUE, 'combined', TRUE, 'อ่านคู่มือและวิดีโอในคลังความรู้ก่อนเข้าทำแบบทดสอบ คะแนนเต็ม 100 ต้องได้คะแนนไม่ต่ำกว่า 80 คะแนนจึงผ่านและสามารถใช้งานระบบได้', '2026-11-06T09:56:30.341Z')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, passing_score = EXCLUDED.passing_score;

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

-- 7. ประวัติการสอบ
INSERT INTO exam_attempts (id, user_id, user_name, user_role, unit_name, exam_id, exam_title, score, percentage, passed, total_questions, correct_answers, answers, completed_at, time_spent_seconds)
VALUES ('att-1793966830113', 'usr-admin', 'แอดมินทดสอบ', 'USER', '-', 'exm-claims-basic', 'แบบทดสอบความรู้การใช้งานระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน', 0, 0, FALSE, 10, 0, '[{"questionId":"q-5","questionText":"คำร้องสถานะใดหมายถึงการโอนเงินสินไหมแล้ว?","selectedOptionId":"a","selectedOptionText":"SUBMITTED","correctOptionId":"c","correctOptionText":"PAID","isCorrect":false,"explanation":""},{"questionId":"q-10","questionText":"เมื่อผ่านแบบทดสอบแล้ว ผู้ใช้งานสามารถเข้าถึงเมนูใดเป็นอันดับแรก?","selectedOptionId":"a","selectedOptionText":"จัดการคู่มือและวิดีโอ","correctOptionId":"b","correctOptionText":"ยื่นเสนอเรื่องใหม่ / รายการคำร้อง / Dashboard ตามสิทธิบทบาท","isCorrect":false,"explanation":""},{"questionId":"q-3","questionText":"หากพบว่าเลขประจำตัวประชาชนผู้สูญเสียเคยมีการยื่นเรื่องในระบบแล้ว จะทำอย่างไร?","selectedOptionId":"a","selectedOptionText":"ยื่นเรื่องซ้ำได้เลย","correctOptionId":"b","correctOptionText":"ระบบจะป้องกันการยื่นซ้ำและแจ้งเลขอ้างอิงเดิม","isCorrect":false,"explanation":""},{"questionId":"q-4","questionText":"ใครเป็นผู้มีอำนาจอนุมัติคำร้องเสนอขอรับเงินสินไหมทดแทน?","selectedOptionId":"a","selectedOptionText":"เจ้าหน้าที่หน่วย (UNIT_OFFICER)","correctOptionId":"b","correctOptionText":"เจ้ากรมกำลังพลทหารบก (จก.กพ.ทบ.)","isCorrect":false,"explanation":""},{"questionId":"qb-1","questionText":"เอกสารหลักที่ต้องแนบในการยื่นเสนอเรื่องขอรับเงินสินไหมทดแทนคืออะไร?","selectedOptionId":"a","selectedOptionText":"สำเนาบัตรประชาชนผู้สูญเสีย","correctOptionId":"b","correctOptionText":"รายงาน กพ.4 (แบบรายงานการสูญเสียกำลังพล)","isCorrect":false,"explanation":""},{"questionId":"q-8","questionText":"หากยังไม่ผ่านการทดสอบความรู้ จะสามารถใช้งานฟังก์ชันหลักของระบบได้หรือไม่?","selectedOptionId":"a","selectedOptionText":"ใช้งานได้ตามปกติ","correctOptionId":"b","correctOptionText":"ใช้งานไม่ได้ จนกว่าจะผ่านการทดสอบ","isCorrect":false,"explanation":""},{"questionId":"q-6","questionText":"ผู้ใช้งานจะได้รับสิทธิใช้งานระบบเมื่อใด?","selectedOptionId":"a","selectedOptionText":"ทันทีหลังสมัครสมาชิก","correctOptionId":"b","correctOptionText":"เมื่อผ่านการทดสอบความรู้ในคลังความรู้","isCorrect":false,"explanation":""},{"questionId":"q-7","questionText":"คะแนนขั้นต่ำที่ต้องได้เพื่อผ่านแบบทดสอบความรู้คือเท่าใด?","selectedOptionId":"a","selectedOptionText":"50 คะแนน","correctOptionId":"c","correctOptionText":"80 คะแนน","isCorrect":false,"explanation":""},{"questionId":"q-9","questionText":"แบบทดสอบความรู้มีช่วงเวลาเปิดปิดหรือไม่?","selectedOptionId":"a","selectedOptionText":"ไม่มี เปิดสอบตลอดเวลา","correctOptionId":"b","correctOptionText":"มี ผู้ดูแลระบบกำหนดช่วงเปิด-ปิดให้ทำแบบทดสอบ","isCorrect":false,"explanation":""},{"questionId":"q-2","questionText":"ระยะเวลาระบุคำร้องสินไหมตามมาตรฐาน SLA คือกี่วัน?","selectedOptionId":"a","selectedOptionText":"15 วัน","correctOptionId":"b","correctOptionText":"30 วัน","isCorrect":false,"explanation":""}]'::jsonb, '2026-11-06T12:07:10.113Z', 45)
ON CONFLICT (id) DO NOTHING;

-- 8. ประวัติการใช้งาน (Audit Logs)
INSERT INTO activity_logs (id, user_id, user_name, user_role, action, action_badge, action_label, details, target_id, target_name, timestamp)
VALUES ('log-1793966830113-z9dc', 'usr-admin', 'แอดมินทดสอบ', 'USER', 'EXAM_ATTEMPT', 'amber', 'สอบไม่ผ่าน', 'แอดมินทดสอบ ทำแบบทดสอบ "แบบทดสอบความรู้การใช้งานระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน" ได้ 0% (0/10 ข้อ) - ✗ ไม่ผ่านเกณฑ์', 'exm-claims-basic', 'แบบทดสอบความรู้การใช้งานระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน', '2026-11-06T13:51:19.219Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, user_id, user_name, user_role, action, action_badge, action_label, details, target_id, target_name, timestamp)
VALUES ('log-1793962578192-2lyg', 'admin', 'ผู้ดูแลระบบ', 'ADMIN', 'DELETE_USER', 'red', 'ลบผู้ใช้งาน', 'ลบบัญชีผู้ใช้ ร.ท. ทดสอบ ระบบใหม่ ออกจากระบบถาวร', 'usr-1793962578186', 'ร.ท. ทดสอบ ระบบใหม่', '2026-11-06T13:51:19.219Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, user_id, user_name, user_role, action, action_badge, action_label, details, target_id, target_name, timestamp)
VALUES ('log-1793962578188-7dhd', 'usr-admin-1', 'พ.อ. ชนินทร์', 'ADMIN', 'APPROVE_USER', 'emerald', 'อนุมัติผู้ใช้งาน', 'อนุมัติการใช้งานบัญชี ร.ท. ทดสอบ ระบบใหม่ สังกัด กองพลทหารราบที่ 9 บทบาท: UNIT_OFFICER', 'usr-1793962578186', 'ร.ท. ทดสอบ ระบบใหม่', '2026-11-06T13:51:19.219Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, user_id, user_name, user_role, action, action_badge, action_label, details, target_id, target_name, timestamp)
VALUES ('log-1793962578186-tmbu', 'usr-1793962578186', 'ร.ท. ทดสอบ ระบบใหม่', 'UNIT_OFFICER', 'REGISTER', 'amber', 'ลงทะเบียนใหม่', 'ลงทะเบียนขอใช้งานระบบใหม่ สังกัด กองพลทหารราบที่ 9 (สถานะ: รอการอนุมัติ)', 'usr-1793962578186', 'ร.ท. ทดสอบ ระบบใหม่', '2026-11-06T13:51:19.219Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, user_id, user_name, user_role, action, action_badge, action_label, details, target_id, target_name, timestamp)
VALUES ('log-001', 'usr-admin-1', 'พ.อ. ชนินทร์ ปฏิบัติการ', 'ADMIN', 'SYSTEM_INIT', 'blue', 'เริ่มต้นระบบ', 'เริ่มต้นระบบและโหลดฐานข้อมูลผู้ใช้งานส่วนกลาง', NULL, NULL, '2026-11-06T13:51:19.219Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, user_id, user_name, user_role, action, action_badge, action_label, details, target_id, target_name, timestamp)
VALUES ('log-002', 'usr-admin-1', 'พ.อ. ชนินทร์ ปฏิบัติการ', 'ADMIN', 'APPROVE_USER', 'emerald', 'อนุมัติผู้ใช้งาน', 'อนุมัติการใช้งานบัญชี ร.อ. สมหมาย กล้าหาญ (พล.ร.9) กำหนดบทบาท เจ้าหน้าที่หน่วย', NULL, NULL, '2026-11-06T13:51:19.219Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, user_id, user_name, user_role, action, action_badge, action_label, details, target_id, target_name, timestamp)
VALUES ('log-003', 'usr-pending-1', 'ร.ท. วีรชัย ใจหาญ', 'UNIT_OFFICER', 'REGISTER', 'amber', 'ลงทะเบียนใหม่', 'ลงทะเบียนขอเข้าใช้งานระบบใหม่ สังกัด มทบ.11 (สถานะ: รอการอนุมัติ)', NULL, NULL, '2026-11-06T13:51:19.219Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, user_id, user_name, user_role, action, action_badge, action_label, details, target_id, target_name, timestamp)
VALUES ('log-004', 'usr-pending-2', 'พ.ต. ณัฐพล มั่นคง', 'KSP_OFFICER', 'REGISTER', 'amber', 'ลงทะเบียนใหม่', 'ลงทะเบียนขอเข้าใช้งานระบบใหม่ สังกัด กสพ.กพ.ทบ. (สถานะ: รอการอนุมัติ)', NULL, NULL, '2026-11-06T13:51:19.219Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO activity_logs (id, user_id, user_name, user_role, action, action_badge, action_label, details, target_id, target_name, timestamp)
VALUES ('log-005', 'usr-admin-1', 'พ.อ. ชนินทร์ ปฏิบัติการ', 'ADMIN', 'LOGIN', 'cyan', 'เข้าสู่ระบบ', 'เข้าสู่ระบบสำเร็จผ่านการยืนยันตัวตนระดับผู้ดูแลระบบ', NULL, NULL, '2026-11-06T13:51:19.219Z')
ON CONFLICT (id) DO NOTHING;

COMMIT;
