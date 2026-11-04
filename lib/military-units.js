// lib/military-units.js
// โครงสร้างสายการบังคับบัญชาหน่วยทหาร กองทัพบก (Royal Thai Army Organizational Structure)
// แบ่งออกเป็น 3 ระดับหลัก:
// 1. ระดับ ทบ. (ทภ.1 - 4, นสศ., นปอ., ยศ.ทบ. และส่วนกลาง/นขต.ทบ.)
// 2. ระดับ กองพล / มณฑลทหารบก (พล.1 รอ., พล.ร.2 รอ., พล.ร.3, พล.ร.4, พล.ร.5, พล.ร.15, พล.ร.9, มทบ. ต่างๆ)
// 3. ระดับ กรม หรือ กองพัน (เช่น ร.2 รอ., ร.2 พัน.1 รอ., ร.12 รอ., ร.21 รอ. และอื่นๆ ทั้งหมด)

export const ARMY_LEVELS = [
  { id: 'LEVEL1', code: 1, label: '1. ระดับ ทบ. / บชร. / กองทัพภาค', shortLabel: 'ระดับ ทบ.' },
  { id: 'LEVEL2', code: 2, label: '2. ระดับ กองพล / มณฑลทหารบก (มทบ.)', shortLabel: 'ระดับ กองพล' },
  { id: 'LEVEL3', code: 3, label: '3. ระดับ กรม หรือ กองพัน', shortLabel: 'ระดับ กรม/กองพัน' }
];

