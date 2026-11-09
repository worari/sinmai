// lib/thai-address-data.js
// ฐานข้อมูลรายชื่อจังหวัด อำเภอ/เขต ตำบล/แขวง และสถานที่ราชการ/โรงพยาบาล/ค่ายทหาร ทบ.
// สำหรับระบบค้นหาและ Auto-complete พิกัดสถานที่เสียชีวิต/เกิดเหตุ

export const THAI_PROVINCES = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 
  'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 
  'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 
  'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 
  'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 
  'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 
  'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา', 
  'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 
  'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 
  'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 
  'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 
  'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 
  'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 
  'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 
  'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 
  'อุทัยธานี', 'อุบลราชธานี'
];

// สถานที่สำคัญทางการแพทย์ ทหาร และจุดเกิดเหตุสำคัญ (ค่ายทหาร, โรงพยาบาลทหาร/ศูนย์, ฐานปฏิบัติการ)
export const MILITARY_AND_HOSPITAL_LOCATIONS = [
  // --- กรุงเทพมหานครและปริมณฑล ---
  {
    name: 'กองบัญชาการกองทัพบก (บก.ทบ.)',
    category: 'หน่วยทหาร',
    street: 'ถ.ราชดำเนินนอก',
    subdistrict: 'บางขุนพรหม',
    district: 'พระนคร',
    province: 'กรุงเทพมหานคร',
    lat: 13.7651,
    lng: 100.5085
  },
  {
    name: 'โรงพยาบาลพระมงกุฎเกล้า',
    category: 'โรงพยาบาลทหาร',
    street: 'ถ.ราชวิถี',
    subdistrict: 'ทุ่งพญาไท',
    district: 'ราชเทวี',
    province: 'กรุงเทพมหานคร',
    lat: 13.7674,
    lng: 100.5348
  },
  {
    name: 'สถาบันพยาธิวิทยา ศูนย์อำนวยการแพทย์พระมงกุฎเกล้า',
    category: 'โรงพยาบาลทหาร',
    street: 'ถ.ราชวิถี',
    subdistrict: 'ทุ่งพญาไท',
    district: 'ราชเทวี',
    province: 'กรุงเทพมหานคร',
    lat: 13.7668,
    lng: 100.5335
  },
  {
    name: 'สถาบันนิติเวชวิทยา โรงพยาบาลตำรวจ',
    category: 'สถาบันนิติเวช',
    street: 'ถ.พระรามที่ 1',
    subdistrict: 'ปทุมวัน',
    district: 'ปทุมวัน',
    province: 'กรุงเทพมหานคร',
    lat: 13.7441,
    lng: 100.5375
  },
  {
    name: 'โรงพยาบาลทหารผ่านศึก',
    category: 'โรงพยาบาล',
    street: 'ถ.วิภาวดีรังสิต',
    subdistrict: 'สามเสนใน',
    district: 'พญาไท',
    province: 'กรุงเทพมหานคร',
    lat: 13.7745,
    lng: 100.5489
  },
  {
    name: 'มณฑลทหารบกที่ 11 (มทบ.11)',
    category: 'หน่วยทหาร',
    street: 'ถ.แจ้งวัฒนะ',
    subdistrict: 'ทุ่งสองห้อง',
    district: 'หลักสี่',
    province: 'กรุงเทพมหานคร',
    lat: 13.8885,
    lng: 100.5632
  },

  // --- กองทัพภาคที่ 1 (ภาคกลาง/ตะวันตก/ตะวันออก) ---
  {
    name: 'ค่ายสุรสีห์ (พล.ร.9 / รพ.ค่ายสุรสีห์)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.แสงชูโต',
    subdistrict: 'ลาดหญ้า',
    district: 'เมืองกาญจนบุรี',
    province: 'กาญจนบุรี',
    lat: 14.0228,
    lng: 99.5328
  },
  {
    name: 'โรงพยาบาลพหลพลพยุหเสนา',
    category: 'โรงพยาบาลศูนย์',
    street: 'ถ.แสงชูโต',
    subdistrict: 'ปากแพรก',
    district: 'เมืองกาญจนบุรี',
    province: 'กาญจนบุรี',
    lat: 14.0042,
    lng: 99.5492
  },
  {
    name: 'ค่ายพรหมโยธี (พล.ร.2 รอ. / รพ.ค่ายจักรพงษ์)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.สุวรรณศร',
    subdistrict: 'บ้านพระ',
    district: 'เมืองปราจีนบุรี',
    province: 'ปราจีนบุรี',
    lat: 14.0509,
    lng: 101.3718
  },
  {
    name: 'ค่ายสมเด็จพระนารายณ์มหาราช (รพ.อานันทมหิดล)',
    category: 'โรงพยาบาลทหาร',
    street: 'ถ.นเรศวร',
    subdistrict: 'เขาสามยอด',
    district: 'เมืองลพบุรี',
    province: 'ลพบุรี',
    lat: 14.8214,
    lng: 100.6558
  },
  {
    name: 'ค่ายอดิศร (ศม. / รพ.ค่ายอดิศร)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.พหลโยธิน',
    subdistrict: 'ปากเพรียว',
    district: 'เมืองสระบุรี',
    province: 'สระบุรี',
    lat: 14.5298,
    lng: 100.9101
  },
  {
    name: 'ค่ายภาณุรังษี (ช.ทบ. / รพ.ค่ายภาณุรังษี)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.มนตรีสุริยวงศ์',
    subdistrict: 'หน้าเมือง',
    district: 'เมืองราชบุรี',
    province: 'ราชบุรี',
    lat: 13.5358,
    lng: 99.8164
  },
  {
    name: 'ค่ายธนะรัชต์ (ศร. / รพ.ค่ายธนะรัชต์)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.เพชรเกษม',
    subdistrict: 'เขาน้อย',
    district: 'ปราณบุรี',
    province: 'ประจวบคีรีขันธ์',
    lat: 12.3965,
    lng: 99.9678
  },

  // --- กองทัพภาคที่ 2 (ภาคตะวันออกเฉียงเหนือ) ---
  {
    name: 'ค่ายสุรนารี (ทภ.2 / รพ.ค่ายสุรนารี)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.มิตรภาพ',
    subdistrict: 'หนองไผ่ล้อม',
    district: 'เมืองนครราชสีมา',
    province: 'นครราชสีมา',
    lat: 14.9738,
    lng: 102.0837
  },
  {
    name: 'โรงพยาบาลมหาราชนครราชสีมา',
    category: 'โรงพยาบาลศูนย์',
    street: 'ถ.ช้างเผือก',
    subdistrict: 'ในเมือง',
    district: 'เมืองนครราชสีมา',
    province: 'นครราชสีมา',
    lat: 14.9842,
    lng: 102.1091
  },
  {
    name: 'ค่ายสรรพสิทธิประสงค์ (รพ.ค่ายสรรพสิทธิประสงค์)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.สถลมาร์ค',
    subdistrict: 'แสนสุข',
    district: 'วารินชำราบ',
    province: 'อุบลราชธานี',
    lat: 15.1952,
    lng: 104.8624
  },
  {
    name: 'ค่ายประจักษ์ศิลปาคม (รพ.ค่ายประจักษ์ศิลปาคม)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.ทหาร',
    subdistrict: 'หมากแข้ง',
    district: 'เมืองอุดรธานี',
    province: 'อุดรธานี',
    lat: 17.3872,
    lng: 102.7951
  },
  {
    name: 'ค่ายกฤษณ์สีวะรา (รพ.ค่ายกฤษณ์สีวะรา)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.สกลนคร-กาฬสินธุ์',
    subdistrict: 'ธาตุเชิงชุม',
    district: 'เมืองสกลนคร',
    province: 'สกลนคร',
    lat: 17.1512,
    lng: 104.1481
  },

  // --- กองทัพภาคที่ 3 (ภาคเหนือ) ---
  {
    name: 'ค่ายสมเด็จพระนเรศวรมหาราช (ทภ.3 / รพ.ค่ายสมเด็จพระนเรศวรมหาราช)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.พิษณุโลก-หล่มสัก',
    subdistrict: 'บ้านคลอง',
    district: 'เมืองพิษณุโลก',
    province: 'พิษณุโลก',
    lat: 16.8285,
    lng: 100.2524
  },
  {
    name: 'ค่ายกาวิละ (มทบ.33 / รพ.ค่ายกาวิละ)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.เชียงใหม่-ลำพูน',
    subdistrict: 'วัดเกต',
    district: 'เมืองเชียงใหม่',
    province: 'เชียงใหม่',
    lat: 18.7883,
    lng: 99.0061
  },
  {
    name: 'โรงพยาบาลมหาราชนครเชียงใหม่ (รพ.สวนดอก)',
    category: 'โรงพยาบาลศูนย์',
    street: 'ถ.อินทวโรรส',
    subdistrict: 'ศรีภูมิ',
    district: 'เมืองเชียงใหม่',
    province: 'เชียงใหม่',
    lat: 18.7898,
    lng: 98.9742
  },
  {
    name: 'ค่ายจิรประวัติ (มทบ.31 / รพ.ค่ายจิรประวัติ)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.พหลโยธิน',
    subdistrict: 'นครสวรรค์ออก',
    district: 'เมืองนครสวรรค์',
    province: 'นครสวรรค์',
    lat: 15.6841,
    lng: 100.1294
  },
  {
    name: 'ค่ายสุรศักดิ์มนตรี (มทบ.32 / รพ.ค่ายสุรศักดิ์มนตรี)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.พหลโยธิน',
    subdistrict: 'พิชัย',
    district: 'เมืองลำปาง',
    province: 'ลำปาง',
    lat: 18.3091,
    lng: 99.5218
  },

  // --- กองทัพภาคที่ 4 และพื้นที่ จชต. (ภาคใต้ / พื้นที่เสี่ยงภัย) ---
  {
    name: 'ค่ายวชิราวุธ (ทภ.4 / รพ.ค่ายวชิราวุธ)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.ราชดำเนิน',
    subdistrict: 'ปากพูน',
    district: 'เมืองนครศรีธรรมราช',
    province: 'นครศรีธรรมราช',
    lat: 8.4875,
    lng: 99.9572
  },
  {
    name: 'ค่ายเสนาณรงค์ (มทบ.42 / รพ.ค่ายเสนาณรงค์)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.กาญจนวนิช',
    subdistrict: 'คอหงส์',
    district: 'หาดใหญ่',
    province: 'สงขลา',
    lat: 7.0254,
    lng: 100.4952
  },
  {
    name: 'โรงพยาบาลสงขลานครินทร์ (มอ. หาดใหญ่)',
    category: 'โรงพยาบาลศูนย์/มหาลัย',
    street: 'ถ.กาญจนวนิช',
    subdistrict: 'คอหงส์',
    district: 'หาดใหญ่',
    province: 'สงขลา',
    lat: 7.0086,
    lng: 100.4984
  },
  {
    name: 'ค่ายอิงคยุทธบริหาร (มทบ.46 / รพ.ค่ายอิงคยุทธบริหาร)',
    category: 'ค่ายทหาร/รพ.',
    street: 'ถ.เพชรเกษม',
    subdistrict: 'บ่อทอง',
    district: 'หนองจิก',
    province: 'ปัตตานี',
    lat: 6.7533,
    lng: 101.1764
  },
  {
    name: 'โรงพยาบาลปัตตานี',
    category: 'โรงพยาบาลศูนย์',
    street: 'ถ.หนองจิก',
    subdistrict: 'สะบารัง',
    district: 'เมืองปัตตานี',
    province: 'ปัตตานี',
    lat: 6.8642,
    lng: 101.2481
  },
  {
    name: 'โรงพยาบาลศูนย์ยะลา',
    category: 'โรงพยาบาลศูนย์',
    street: 'ถ.เทศบาล 1',
    subdistrict: 'สะเตง',
    district: 'เมืองยะลา',
    province: 'ยะลา',
    lat: 6.5411,
    lng: 101.2804
  },
  {
    name: 'ค่ายสิรินธร (กอ.รมน.ภาค 4 สน.)',
    category: 'ค่ายทหาร',
    street: 'ถ.สิโรรส',
    subdistrict: 'เขาตูม',
    district: 'ยะรัง',
    province: 'ปัตตานี',
    lat: 6.5054,
    lng: 101.2982
  },
  {
    name: 'โรงพยาบาลนราธิวาสราชนครินทร์',
    category: 'โรงพยาบาลศูนย์',
    street: 'ถ.ระแงะมรรคา',
    subdistrict: 'บางนาค',
    district: 'เมืองนราธิวาส',
    province: 'นราธิวาส',
    lat: 6.4255,
    lng: 101.8253
  },
  {
    name: 'ค่ายกัลยาณิวัฒนา (กรม ทพ.46)',
    category: 'ค่ายทหาร',
    street: 'ถ.ระแงะมรรคา',
    subdistrict: 'กะลุวอ',
    district: 'เมืองนราธิวาส',
    province: 'นราธิวาส',
    lat: 6.3812,
    lng: 101.8124
  },
  {
    name: 'โรงพยาบาลบันนังสตา',
    category: 'โรงพยาบาลชุมชน',
    street: 'ทล.410 (ยะลา-เบตง)',
    subdistrict: 'บันนังสตา',
    district: 'บันนังสตา',
    province: 'ยะลา',
    lat: 6.2625,
    lng: 101.2588
  },
  {
    name: 'โรงพยาบาลเบตง',
    category: 'โรงพยาบาลชุมชน',
    street: 'ถ.รัตนกิจ',
    subdistrict: 'เบตง',
    district: 'เบตง',
    province: 'ยะลา',
    lat: 5.7745,
    lng: 101.0712
  },
  {
    name: 'โรงพยาบาลระแงะ',
    category: 'โรงพยาบาลชุมชน',
    street: 'ทล.4055',
    subdistrict: 'ตันหยงมัส',
    district: 'ระแงะ',
    province: 'นราธิวาส',
    lat: 6.2941,
    lng: 101.7258
  },
  {
    name: 'โรงพยาบาลเจาะไอร้อง',
    category: 'โรงพยาบาลชุมชน',
    street: 'ทล.4055',
    subdistrict: 'จวบ',
    district: 'เจาะไอร้อง',
    province: 'นราธิวาส',
    lat: 6.2215,
    lng: 101.8492
  },
  {
    name: 'โรงพยาบาลสายบุรี (สมเด็จพระยุพราชสายบุรี)',
    category: 'โรงพยาบาลชุมชน',
    street: 'ถ.กลาพอ',
    subdistrict: 'ตะลุบัน',
    district: 'สายบุรี',
    province: 'ปัตตานี',
    lat: 6.7025,
    lng: 101.6184
  },
  {
    name: 'ฐานปฏิบัติการ ร้อย.ทพ.4101 (ฉก.ทพ.41)',
    category: 'ฐานปฏิบัติการ',
    street: 'ทล.410',
    subdistrict: 'ตาเนาะปูเต๊ะ',
    district: 'บันนังสตา',
    province: 'ยะลา',
    lat: 6.3152,
    lng: 101.2741
  },
  {
    name: 'ฐานปฏิบัติการ ร้อย.ทพ.4501 (ฉก.ทพ.45)',
    category: 'ฐานปฏิบัติการ',
    street: 'ทล.4055',
    subdistrict: 'บองอ',
    district: 'ระแงะ',
    province: 'นราธิวาส',
    lat: 6.2514,
    lng: 101.6982
  },
  {
    name: 'จุดตรวจความมั่นคงขุนไวย์ (เมืองยะลา)',
    category: 'จุดตรวจความมั่นคง',
    street: 'ถ.สิโรรส',
    subdistrict: 'สะเตงนอก',
    district: 'เมืองยะลา',
    province: 'ยะลา',
    lat: 6.5284,
    lng: 101.2912
  }
];

