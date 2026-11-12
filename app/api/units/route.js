// app/api/units/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

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
