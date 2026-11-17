#!/usr/bin/env node
// scripts/sync-units.js
// เครื่องมือซิงค์โครงสร้างหน่วยทหารบก (860+ หน่วย) ลงฐานข้อมูล PostgreSQL
// ใช้งาน: node scripts/sync-units.js

const path = require('path');
const fs = require('fs');

// โหลด Environment Variables จาก .env หรือ .env.local หากมี
const envFiles = ['.env', '.env.local', '.env.production'];
for (const envFile of envFiles) {
  const fullPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(fullPath)) {
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

async function run() {
  console.log('===============================================================');
  console.log('🎖️  RTA MILITARY UNITS DATABASE SYNCHRONIZATION TOOL (PostgreSQL)');
  console.log('===============================================================');

  const { getPgPool } = require('../lib/pg-store.js');
  const { INITIAL_MILITARY_UNITS } = require('../lib/military-units.js');

  console.log(`📦 พบรายการโครงสร้างหน่วยมาตรฐานในระบบ: ${INITIAL_MILITARY_UNITS.length} หน่วย`);

  const pool = getPgPool();
  let client;
  try {
    client = await pool.connect();
    console.log('✅ เชื่อมต่อฐานข้อมูล PostgreSQL สำเร็จ');

    // ตรวจสอบจำนวนหน่วยปัจจุบันในฐานข้อมูล
    const beforeCountRes = await client.query('SELECT COUNT(*)::int AS count FROM military_units');
    const beforeCount = beforeCountRes.rows[0]?.count || 0;
    console.log(`📊 จำนวนหน่วยเดิมในตาราง military_units: ${beforeCount} หน่วย`);

    console.log('\n🔄 กำลังดำเนินการ Upsert ข้อมูลหน่วยทหาร (พร้อม extra_data และ 7 ส่วนหลัก)...');

    const KNOWN_COLS = new Set([
      'id', 'name', 'shortName', 'short_name', 'code', 'level',
      'parentId', 'parent_id', 'region', 'status', 'createdAt', 'created_at'
    ]);

    await client.query('BEGIN');

    const upsertSql = `
      INSERT INTO military_units (id, name, short_name, code, level, parent_id, region, status, extra_data)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        short_name = EXCLUDED.short_name,
        code = EXCLUDED.code,
        level = EXCLUDED.level,
        parent_id = EXCLUDED.parent_id,
        region = EXCLUDED.region,
        status = EXCLUDED.status,
        extra_data = EXCLUDED.extra_data
    `;

    let insertedOrUpdated = 0;
    for (const u of INITIAL_MILITARY_UNITS) {
      if (!u?.id || !u?.name) continue;

      const extraData = {};
      for (const [k, v] of Object.entries(u)) {
        if (!KNOWN_COLS.has(k) && v !== undefined && v !== null) {
          extraData[k] = v;
        }
      }

      await client.query(upsertSql, [
        u.id,
        u.name,
        u.shortName || null,
        u.code || null,
        u.level !== undefined ? Number(u.level) : null,
        u.parentId || null,
        u.region || 'ส่วนกลาง',
        u.status || 'ACTIVE',
        JSON.stringify(extraData)
      ]);
      insertedOrUpdated++;
    }

    // อัปเดตเวอร์ชันในตาราง system_settings
    const targetVersion = '2026-11-16-v2-860units';
    await client.query(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ('military_units_seed_version', $1::jsonb, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `, [JSON.stringify(targetVersion)]);

    await client.query('COMMIT');

    // ตรวจสอบจำนวนหน่วยหลังการซิงค์
    const afterCountRes = await client.query('SELECT COUNT(*)::int AS count FROM military_units');
    const afterCount = afterCountRes.rows[0]?.count || 0;

    console.log(`\n🎉 ซิงค์ข้อมูลสำเร็จเรียบร้อย!`);
    console.log(`   - ประมวลผลและปรับปรุง: ${insertedOrUpdated} หน่วย`);
    console.log(`   - จำนวนหน่วยรวมในฐานข้อมูลล่าสุด: ${afterCount} หน่วย`);
    console.log(`   - สถานะเวอร์ชัน: ${targetVersion}`);
    console.log('===============================================================');

    process.exit(0);
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }
    console.error('\n❌ เกิดข้อผิดพลาดในการซิงค์ข้อมูล:', err.message);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

run();

