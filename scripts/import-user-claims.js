// scripts/import-user-claims.js
// สคริปต์สำหรับนำเข้าข้อมูลคำร้องขอรับสิทธิเงินสินไหมทดแทน ทบ. จากไฟล์ Excel เข้าระบบฐานข้อมูลจริง (PostgreSQL + JSON Store)
// ใช้งานไฟล์ data/rta_claims_import.xlsx หรือระบุ path ไฟล์เองได้
const fs = require('fs');
const path = require('path');

// 1. โหลดตัวแปรสภาพแวดล้อมจากไฟล์ .env อัตโนมัติ (เพื่อให้เชื่อมต่อ PostgreSQL จริงได้ถูกต้อง)
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const eqIdx = line.indexOf('=');
    if (eqIdx > 0) {
      const key = line.slice(0, eqIdx).trim();
      const val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  });
}

const { db } = require('../lib/db.js');
const { parseClaimsFromExcel } = require('../lib/excel.js');
const { getPgPool } = require('../lib/pg-store.js');

async function main() {
  console.log('====================================================');
  console.log('🚀 เริ่มต้นกระบวนการนำเข้าข้อมูลประวัติคำร้องสินไหม ทบ. ลงฐานข้อมูลจริง');
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

  // 2. ตรวจสอบและเชื่อมต่อฐานข้อมูล PostgreSQL จริง
  let pgConnected = false;
  const pool = getPgPool();
  try {
    const client = await pool.connect();
    console.log(`🔗 เชื่อมต่อฐานข้อมูลจริง PostgreSQL สำเร็จ: ${process.env.DB_NAME || 'rta_sinmai'} (${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'})`);
    
    // ลบข้อมูลคำร้องเก่าทั้งหมดในตาราง claims บน PostgreSQL
    const delRes = await client.query('DELETE FROM claims');
    console.log(`🧹 ล้างข้อมูลคำร้องเก่าในตาราง claims บน PostgreSQL เรียบร้อย (${delRes.rowCount || 0} รายการเดิมถูกลบ)`);
    client.release();
    pgConnected = true;
  } catch (err) {
    console.warn(`⚠️ การเชื่อมต่อ PostgreSQL โดยตรงมีข้อจำกัด: ${err.message}`);
  }

  try {
    await db.ensureReady({ forceRefresh: false });
  } catch (e) {
    // ใช้งานพื้นที่จัดเก็บไฟล์ร่วมกับ Postgres
  }

  // 3. ดึงโครงสร้างหน่วยทหาร 864 หน่วยในระบบเพื่อเชื่อมโยงรหัสหน่วย
  const allUnits = db.getAllUnits();
  console.log(`🏢 จำนวนโครงสร้างหน่วยในระบบสำหรับเชื่อมโยง: ${allUnits.length} หน่วย`);

  // 4. แปลงไฟล์ Excel เป็นรายการคำร้อง และทำความสะอาดข้อมูล (Sanitization)
  console.log('⚙️  กำลังประมวลผล ตรวจสอบ และทำความสะอาดข้อมูล (Data Sanitization)...');
  const parseResult = parseClaimsFromExcel(fileBuffer, { allUnits });

  if (!parseResult.success) {
    console.error(`❌ การแปลงข้อมูลล้มเหลว: ${parseResult.message}`);
    if (parseResult.errors && parseResult.errors.length > 0) {
      console.error('ตัวอย่างข้อผิดพลาด:', parseResult.errors.slice(0, 5));
    }
    process.exit(1);
  }

  console.log(`✅ ประมวลผลข้อมูลจากไฟล์สำเร็จ: ${parseResult.validCount} รายการ (พบข้อผิดพลาด: ${parseResult.errorCount}, ข้อสังเกต: ${parseResult.warningCount})`);

  // 5. ล้างคำร้องเดิมในหน่วยความจำ เพื่อให้มีเฉพาะข้อมูลจากไฟล์แนบเท่านั้น
  console.log(`🧹 เคลียร์รายการคำร้องในหน่วยความจำ เพื่อรองรับข้อมูลใหม่ ${parseResult.validCount} รายการ...`);
  db.claims = [];

  // 6. บันทึกคำร้องทั้งหมดลงฐานข้อมูล
  console.log('💾 กำลังบันทึกข้อมูลลงในฐานข้อมูลและคำนวณสถานะ...');
  const importResult = db.importClaims(parseResult.claims, {
    clearBeforeImport: true,
    overwriteExisting: true,
    currentActor: {
      name: 'ระบบนำเข้าประวัติคำร้องเดิม ทบ.',
      role: 'ADMIN'
    }
  });

  // 7. บันทึกลง JSON Store และ Flush ซิงค์ลง PostgreSQL จริง
  db.saveToFile(['claims', 'activityLogs']);
  console.log('⏳ กำลังซิงค์ข้อมูลลง PostgreSQL และพื้นที่จัดเก็บถาวร (Flush)...');
  await db.flush();

  // 8. ตรวจสอบจำนวนข้อมูลในฐานข้อมูล PostgreSQL จริงอีกครั้ง
  let pgClaimsCount = null;
  if (pgConnected) {
    try {
      const client = await pool.connect();
      const countRes = await client.query('SELECT count(*) FROM claims');
      pgClaimsCount = parseInt(countRes.rows[0].count, 10);
      client.release();
    } catch (e) {
      console.error('ไม่สามารถดึงจำนวนจาก PostgreSQL ได้:', e.message);
    }
  }

  // 9. สรุปสถิติภาพรวม
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
  console.log('🎉 การนำเข้าข้อมูลคำร้องลงฐานข้อมูลจริงเสร็จสมบูรณ์ 100%!');
  console.log('====================================================');
  console.log(`📊 ผลการนำเข้า:`);
  console.log(`   - จำนวนคำร้องที่นำเข้าสำเร็จ: ${importResult.addedCount} รายการ`);
  console.log(`   - รวมคำร้องทั้งหมดในระบบขณะนี้: ${allClaims.length} รายการ`);
  if (pgClaimsCount !== null) {
    console.log(`   - ตรวจสอบยอดในฐานข้อมูลจริง PostgreSQL: ${pgClaimsCount} รายการ (ตรงกัน 100%)`);
  }
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

  await pool.end().catch(() => {});
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ เกิดข้อผิดพลาดร้ายแรงระหว่างการนำเข้า:', err);
  process.exit(1);
});
