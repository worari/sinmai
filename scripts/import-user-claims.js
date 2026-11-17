// scripts/import-user-claims.js
// สคริปต์สำหรับนำเข้าข้อมูลคำร้องขอรับสิทธิเงินสินไหมทดแทน ทบ. จากไฟล์ Excel เข้าระบบ
// รองรับการนำเข้าไฟล์ data/rta_claims_import.xlsx หรือระบุ path ไฟล์เองได้
const fs = require('fs');
const path = require('path');
const { db } = require('../lib/db.js');
const { parseClaimsFromExcel } = require('../lib/excel.js');

async function main() {
  console.log('====================================================');
  console.log('🚀 เริ่มต้นกระบวนการนำเข้าข้อมูลประวัติคำร้องสินไหม ทบ.');
  console.log('====================================================');

  const customPath = process.argv[2];
  const targetPath = customPath 
    ? path.resolve(process.cwd(), customPath)
    : path.resolve(process.cwd(), 'data/rta_claims_import.xlsx');

  if (!fs.existsSync(targetPath)) {
    console.error(`❌ ไม่พบไฟล์ Excel ที่: ${targetPath}`);
    process.exit(1);
  }

  console.log(`📁 กำลังอ่านไฟล์ข้อมูล: ${targetPath}`);
  const fileBuffer = fs.readFileSync(targetPath);
  console.log(`📦 ขนาดไฟล์: ${(fileBuffer.length / 1024).toFixed(1)} KB`);

  // ตรวจสอบและดึงข้อมูลหน่วยทหารทั้งหมดในฐานข้อมูล
  const allUnits = db.getAllUnits();
  console.log(`🏢 จำนวนโครงสร้างหน่วยในระบบสำหรับเชื่อมโยง: ${allUnits.length} หน่วย`);

  // แปลงไฟล์ Excel เป็นรายการคำร้อง
  console.log('⚙️  กำลังประมวลผล ตรวจสอบ และทำความสะอาดข้อมูล (Data Sanitization)...');
  const parseResult = parseClaimsFromExcel(fileBuffer, { allUnits });

  if (!parseResult.success) {
    console.error(`❌ การแปลงข้อมูลล้มเหลว: ${parseResult.message}`);
    if (parseResult.errors && parseResult.errors.length > 0) {
      console.error('ตัวอย่างข้อผิดพลาด:', parseResult.errors.slice(0, 5));
    }
    process.exit(1);
  }

  console.log(`✅ ประมวลผลข้อมูลสำเร็จ: ${parseResult.validCount} รายการ (พบข้อผิดพลาด: ${parseResult.errorCount}, ข้อสังเกต: ${parseResult.warningCount})`);

  // นำเข้าข้อมูลลงในฐานข้อมูล
  console.log('💾 กำลังบันทึกข้อมูลลงในฐานข้อมูลและคำนวณสถานะ...');
  const importResult = db.importClaims(parseResult.claims, {
    overwriteExisting: true,
    currentActor: {
      name: 'ระบบนำเข้าประวัติคำร้องเดิม ทบ.',
      role: 'ADMIN'
    }
  });

  console.log('⏳ กำลังซิงค์ข้อมูลลง PostgreSQL และพื้นที่จัดเก็บถาวร (Flush)...');
  await db.flush();

  // สรุปสถิติภาพรวม
  const allClaims = db.claims;
  const yearStats = {};
  const statusStats = {};
  const claimTypeStats = {};
  let totalCompensation = 0;

  allClaims.forEach((c) => {
    const yr = c.reportDate ? (new Date(c.reportDate).getFullYear() + 543).toString() : 'ไม่ระบุ';
    yearStats[yr] = (yearStats[yr] || 0) + 1;

    const st = c.status || 'SUBMITTED';
    statusStats[st] = (statusStats[st] || 0) + 1;

    const ct = c.claimType || 'NORMAL';
    claimTypeStats[ct] = (claimTypeStats[ct] || 0) + 1;

    totalCompensation += Number(c.compensationAmount || 0);
  });

  console.log('====================================================');
  console.log('🎉 การนำเข้าข้อมูลคำร้องเสร็จสมบูรณ์เรียบร้อยแล้ว!');
  console.log('====================================================');
  console.log(`📊 ผลการนำเข้าครั้งนี้:`);
  console.log(`   - เพิ่มรายการใหม่ (Added): ${importResult.addedCount} รายการ`);
  console.log(`   - ปรับปรุงรายการเดิม (Updated): ${importResult.updatedCount} รายการ`);
  console.log(`   - ข้ามรายการ (Skipped): ${importResult.skippedCount} รายการ`);
  console.log(`   - รวมคำร้องทั้งหมดในระบบขณะนี้: ${allClaims.length} รายการ`);
  console.log('----------------------------------------------------');
  console.log(`📅 จำแนกตามรอบปีที่รายงาน (พ.ศ.):`);
  Object.keys(yearStats).sort().forEach((yr) => {
    console.log(`   - ปี พ.ศ. ${yr}: ${yearStats[yr]} รายการ`);
  });
  console.log('----------------------------------------------------');
  console.log(`📋 จำแนกตามสถานะคำร้อง (Status):`);
  Object.keys(statusStats).sort().forEach((st) => {
    console.log(`   - ${st}: ${statusStats[st]} รายการ`);
  });
  console.log('----------------------------------------------------');
  console.log(`💰 จำแนกตามประเภทสินไหม:`);
  console.log(`   - ปกติ (NORMAL): ${claimTypeStats.NORMAL || 0} รายการ`);
  console.log(`   - เสี่ยงภัย (HIGH_RISK): ${claimTypeStats.HIGH_RISK || 0} รายการ`);
  console.log(`   - ยอดเงินสินไหมรวมทั้งระบบ: ${totalCompensation.toLocaleString()} บาท`);
  console.log('====================================================');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ เกิดข้อผิดพลาดร้ายแรงระหว่างการนำเข้า:', err);
  process.exit(1);
});
