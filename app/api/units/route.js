// app/api/units/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const parentId = searchParams.get('parentId');
    const search = searchParams.get('search');
    const hierarchy = searchParams.get('hierarchy');

    if (hierarchy === 'true') {
      const data = db.getUnitHierarchy();
      return NextResponse.json({ success: true, ...data });
    }

    const units = db.getAllUnits({ level, parentId, search });
    return NextResponse.json({ success: true, units, total: units.length });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.action === 'RESET_DEFAULT') {
      const units = db.resetUnits();
      return NextResponse.json({
        success: true,
        message: 'รีเซ็ตโครงสร้างหน่วยเป็นค่ามาตรฐานของกองทัพบกเรียบร้อยแล้ว',
        units
      });
    }

    const newUnit = db.addUnit(body);
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
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสหน่วยที่ต้องการแก้ไข' }, { status: 400 });
    }

    const updatedUnit = db.updateUnit(body.id, body);
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสหน่วยที่ต้องการลบ' }, { status: 400 });
    }

    const deleted = db.deleteUnit(id);
    return NextResponse.json({
      success: true,
      message: `ลบหน่วย "${deleted.name}" ออกจากโครงสร้างเรียบร้อยแล้ว`
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