// รายการตำบล/อำเภอ/จังหวัด ตัวแทนพื้นที่สำคัญทั่วประเทศไทย สำหรับ Auto-complete
export const THAI_ADDRESS_DIRECTORY = [
  // ยะลา
  { subdistrict: 'สะเตง', district: 'เมืองยะลา', province: 'ยะลา', lat: 6.5411, lng: 101.2804 },
  { subdistrict: 'สะเตงนอก', district: 'เมืองยะลา', province: 'ยะลา', lat: 6.5284, lng: 101.2912 },
  { subdistrict: 'บันนังสตา', district: 'บันนังสตา', province: 'ยะลา', lat: 6.2625, lng: 101.2588 },
  { subdistrict: 'ตาเนาะปูเต๊ะ', district: 'บันนังสตา', province: 'ยะลา', lat: 6.3152, lng: 101.2741 },
  { subdistrict: 'บาเจาะ', district: 'บันนังสตา', province: 'ยะลา', lat: 6.2842, lng: 101.2215 },
  { subdistrict: 'เบตง', district: 'เบตง', province: 'ยะลา', lat: 5.7745, lng: 101.0712 },
  { subdistrict: 'ยะรม', district: 'เบตง', province: 'ยะลา', lat: 5.7952, lng: 101.0542 },
  { subdistrict: 'ธารโต', district: 'ธารโต', province: 'ยะลา', lat: 6.1354, lng: 101.1852 },
  { subdistrict: 'แม่หวาด', district: 'ธารโต', province: 'ยะลา', lat: 6.0841, lng: 101.1524 },
  { subdistrict: 'รามัน', district: 'รามัน', province: 'ยะลา', lat: 6.4785, lng: 101.4258 },
  { subdistrict: 'ยะหา', district: 'ยะหา', province: 'ยะลา', lat: 6.4485, lng: 101.1354 },
  { subdistrict: 'กาบัง', district: 'กาบัง', province: 'ยะลา', lat: 6.4215, lng: 101.0258 },
  { subdistrict: 'กรงปินัง', district: 'กรงปินัง', province: 'ยะลา', lat: 6.4025, lng: 101.2485 },

  // ปัตตานี
  { subdistrict: 'สะบารัง', district: 'เมืองปัตตานี', province: 'ปัตตานี', lat: 6.8642, lng: 101.2481 },
  { subdistrict: 'รูสะมิแล', district: 'เมืองปัตตานี', province: 'ปัตตานี', lat: 6.8852, lng: 101.2315 },
  { subdistrict: 'บ่อทอง', district: 'หนองจิก', province: 'ปัตตานี', lat: 6.7533, lng: 101.1764 },
  { subdistrict: 'ตุยง', district: 'หนองจิก', province: 'ปัตตานี', lat: 6.7845, lng: 101.1852 },
  { subdistrict: 'เขาตูม', district: 'ยะรัง', province: 'ปัตตานี', lat: 6.5054, lng: 101.2982 },
  { subdistrict: 'ยะรัง', district: 'ยะรัง', province: 'ปัตตานี', lat: 6.7541, lng: 101.3125 },
  { subdistrict: 'ตะลุบัน', district: 'สายบุรี', province: 'ปัตตานี', lat: 6.7025, lng: 101.6184 },
  { subdistrict: 'เตราะบอน', district: 'สายบุรี', province: 'ปัตตานี', lat: 6.6741, lng: 101.5952 },
  { subdistrict: 'ปะนาเระ', district: 'ปะนาเระ', province: 'ปัตตานี', lat: 6.8615, lng: 101.4925 },
  { subdistrict: 'โคกโพธิ์', district: 'โคกโพธิ์', province: 'ปัตตานี', lat: 6.7215, lng: 101.1254 },
  { subdistrict: 'นาประดู่', district: 'โคกโพธิ์', province: 'ปัตตานี', lat: 6.6852, lng: 101.1641 },
  { subdistrict: 'มายอ', district: 'มายอ', province: 'ปัตตานี', lat: 6.7258, lng: 101.4215 },
  { subdistrict: 'ทุ่งยางแดง', district: 'ทุ่งยางแดง', province: 'ปัตตานี', lat: 6.6125, lng: 101.4582 },

  // นราธิวาส
  { subdistrict: 'บางนาค', district: 'เมืองนราธิวาส', province: 'นราธิวาส', lat: 6.4255, lng: 101.8253 },
  { subdistrict: 'กะลุวอ', district: 'เมืองนราธิวาส', province: 'นราธิวาส', lat: 6.3812, lng: 101.8124 },
  { subdistrict: 'กะลุวอเหนือ', district: 'เมืองนราธิวาส', province: 'นราธิวาส', lat: 6.4521, lng: 101.8452 },
  { subdistrict: 'ตันหยงมัส', district: 'ระแงะ', province: 'นราธิวาส', lat: 6.2941, lng: 101.7258 },
  { subdistrict: 'บองอ', district: 'ระแงะ', province: 'นราธิวาส', lat: 6.2514, lng: 101.6982 },
  { subdistrict: 'จวบ', district: 'เจาะไอร้อง', province: 'นราธิวาส', lat: 6.2215, lng: 101.8492 },
  { subdistrict: 'มะรือโบออก', district: 'เจาะไอร้อง', province: 'นราธิวาส', lat: 6.2645, lng: 101.8124 },
  { subdistrict: 'รือเสาะ', district: 'รือเสาะ', province: 'นราธิวาส', lat: 6.3845, lng: 101.5214 },
  { subdistrict: 'สุไหงโก-ลก', district: 'สุไหงโก-ลก', province: 'นราธิวาส', lat: 6.0285, lng: 101.9682 },
  { subdistrict: 'สุไหงปาดี', district: 'สุไหงปาดี', province: 'นราธิวาส', lat: 6.0845, lng: 101.8741 },
  { subdistrict: 'ตากใบ', district: 'ตากใบ', province: 'นราธิวาส', lat: 6.2541, lng: 102.0521 },
  { subdistrict: 'บาเจาะ', district: 'บาเจาะ', province: 'นราธิวาส', lat: 6.5125, lng: 101.6542 },
  { subdistrict: 'แว้ง', district: 'แว้ง', province: 'นราธิวาส', lat: 5.9254, lng: 101.8845 },
  { subdistrict: 'สุคิริน', district: 'สุคิริน', province: 'นราธิวาส', lat: 5.9352, lng: 101.7745 },

  // สงขลา
  { subdistrict: 'บ่อยาง', district: 'เมืองสงขลา', province: 'สงขลา', lat: 7.1895, lng: 100.5954 },
  { subdistrict: 'คอหงส์', district: 'หาดใหญ่', province: 'สงขลา', lat: 7.0254, lng: 100.4952 },
  { subdistrict: 'หาดใหญ่', district: 'หาดใหญ่', province: 'สงขลา', lat: 7.0054, lng: 100.4752 },
  { subdistrict: 'จะนะ', district: 'จะนะ', province: 'สงขลา', lat: 6.9152, lng: 100.7412 },
  { subdistrict: 'เทพา', district: 'เทพา', province: 'สงขลา', lat: 6.8285, lng: 100.9652 },
  { subdistrict: 'นาทวี', district: 'นาทวี', province: 'สงขลา', lat: 6.7412, lng: 100.6952 },
  { subdistrict: 'สะบ้าย้อย', district: 'สะบ้าย้อย', province: 'สงขลา', lat: 6.6215, lng: 100.9541 },
  { subdistrict: 'สะเดา', district: 'สะเดา', province: 'สงขลา', lat: 6.6385, lng: 100.4258 },

  // กาญจนบุรี (พล.ร.9)
  { subdistrict: 'ลาดหญ้า', district: 'เมืองกาญจนบุรี', province: 'กาญจนบุรี', lat: 14.0228, lng: 99.5328 },
  { subdistrict: 'ปากแพรก', district: 'เมืองกาญจนบุรี', province: 'กาญจนบุรี', lat: 14.0042, lng: 99.5492 },
  { subdistrict: 'บ้านเหนือ', district: 'เมืองกาญจนบุรี', province: 'กาญจนบุรี', lat: 14.0215, lng: 99.5284 },
  { subdistrict: 'ท่ามะขาม', district: 'เมืองกาญจนบุรี', province: 'กาญจนบุรี', lat: 14.0412, lng: 99.5085 },
  { subdistrict: 'ทองผาภูมิ', district: 'ทองผาภูมิ', province: 'กาญจนบุรี', lat: 14.7352, lng: 98.6315 },
  { subdistrict: 'สังขละบุรี', district: 'สังขละบุรี', province: 'กาญจนบุรี', lat: 15.1542, lng: 98.4521 },
  { subdistrict: 'ไทรโยค', district: 'ไทรโยค', province: 'กาญจนบุรี', lat: 14.1152, lng: 99.1452 },

  // ปราจีนบุรี (พล.ร.2 รอ.)
  { subdistrict: 'บ้านพระ', district: 'เมืองปราจีนบุรี', province: 'ปราจีนบุรี', lat: 14.0509, lng: 101.3718 },
  { subdistrict: 'หน้าเมือง', district: 'เมืองปราจีนบุรี', province: 'ปราจีนบุรี', lat: 14.0585, lng: 101.3741 },
  { subdistrict: 'กบินทร์', district: 'กบินทร์บุรี', province: 'ปราจีนบุรี', lat: 13.9852, lng: 101.7125 },

  // ลพบุรี & สระบุรี
  { subdistrict: 'เขาสามยอด', district: 'เมืองลพบุรี', province: 'ลพบุรี', lat: 14.8214, lng: 100.6558 },
  { subdistrict: 'ทะเลชุบศร', district: 'เมืองลพบุรี', province: 'ลพบุรี', lat: 14.8012, lng: 100.6254 },
  { subdistrict: 'ปากเพรียว', district: 'เมืองสระบุรี', province: 'สระบุรี', lat: 14.5298, lng: 100.9101 },

  // นครราชสีมา (ทภ.2)
  { subdistrict: 'หนองไผ่ล้อม', district: 'เมืองนครราชสีมา', province: 'นครราชสีมา', lat: 14.9738, lng: 102.0837 },
  { subdistrict: 'ในเมือง', district: 'เมืองนครราชสีมา', province: 'นครราชสีมา', lat: 14.9842, lng: 102.1091 },
  { subdistrict: 'โพธิ์กลาง', district: 'เมืองนครราชสีมา', province: 'นครราชสีมา', lat: 14.9542, lng: 102.0745 },
  { subdistrict: 'ปากช่อง', district: 'ปากช่อง', province: 'นครราชสีมา', lat: 14.7085, lng: 101.4152 },

  // พิษณุโลก (ทภ.3)
  { subdistrict: 'บ้านคลอง', district: 'เมืองพิษณุโลก', province: 'พิษณุโลก', lat: 16.8285, lng: 100.2524 },
  { subdistrict: 'ในเมือง', district: 'เมืองพิษณุโลก', province: 'พิษณุโลก', lat: 16.8185, lng: 100.2612 },

  // เชียงใหม่ (มทบ.33)
  { subdistrict: 'วัดเกต', district: 'เมืองเชียงใหม่', province: 'เชียงใหม่', lat: 18.7883, lng: 99.0061 },
  { subdistrict: 'ศรีภูมิ', district: 'เมืองเชียงใหม่', province: 'เชียงใหม่', lat: 18.7898, lng: 98.9742 },
  { subdistrict: 'สุเทพ', district: 'เมืองเชียงใหม่', province: 'เชียงใหม่', lat: 18.7915, lng: 98.9541 },
  { subdistrict: 'ช้างเผือก', district: 'เมืองเชียงใหม่', province: 'เชียงใหม่', lat: 18.8125, lng: 98.9812 },

  // กรุงเทพมหานคร
  { subdistrict: 'บางขุนพรหม', district: 'พระนคร', province: 'กรุงเทพมหานคร', lat: 13.7651, lng: 100.5085 },
  { subdistrict: 'พระบรมมหาราชวัง', district: 'พระนคร', province: 'กรุงเทพมหานคร', lat: 13.7505, lng: 100.4915 },
  { subdistrict: 'ทุ่งพญาไท', district: 'ราชเทวี', province: 'กรุงเทพมหานคร', lat: 13.7674, lng: 100.5348 },
  { subdistrict: 'สามเสนใน', district: 'พญาไท', province: 'กรุงเทพมหานคร', lat: 13.7745, lng: 100.5489 },
  { subdistrict: 'ทุ่งสองห้อง', district: 'หลักสี่', province: 'กรุงเทพมหานคร', lat: 13.8885, lng: 100.5632 },
  { subdistrict: 'ดอนเมือง', district: 'ดอนเมือง', province: 'กรุงเทพมหานคร', lat: 13.9125, lng: 100.5985 },
  { subdistrict: 'อนุสาวรีย์', district: 'บางเขน', province: 'กรุงเทพมหานคร', lat: 13.8745, lng: 100.5952 }
];