export const INITIAL_MILITARY_UNITS = [
  // ==========================================
  // ระดับ 1: ระดับ ทบ. / กองทัพภาค / นขต.ทบ.
  // ==========================================
  {
    id: '1st_ARMY',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'ทภ.1',
    name: 'กองทัพภาคที่ 1 (ทภ.1)',
    shortName: 'ทภ.1',
    type: 'ARMY_REGION',
    province: 'กรุงเทพมหานคร',
    locationName: 'บก.ทภ.1 ถ.ราชดำเนินนอก',
    lat: 13.7651,
    lng: 100.5085,
    rtaPhone: '91001',
    phone: '02-281-7500',
    parentId: null,
    status: 'ACTIVE'
  },
  {
    id: '2nd_ARMY',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'ทภ.2',
    name: 'กองทัพภาคที่ 2 (ทภ.2)',
    shortName: 'ทภ.2',
    type: 'ARMY_REGION',
    province: 'นครราชสีมา',
    locationName: 'ค่ายสุรนารี ต.หนองไผ่ล้อม',
    lat: 14.9738,
    lng: 102.0837,
    rtaPhone: '92001',
    phone: '044-245-001',
    parentId: null,
    status: 'ACTIVE'
  },
  {
    id: '3rd_ARMY',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'ทภ.3',
    name: 'กองทัพภาคที่ 3 (ทภ.3)',
    shortName: 'ทภ.3',
    type: 'ARMY_REGION',
    province: 'พิษณุโลก',
    locationName: 'ค่ายสมเด็จพระนเรศวรมหาราช',
    lat: 16.8211,
    lng: 100.2659,
    rtaPhone: '93001',
    phone: '055-245-001',
    parentId: null,
    status: 'ACTIVE'
  },
  {
    id: '4th_ARMY',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'ทภ.4',
    name: 'กองทัพภาคที่ 4 (ทภ.4)',
    shortName: 'ทภ.4',
    type: 'ARMY_REGION',
    province: 'นครศรีธรรมราช',
    locationName: 'ค่ายวชิราวุธ ต.ปากพูน',
    lat: 8.4304,
    lng: 99.9631,
    rtaPhone: '94001',
    phone: '075-383-001',
    parentId: null,
    status: 'ACTIVE'
  },
  {
    id: 'SWC_RTA',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'นสศ.',
    name: 'หน่วยบัญชาการสงครามพิเศษ (นสศ.)',
    shortName: 'นสศ.',
    type: 'COMMAND',
    province: 'ลพบุรี',
    locationName: 'ค่ายสมเด็จพระนารายณ์มหาราช',
    lat: 14.7995,
    lng: 100.6534,
    rtaPhone: '95001',
    phone: '036-412-101',
    parentId: null,
    status: 'ACTIVE'
  },
  {
    id: 'AADC_RTA',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'นปอ.',
    name: 'หน่วยบัญชาการป้องกันภัยทางอากาศกองทัพบก (นปอ.)',
    shortName: 'นปอ.',
    type: 'COMMAND',
    province: 'กรุงเทพมหานคร',
    locationName: 'บก.นปอ. แขวงสีกัน ดอนเมือง',
    lat: 13.8821,
    lng: 100.5902,
    rtaPhone: '96001',
    phone: '02-531-1001',
    parentId: null,
    status: 'ACTIVE'
  },
  {
    id: 'TRADOC_RTA',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'ยศ.ทบ.',
    name: 'กรมยุทธศึกษาทหารบก (ยศ.ทบ.)',
    shortName: 'ยศ.ทบ.',
    type: 'DIRECTORATE',
    province: 'กรุงเทพมหานคร',
    locationName: 'ยศ.ทบ. ถ.เทอดดำริ ดุสิต',
    lat: 13.7845,
    lng: 100.5283,
    rtaPhone: '97001',
    phone: '02-241-4036',
    parentId: null,
    status: 'ACTIVE'
  },
  {
    id: 'KSP_RTA',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'กพ.ทบ.',
    name: 'กรมกำลังพลทหารบก (กพ.ทบ. / กสพ.ฯ)',
    shortName: 'กพ.ทบ.',
    type: 'HQ_STAFF',
    province: 'กรุงเทพมหานคร',
    locationName: 'บก.ทบ. ถ.ราชดำเนินนอก',
    lat: 13.7651,
    lng: 100.5085,
    rtaPhone: '97111',
    phone: '02-297-7000',
    parentId: null,
    status: 'ACTIVE'
  },
  {
    id: 'SK_RTA',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'สก.ทบ.',
    name: 'กรมสวัสดิการทหารบก (สก.ทบ.)',
    shortName: 'สก.ทบ.',
    type: 'DIRECTORATE',
    province: 'กรุงเทพมหานคร',
    locationName: 'สก.ทบ. เทเวศร์',
    lat: 13.7712,
    lng: 100.5032,
    rtaPhone: '97222',
    phone: '02-282-0141',
    parentId: null,
    status: 'ACTIVE'
  },
  {
    id: 'ORD_RTA',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'สพ.ทบ.',
    name: 'กรมสรรพาวุธทหารบก (สพ.ทบ.)',
    shortName: 'สพ.ทบ.',
    type: 'SERVICE',
    province: 'กรุงเทพมหานคร',
    locationName: 'สพ.ทบ. สะพานแดง',
    lat: 13.7923,
    lng: 100.5312,
    rtaPhone: '97333',
    phone: '02-241-2051',
    parentId: null,
    status: 'ACTIVE'
  },
  {
    id: 'TRANS_RTA',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'ขส.ทบ.',
    name: 'กรมการขนส่งทหารบก (ขส.ทบ.)',
    shortName: 'ขส.ทบ.',
    type: 'SERVICE',
    province: 'กรุงเทพมหานคร',
    parentId: null,
    status: 'ACTIVE'
  },
  {
    id: 'ENG_RTA',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'ช.ทบ.',
    name: 'กรมการทหารช่าง (ช.ทบ.)',
    shortName: 'ช.ทบ.',
    type: 'COMBAT_SUPPORT',
    province: 'ราชบุรี',
    parentId: null,
    status: 'ACTIVE'
  },
  {
    id: 'QM_RTA',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'พธ.ทบ.',
    name: 'กรมพลาธิการทหารบก (พธ.ทบ.)',
    shortName: 'พธ.ทบ.',
    type: 'SERVICE',
    province: 'นนทบุรี',
    parentId: null,
    status: 'ACTIVE'
  },
  {
    id: 'MED_RTA',
    level: 1,
    levelName: 'ระดับ ทบ.',
    code: 'พบ.ทบ.',
    name: 'กรมแพทย์ทหารบก (พบ.ทบ.)',
    shortName: 'พบ.ทบ.',
    type: 'SERVICE',
    province: 'กรุงเทพมหานคร',
    parentId: null,
    status: 'ACTIVE'
  },

  // ==========================================
  // ระดับ 2: ระดับ กองพล / มณฑลทหารบก
  // ==========================================
  // --- สังกัด ทภ.1 ---
  {
    id: '1st_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.1 รอ.',
    name: 'กองพลที่ 1 รักษาพระองค์ (พล.1 รอ.)',
    shortName: 'พล.1 รอ.',
    parentId: '1st_ARMY',
    province: 'กรุงเทพมหานคร',
    locationName: 'พล.1 รอ. ดุสิต',
    lat: 13.7725,
    lng: 100.5123,
    rtaPhone: '51001',
    status: 'ACTIVE'
  },
  {
    id: '2nd_INF_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.ร.2 รอ.',
    name: 'กองพลทหารราบที่ 2 รักษาพระองค์ (พล.ร.2 รอ. บูรพาพยัคฆ์)',
    shortName: 'พล.ร.2 รอ.',
    parentId: '1st_ARMY',
    province: 'ปราจีนบุรี',
    locationName: 'ค่ายพรหมโยธี ต.บ้านพระ',
    lat: 14.0509,
    lng: 101.3718,
    rtaPhone: '54001',
    status: 'ACTIVE'
  },
  {
    id: '9th_INF_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.ร.9',
    name: 'กองพลทหารราบที่ 9 (พล.ร.9 ค่ายสุรสีห์)',
    shortName: 'พล.ร.9',
    parentId: '1st_ARMY',
    province: 'กาญจนบุรี',
    locationName: 'ค่ายสุรสีห์ ต.ลาดหญ้า',
    lat: 14.0228,
    lng: 99.5328,
    rtaPhone: '59001',
    status: 'ACTIVE'
  },
  {
    id: '11th_INF_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.ร.11',
    name: 'กองพลทหารราบที่ 11 (พล.ร.11 สไตรเกอร์)',
    shortName: 'พล.ร.11',
    parentId: '1st_ARMY',
    province: 'ฉะเชิงเทรา',
    status: 'ACTIVE'
  },
  {
    id: '2nd_CAV_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.ม.2 รอ.',
    name: 'กองพลทหารม้าที่ 2 รักษาพระองค์ (พล.ม.2 รอ.)',
    shortName: 'พล.ม.2 รอ.',
    parentId: '1st_ARMY',
    province: 'กรุงเทพมหานคร',
    status: 'ACTIVE'
  },
  {
    id: 'DEV_DIV_1',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.พัฒนา 1',
    name: 'กองพลพัฒนาที่ 1 (พล.พัฒนา 1)',
    shortName: 'พล.พัฒนา 1',
    parentId: '1st_ARMY',
    province: 'ราชบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'MTB_11',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'มทบ.11',
    name: 'มณฑลทหารบกที่ 11 (มทบ.11)',
    shortName: 'มทบ.11',
    parentId: '1st_ARMY',
    province: 'กรุงเทพมหานคร',
    status: 'ACTIVE'
  },
  {
    id: 'MTB_12',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'มทบ.12',
    name: 'มณฑลทหารบกที่ 12 (มทบ.12)',
    shortName: 'มทบ.12',
    parentId: '1st_ARMY',
    province: 'ปราจีนบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'MTB_14',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'มทบ.14',
    name: 'มณฑลทหารบกที่ 14 (มทบ.14)',
    shortName: 'มทบ.14',
    parentId: '1st_ARMY',
    province: 'ชลบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'MTB_17',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'มทบ.17',
    name: 'มณฑลทหารบกที่ 17 (มทบ.17)',
    shortName: 'มทบ.17',
    parentId: '1st_ARMY',
    province: 'กาญจนบุรี',
    status: 'ACTIVE'
  },

  // --- สังกัด ทภ.2 ---
  {
    id: '3rd_INF_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.ร.3',
    name: 'กองพลทหารราบที่ 3 (พล.ร.3 ค่ายสุรนารี)',
    shortName: 'พล.ร.3',
    parentId: '2nd_ARMY',
    province: 'นครราชสีมา',
    status: 'ACTIVE'
  },
  {
    id: '6th_INF_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.ร.6',
    name: 'กองพลทหารราบที่ 6 (พล.ร.6)',
    shortName: 'พล.ร.6',
    parentId: '2nd_ARMY',
    province: 'ร้อยเอ็ด',
    status: 'ACTIVE'
  },
  {
    id: '3rd_CAV_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.ม.3',
    name: 'กองพลทหารม้าที่ 3 (พล.ม.3)',
    shortName: 'พล.ม.3',
    parentId: '2nd_ARMY',
    province: 'ขอนแก่น',
    status: 'ACTIVE'
  },
  {
    id: 'DEV_DIV_2',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.พัฒนา 2',
    name: 'กองพลพัฒนาที่ 2 (พล.พัฒนา 2)',
    shortName: 'พล.พัฒนา 2',
    parentId: '2nd_ARMY',
    province: 'นครราชสีมา',
    status: 'ACTIVE'
  },
  {
    id: 'MTB_21',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'มทบ.21',
    name: 'มณฑลทหารบกที่ 21 (มทบ.21)',
    shortName: 'มทบ.21',
    parentId: '2nd_ARMY',
    province: 'นครราชสีมา',
    status: 'ACTIVE'
  },
  {
    id: 'MTB_22',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'มทบ.22',
    name: 'มณฑลทหารบกที่ 22 (มทบ.22)',
    shortName: 'มทบ.22',
    parentId: '2nd_ARMY',
    province: 'อุบลราชธานี',
    status: 'ACTIVE'
  },

  // --- สังกัด ทภ.3 ---
  {
    id: '4th_INF_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.ร.4',
    name: 'กองพลทหารราบที่ 4 (พล.ร.4 ค่ายสมเด็จพระนเรศวรมหาราช)',
    shortName: 'พล.ร.4',
    parentId: '3rd_ARMY',
    province: 'พิษณุโลก',
    status: 'ACTIVE'
  },
  {
    id: '7th_INF_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.ร.7',
    name: 'กองพลทหารราบที่ 7 (พล.ร.7)',
    shortName: 'พล.ร.7',
    parentId: '3rd_ARMY',
    province: 'เชียงใหม่',
    status: 'ACTIVE'
  },
  {
    id: '1st_CAV_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.ม.1',
    name: 'กองพลทหารม้าที่ 1 (พล.ม.1)',
    shortName: 'พล.ม.1',
    parentId: '3rd_ARMY',
    province: 'เพชรบูรณ์',
    status: 'ACTIVE'
  },
  {
    id: 'DEV_DIV_3',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.พัฒนา 3',
    name: 'กองพลพัฒนาที่ 3 (พล.พัฒนา 3)',
    shortName: 'พล.พัฒนา 3',
    parentId: '3rd_ARMY',
    province: 'พิษณุโลก',
    status: 'ACTIVE'
  },
  {
    id: 'MTB_31',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'มทบ.31',
    name: 'มณฑลทหารบกที่ 31 (มทบ.31)',
    shortName: 'มทบ.31',
    parentId: '3rd_ARMY',
    province: 'นครสวรรค์',
    status: 'ACTIVE'
  },
  {
    id: 'MTB_33',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'มทบ.33',
    name: 'มณฑลทหารบกที่ 33 (มทบ.33)',
    shortName: 'มทบ.33',
    parentId: '3rd_ARMY',
    province: 'เชียงใหม่',
    status: 'ACTIVE'
  },

  // --- สังกัด ทภ.4 ---
  {
    id: '5th_INF_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.ร.5',
    name: 'กองพลทหารราบที่ 5 (พล.ร.5 ค่ายเทพสตรีศรีสุนทร)',
    shortName: 'พล.ร.5',
    parentId: '4th_ARMY',
    province: 'นครศรีธรรมราช',
    status: 'ACTIVE'
  },
  {
    id: '15th_INF_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.ร.15',
    name: 'กองพลทหารราบที่ 15 (พล.ร.15 ค่ายสมเด็จพระสุริโยทัย)',
    shortName: 'พล.ร.15',
    parentId: '4th_ARMY',
    province: 'ปัตตานี',
    status: 'ACTIVE'
  },
  {
    id: 'DEV_DIV_4',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.พัฒนา 4',
    name: 'กองพลพัฒนาที่ 4 (พล.พัฒนา 4)',
    shortName: 'พล.พัฒนา 4',
    parentId: '4th_ARMY',
    province: 'สงขลา',
    status: 'ACTIVE'
  },
  {
    id: 'MTB_41',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'มทบ.41',
    name: 'มณฑลทหารบกที่ 41 (มทบ.41)',
    shortName: 'มทบ.41',
    parentId: '4th_ARMY',
    province: 'นครศรีธรรมราช',
    status: 'ACTIVE'
  },
  {
    id: 'MTB_42',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'มทบ.42',
    name: 'มณฑลทหารบกที่ 42 (มทบ.42)',
    shortName: 'มทบ.42',
    parentId: '4th_ARMY',
    province: 'สงขลา',
    status: 'ACTIVE'
  },
  {
    id: 'MTB_46',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'มทบ.46',
    name: 'มณฑลทหารบกที่ 46 (มทบ.46 ปัตตานี)',
    shortName: 'มทบ.46',
    parentId: '4th_ARMY',
    province: 'ปัตตานี',
    status: 'ACTIVE'
  },

  // --- สังกัด นสศ. ---
  {
    id: '1st_SF_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.รพศ.1',
    name: 'กองพลรบพิเศษที่ 1 (พล.รพศ.1)',
    shortName: 'พล.รพศ.1',
    parentId: 'SWC_RTA',
    province: 'ลพบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'SF_CENTER',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'ศสพ.',
    name: 'ศูนย์สงครามพิเศษ (ศสพ.)',
    shortName: 'ศสพ.',
    parentId: 'SWC_RTA',
    province: 'ลพบุรี',
    status: 'ACTIVE'
  },

  // --- สังกัด นปอ. ---
  {
    id: 'AAD_DIV',
    level: 2,
    levelName: 'ระดับ กองพล',
    code: 'พล.ปตอ.',
    name: 'กองพลทหารต่อสู้อากาศยาน (พล.ปตอ.)',
    shortName: 'พล.ปตอ.',
    parentId: 'AADC_RTA',
    province: 'กรุงเทพมหานคร',
    status: 'ACTIVE'
  },

  // ==========================================
  // ระดับ 3: ระดับ กรม หรือ กองพัน
  // ==========================================
  // --- สังกัด พล.ร.2 รอ. (บูรพาพยัคฆ์) ---
  {
    id: 'R2_REG_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.2 รอ.',
    name: 'กรมทหารราบที่ 2 รักษาพระองค์ (ร.2 รอ.)',
    shortName: 'ร.2 รอ.',
    parentId: '2nd_INF_DIV',
    province: 'ปราจีนบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'R2_BN1_INF_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.2 พัน.1 รอ.',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 2 รักษาพระองค์ (ร.2 พัน.1 รอ.)',
    shortName: 'ร.2 พัน.1 รอ.',
    parentId: '2nd_INF_DIV',
    province: 'ปราจีนบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'R2_BN2_INF_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.2 พัน.2 รอ.',
    name: 'กองพันทหารราบที่ 2 กรมทหารราบที่ 2 รักษาพระองค์ (ร.2 พัน.2 รอ.)',
    shortName: 'ร.2 พัน.2 รอ.',
    parentId: '2nd_INF_DIV',
    province: 'ชลบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'R2_BN3_INF_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.2 พัน.3 รอ.',
    name: 'กองพันทหารราบที่ 3 กรมทหารราบที่ 2 รักษาพระองค์ (ร.2 พัน.3 รอ.)',
    shortName: 'ร.2 พัน.3 รอ.',
    parentId: '2nd_INF_DIV',
    province: 'สระแก้ว',
    status: 'ACTIVE'
  },
  {
    id: 'R12_REG_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.12 รอ.',
    name: 'กรมทหารราบที่ 12 รักษาพระองค์ (ร.12 รอ.)',
    shortName: 'ร.12 รอ.',
    parentId: '2nd_INF_DIV',
    province: 'สระแก้ว',
    status: 'ACTIVE'
  },
  {
    id: 'R12_BN1_INF_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.12 พัน.1 รอ.',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 12 รักษาพระองค์ (ร.12 พัน.1 รอ.)',
    shortName: 'ร.12 พัน.1 รอ.',
    parentId: '2nd_INF_DIV',
    province: 'สระแก้ว',
    status: 'ACTIVE'
  },
  {
    id: 'R12_BN2_INF_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.12 พัน.2 รอ.',
    name: 'กองพันทหารราบที่ 2 กรมทหารราบที่ 12 รักษาพระองค์ (ร.12 พัน.2 รอ.)',
    shortName: 'ร.12 พัน.2 รอ.',
    parentId: '2nd_INF_DIV',
    province: 'สระแก้ว',
    status: 'ACTIVE'
  },
  {
    id: 'R21_REG_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.21 รอ.',
    name: 'กรมทหารราบที่ 21 รักษาพระองค์ (ร.21 รอ. ทหารเสือราชินี)',
    shortName: 'ร.21 รอ.',
    parentId: '2nd_INF_DIV',
    province: 'ชลบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'R21_BN1_INF_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.21 พัน.1 รอ.',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 21 รักษาพระองค์ (ร.21 พัน.1 รอ.)',
    shortName: 'ร.21 พัน.1 รอ.',
    parentId: '2nd_INF_DIV',
    province: 'ชลบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'R21_BN2_INF_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.21 พัน.2 รอ.',
    name: 'กองพันทหารราบที่ 2 กรมทหารราบที่ 21 รักษาพระองค์ (ร.21 พัน.2 รอ.)',
    shortName: 'ร.21 พัน.2 รอ.',
    parentId: '2nd_INF_DIV',
    province: 'ชลบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'ART_REG_2',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ป.2 รอ.',
    name: 'กรมทหารปืนใหญ่ที่ 2 รักษาพระองค์ (ป.2 รอ.)',
    shortName: 'ป.2 รอ.',
    parentId: '2nd_INF_DIV',
    province: 'ปราจีนบุรี',
    status: 'ACTIVE'
  },

  // --- สังกัด พล.1 รอ. ---
  {
    id: 'R1_REG_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.1 รอ.',
    name: 'กรมทหารราบที่ 1 มหาดเล็กราชวัลลภรักษาพระองค์ (ร.1 รอ.)',
    shortName: 'ร.1 รอ.',
    parentId: '1st_DIV',
    province: 'กรุงเทพมหานคร',
    status: 'ACTIVE'
  },
  {
    id: 'R11_REG_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.11 รอ.',
    name: 'กรมทหารราบที่ 11 มหาดเล็กราชวัลลภรักษาพระองค์ (ร.11 รอ.)',
    shortName: 'ร.11 รอ.',
    parentId: '1st_DIV',
    province: 'กรุงเทพมหานคร',
    status: 'ACTIVE'
  },
  {
    id: 'R31_REG_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.31 รอ.',
    name: 'กรมทหารราบที่ 31 รักษาพระองค์ (ร.31 รอ. กองพลร่ม)',
    shortName: 'ร.31 รอ.',
    parentId: '1st_DIV',
    province: 'ลพบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'R31_BN1_KG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.31 พัน.1 รอ.',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 31 รักษาพระองค์ (ร.31 พัน.1 รอ.)',
    shortName: 'ร.31 พัน.1 รอ.',
    parentId: '1st_DIV',
    province: 'ลพบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'ART_REG_1',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ป.1 รอ.',
    name: 'กรมทหารปืนใหญ่ที่ 1 รักษาพระองค์ (ป.1 รอ.)',
    shortName: 'ป.1 รอ.',
    parentId: '1st_DIV',
    province: 'กรุงเทพมหานคร',
    status: 'ACTIVE'
  },

  // --- สังกัด พล.ร.9 (ค่ายสุรสีห์) ---
  {
    id: 'R9_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.9',
    name: 'กรมทหารราบที่ 9 (ร.9)',
    shortName: 'ร.9',
    parentId: '9th_INF_DIV',
    province: 'กาญจนบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'R9_BN1',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.9 พัน.1',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 9 (ร.9 พัน.1)',
    shortName: 'ร.9 พัน.1',
    parentId: '9th_INF_DIV',
    province: 'กาญจนบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'R9_BN2',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.9 พัน.2',
    name: 'กองพันทหารราบที่ 2 กรมทหารราบที่ 9 (ร.9 พัน.2)',
    shortName: 'ร.9 พัน.2',
    parentId: '9th_INF_DIV',
    province: 'กาญจนบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'R9_BN3',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.9 พัน.3',
    name: 'กองพันทหารราบที่ 3 กรมทหารราบที่ 9 (ร.9 พัน.3)',
    shortName: 'ร.9 พัน.3',
    parentId: '9th_INF_DIV',
    province: 'กาญจนบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'R19_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.19',
    name: 'กรมทหารราบที่ 19 (ร.19)',
    shortName: 'ร.19',
    parentId: '9th_INF_DIV',
    province: 'กาญจนบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'R19_BN1',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.19 พัน.1',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 19 (ร.19 พัน.1)',
    shortName: 'ร.19 พัน.1',
    parentId: '9th_INF_DIV',
    province: 'กาญจนบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'R29_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.29',
    name: 'กรมทหารราบที่ 29 (ร.29)',
    shortName: 'ร.29',
    parentId: '9th_INF_DIV',
    province: 'กาญจนบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'R29_BN1',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.29 พัน.1',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 29 (ร.29 พัน.1)',
    shortName: 'ร.29 พัน.1',
    parentId: '9th_INF_DIV',
    province: 'กาญจนบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'ART_REG_9',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ป.9',
    name: 'กรมทหารปืนใหญ่ที่ 9 (ป.9)',
    shortName: 'ป.9',
    parentId: '9th_INF_DIV',
    province: 'กาญจนบุรี',
    status: 'ACTIVE'
  },

  // --- สังกัด พล.ร.3 (ทภ.2) ---
  {
    id: 'R3_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.3',
    name: 'กรมทหารราบที่ 3 (ร.3)',
    shortName: 'ร.3',
    parentId: '3rd_INF_DIV',
    province: 'สกลนคร',
    status: 'ACTIVE'
  },
  {
    id: 'R3_BN1',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.3 พัน.1',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 3 (ร.3 พัน.1)',
    shortName: 'ร.3 พัน.1',
    parentId: '3rd_INF_DIV',
    province: 'นครพนม',
    status: 'ACTIVE'
  },
  {
    id: 'R8_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.8',
    name: 'กรมทหารราบที่ 8 (ร.8)',
    shortName: 'ร.8',
    parentId: '3rd_INF_DIV',
    province: 'ขอนแก่น',
    status: 'ACTIVE'
  },
  {
    id: 'R8_BN1',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.8 พัน.1',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 8 (ร.8 พัน.1)',
    shortName: 'ร.8 พัน.1',
    parentId: '3rd_INF_DIV',
    province: 'ขอนแก่น',
    status: 'ACTIVE'
  },
  {
    id: 'R13_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.13',
    name: 'กรมทหารราบที่ 13 (ร.13)',
    shortName: 'ร.13',
    parentId: '3rd_INF_DIV',
    province: 'อุดรธานี',
    status: 'ACTIVE'
  },

  // --- สังกัด พล.ร.4 (ทภ.3) ---
  {
    id: 'R4_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.4',
    name: 'กรมทหารราบที่ 4 (ร.4)',
    shortName: 'ร.4',
    parentId: '4th_INF_DIV',
    province: 'นครสวรรค์',
    status: 'ACTIVE'
  },
  {
    id: 'R4_BN1',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.4 พัน.1',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 4 (ร.4 พัน.1)',
    shortName: 'ร.4 พัน.1',
    parentId: '4th_INF_DIV',
    province: 'นครสวรรค์',
    status: 'ACTIVE'
  },
  {
    id: 'R14_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.14',
    name: 'กรมทหารราบที่ 14 (ร.14)',
    shortName: 'ร.14',
    parentId: '4th_INF_DIV',
    province: 'ตาก',
    status: 'ACTIVE'
  },

  // --- สังกัด พล.ร.5 (ทภ.4) ---
  {
    id: 'R5_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.5',
    name: 'กรมทหารราบที่ 5 (ร.5)',
    shortName: 'ร.5',
    parentId: '5th_INF_DIV',
    province: 'สงขลา',
    status: 'ACTIVE'
  },
  {
    id: 'R5_BN1',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.5 พัน.1',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 5 (ร.5 พัน.1)',
    shortName: 'ร.5 พัน.1',
    parentId: '5th_INF_DIV',
    province: 'สงขลา',
    status: 'ACTIVE'
  },
  {
    id: 'R15_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.15',
    name: 'กรมทหารราบที่ 15 (ร.15)',
    shortName: 'ร.15',
    parentId: '5th_INF_DIV',
    province: 'นครศรีธรรมราช',
    status: 'ACTIVE'
  },
  {
    id: 'R25_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.25',
    name: 'กรมทหารราบที่ 25 (ร.25)',
    shortName: 'ร.25',
    parentId: '5th_INF_DIV',
    province: 'สุราษฎร์ธานี',
    status: 'ACTIVE'
  },

  // --- สังกัด พล.ร.15 (ทภ.4 ค่ายสมเด็จพระสุริโยทัย) ---
  {
    id: 'R151_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.151',
    name: 'กรมทหารราบที่ 151 (ร.151)',
    shortName: 'ร.151',
    parentId: '15th_INF_DIV',
    province: 'นราธิวาส',
    status: 'ACTIVE'
  },
  {
    id: 'R151_BN1',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.151 พัน.1',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 151 (ร.151 พัน.1)',
    shortName: 'ร.151 พัน.1',
    parentId: '15th_INF_DIV',
    province: 'นราธิวาส',
    status: 'ACTIVE'
  },
  {
    id: 'R151_BN2',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.151 พัน.2',
    name: 'กองพันทหารราบที่ 2 กรมทหารราบที่ 151 (ร.151 พัน.2)',
    shortName: 'ร.151 พัน.2',
    parentId: '15th_INF_DIV',
    province: 'นราธิวาส',
    status: 'ACTIVE'
  },
  {
    id: 'R152_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.152',
    name: 'กรมทหารราบที่ 152 (ร.152)',
    shortName: 'ร.152',
    parentId: '15th_INF_DIV',
    province: 'ยะลา',
    status: 'ACTIVE'
  },
  {
    id: 'R152_BN1',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.152 พัน.1',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 152 (ร.152 พัน.1)',
    shortName: 'ร.152 พัน.1',
    parentId: '15th_INF_DIV',
    province: 'ยะลา',
    status: 'ACTIVE'
  },
  {
    id: 'R153_REG',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.153',
    name: 'กรมทหารราบที่ 153 (ร.153)',
    shortName: 'ร.153',
    parentId: '15th_INF_DIV',
    province: 'ปัตตานี',
    status: 'ACTIVE'
  },
  {
    id: 'R153_BN1',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ร.153 พัน.1',
    name: 'กองพันทหารราบที่ 1 กรมทหารราบที่ 153 (ร.153 พัน.1)',
    shortName: 'ร.153 พัน.1',
    parentId: '15th_INF_DIV',
    province: 'ปัตตานี',
    status: 'ACTIVE'
  },

  // --- หน่วยเฉพาะกิจ / กรมทหารพราน (ทภ.4) ---
  {
    id: 'RANGERS_REG_41',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'กรม ทพ.41',
    name: 'กรมทหารพรานที่ 41 (ทภ.4)',
    shortName: 'กรม ทพ.41',
    parentId: '4th_ARMY',
    province: 'ยะลา',
    status: 'ACTIVE'
  },
  {
    id: 'RANGERS_REG_42',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'กรม ทพ.42',
    name: 'กรมทหารพรานที่ 42 (ทภ.4)',
    shortName: 'กรม ทพ.42',
    parentId: '4th_ARMY',
    province: 'ปัตตานี',
    status: 'ACTIVE'
  },
  {
    id: 'RANGERS_REG_43',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'กรม ทพ.43',
    name: 'กรมทหารพรานที่ 43 (ทภ.4)',
    shortName: 'กรม ทพ.43',
    parentId: '4th_ARMY',
    province: 'ปัตตานี',
    status: 'ACTIVE'
  },
  {
    id: 'RANGERS_REG_45',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'กรม ทพ.45',
    name: 'กรมทหารพรานที่ 45 (ทภ.4)',
    shortName: 'กรม ทพ.45',
    parentId: '4th_ARMY',
    province: 'นราธิวาส',
    status: 'ACTIVE'
  },
  {
    id: 'RANGERS_REG_47',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'กรม ทพ.47',
    name: 'กรมทหารพรานที่ 47 (ทภ.4)',
    shortName: 'กรม ทพ.47',
    parentId: '4th_ARMY',
    province: 'ยะลา',
    status: 'ACTIVE'
  },

  // --- สังกัด นสศ. (พล.รพศ.1) ---
  {
    id: 'SF_REG_1',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'รพศ.1',
    name: 'กรมรบพิเศษที่ 1 (รพศ.1 ป่าหวาย)',
    shortName: 'รพศ.1',
    parentId: '1st_SF_DIV',
    province: 'ลพบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'SF_REG_2',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'รพศ.2',
    name: 'กรมรบพิเศษที่ 2 (รพศ.2)',
    shortName: 'รพศ.2',
    parentId: '1st_SF_DIV',
    province: 'ลพบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'SF_REG_3',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'รพศ.3',
    name: 'กรมรบพิเศษที่ 3 (รพศ.3)',
    shortName: 'รพศ.3',
    parentId: '1st_SF_DIV',
    province: 'ลพบุรี',
    status: 'ACTIVE'
  },
  {
    id: 'SF_REG_4',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'รพศ.4',
    name: 'กรมรบพิเศษที่ 4 (รพศ.4)',
    shortName: 'รพศ.4',
    parentId: '1st_SF_DIV',
    province: 'พิษณุโลก',
    status: 'ACTIVE'
  },

  // --- สังกัด นปอ. (พล.ปตอ.) ---
  {
    id: 'AAD_REG_1',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ปตอ.1',
    name: 'กรมทหารต่อสู้อากาศยานที่ 1 (ปตอ.1)',
    shortName: 'ปตอ.1',
    parentId: 'AAD_DIV',
    province: 'กรุงเทพมหานคร',
    status: 'ACTIVE'
  },
  {
    id: 'AAD_REG_2',
    level: 3,
    levelName: 'ระดับ กรม/กองพัน',
    code: 'ปตอ.2',
    name: 'กรมทหารต่อสู้อากาศยานที่ 2 (ปตอ.2)',
    shortName: 'ปตอ.2',
    parentId: 'AAD_DIV',
    province: 'กรุงเทพมหานคร',
    status: 'ACTIVE'
  }
];

