// app/api/units/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { exportUnitsToExcel, generateUnitTemplateExcel, parseUnitsFromExcel } from '@/lib/excel';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await db.ensureReady();
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const parentId = searchParams.get('parentId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const hierarchy = searchParams.get('hierarchy');
    const exportFormat = searchParams.get('export');
    const template = searchParams.get('template');

    // ดาวน์โหลดแบบฟอร์มตัวอย่างนำเข้าโครงสร้างหน่วย (.xlsx)
    if (template === 'excel' || template === 'true') {
      const templateBuffer = generateUnitTemplateExcel();
      return new NextResponse(templateBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="rta_units_import_template.xlsx"',
          'Cache-Control': 'no-store'
        }
      });
    }

    // ส่งออกข้อมูลโครงสร้างหน่วยทั้งหมดเป็นไฟล์ Excel (.xlsx)
    if (exportFormat === 'excel') {
      const allUnits = db.getAllUnits({ level, parentId, status, search });
      const exportBuffer = exportUnitsToExcel(allUnits);
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      return new NextResponse(exportBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="rta_military_units_${dateStr}.xlsx"`,
          'Cache-Control': 'no-store'
        }
      });
    }

    if (hierarchy === 'true') {
      const data = db.getUnitHierarchy();
      return NextResponse.json(
        { success: true, ...data },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const units = db.getAllUnits({ level, parentId, status, search });
    return NextResponse.json(
      { success: true, units, total: units.length },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const body = await request.json();

    if (body.action === 'RESET_DEFAULT') {
      const units = db.resetUnits();
      await db.flush();
      return NextResponse.json({
        success: true,
        message: 'รีเซ็ตโครงสร้างหน่วยเป็นค่ามาตรฐานของกองทัพบกเรียบร้อยแล้ว',
        units
      });
    }

    // ยืนยันการนำเข้าข้อมูลโครงสร้างหน่วยจาก JSON/Excel
    if (body.action === 'IMPORT_CONFIRM') {
      if (!Array.isArray(body.units) || body.units.length === 0) {
        return NextResponse.json({ success: false, message: 'ไม่พบรายการข้อมูลหน่วยที่ต้องการนำเข้า' }, { status: 400 });
      }
      const result = db.importUnits(body.units, {
        overwriteExisting: body.overwriteExisting !== false,
        currentAdmin: auth.user
      });
      await db.flush();
      return NextResponse.json({
        success: true,
        message: `นำเข้าโครงสร้างหน่วยสำเร็จ เพิ่มใหม่ ${result.addedCount} หน่วย, ปรับปรุง ${result.updatedCount} หน่วย, ข้าม ${result.skippedCount} หน่วย`,
        ...result
      });
    }

    const newUnit = db.addUnit(body);
    await db.flush();
    return NextResponse.json({
      success: true,
      message: `เพิ่มโครงสร้างหน่วย "${newUnit.name}" สำเร็จ`,
      unit: newUnit
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสหน่วยที่ต้องการแก้ไข' }, { status: 400 });
    }

    const updatedUnit = db.updateUnit(body.id, body);
    await db.flush();
    return NextResponse.json({
      success: true,
      message: `อัปเดตข้อมูลโครงสร้างหน่วย "${updatedUnit.name}" เรียบร้อยแล้ว`,
      unit: updatedUnit
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสหน่วยที่ต้องการลบ' }, { status: 400 });
    }

    const deleted = db.deleteUnit(id);
    await db.flush();
    return NextResponse.json({
      success: true,
      message: `ลบหน่วย "${deleted.name}" ออกจากโครงสร้างเรียบร้อยแล้ว`
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