/**
 * ฟังก์ชันค้นหาสถานที่ (ทั้งสถานที่ทหาร/รพ. และตำบล/อำเภอ/จังหวัด)
 */
export function searchLocations(query, limit = 8) {
  if (!query || query.trim().length < 1) return [];
  const q = query.trim().toLowerCase();

  // 1. ค้นหาในสถานที่สำคัญ (ค่ายทหาร, โรงพยาบาล, ฐานปฏิบัติการ)
  const matchedPlaces = MILITARY_AND_HOSPITAL_LOCATIONS.filter(item => {
    return item.name.toLowerCase().includes(q) ||
      item.street?.toLowerCase().includes(q) ||
      item.subdistrict?.toLowerCase().includes(q) ||
      item.district?.toLowerCase().includes(q) ||
      item.province?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q);
  }).map(item => ({
    ...item,
    type: 'PLACE',
    title: item.name,
    subtitle: `${item.street ? item.street + ' ' : ''}ต.${item.subdistrict} อ.${item.district} จ.${item.province}`,
    badge: item.category || 'สถานที่สำคัญ'
  }));

  // 2. ค้นหาในสารบบ ตำบล อำเภอ จังหวัด
  const matchedAddresses = THAI_ADDRESS_DIRECTORY.filter(item => {
    return item.subdistrict.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q) ||
      item.province.toLowerCase().includes(q);
  }).map(item => ({
    ...item,
    type: 'ADDRESS',
    title: `ต.${item.subdistrict} อ.${item.district}`,
    subtitle: `จ.${item.province}`,
    badge: 'ตำบล/อำเภอ'
  }));

  // 3. ค้นหาใน 77 จังหวัด
  const matchedProvinces = THAI_PROVINCES.filter(p => p.toLowerCase().includes(q))
    .map(p => ({
      type: 'PROVINCE',
      title: `จ.${p}`,
      subtitle: `ประเทศไทย`,
      province: p,
      badge: 'จังหวัด'
    }));

  // นำผลลัพธ์มารวมกันและตัดตาม limit
  const results = [...matchedPlaces, ...matchedAddresses, ...matchedProvinces];
  
  // ตัดรายการซ้ำ
  const seen = new Set();
  const deduped = [];
  for (const r of results) {
    const key = `${r.title}|${r.subtitle}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(r);
    }
    if (deduped.length >= limit) break;
  }

  return deduped;
}

/**
 * ค้นหาเฉพาะ ตำบล อำเภอ จังหวัด
 */
export function searchAddressOnly(query, limit = 8) {
  if (!query || query.trim().length < 1) return [];
  const q = query.trim().toLowerCase();

  return THAI_ADDRESS_DIRECTORY.filter(item => {
    return item.subdistrict.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q) ||
      item.province.toLowerCase().includes(q) ||
      `ต.${item.subdistrict}`.includes(q) ||
      `อ.${item.district}`.includes(q) ||
      `จ.${item.province}`.includes(q);
  }).slice(0, limit);
}