// Helper Functions
export function getLevel1Units(units = INITIAL_MILITARY_UNITS) {
  return units.filter((u) => u.level === 1 && u.status !== 'INACTIVE');
}

export function getLevel2Units(parentId, units = INITIAL_MILITARY_UNITS) {
  if (!parentId) {
    return units.filter((u) => u.level === 2 && u.status !== 'INACTIVE');
  }
  return units.filter((u) => u.level === 2 && u.parentId === parentId && u.status !== 'INACTIVE');
}

export function getLevel3Units(parentId, units = INITIAL_MILITARY_UNITS) {
  if (!parentId) {
    return units.filter((u) => u.level === 3 && u.status !== 'INACTIVE');
  }
  return units.filter((u) => u.level === 3 && u.parentId === parentId && u.status !== 'INACTIVE');
}

export function findUnitById(id, units = INITIAL_MILITARY_UNITS) {
  return units.find((u) => u.id === id) || null;
}

export function getUnitBreadcrumb(unitId, units = INITIAL_MILITARY_UNITS) {
  const current = findUnitById(unitId, units);
  if (!current) return '';

  const path = [current.shortName || current.name];
  let parentId = current.parentId;

  while (parentId) {
    const parent = findUnitById(parentId, units);
    if (parent) {
      path.unshift(parent.shortName || parent.name);
      parentId = parent.parentId;
    } else {
      break;
    }
  }

  return path.join(' ➔ ');
}
