// app/api/content/manuals/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const manuals = db.getManuals();
    return NextResponse.json({ success: true, manuals });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const userId = body.userId || body.adminId;
    if (userId) {
      const user = db.findUserById(userId);
      if (user && user.role !== 'ADMIN') {
        return NextResponse.json({ success: false, message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถเพิ่มคู่มือได้' }, { status: 403 });
      }
    }

    if (!body.title) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุชื่อคู่มือ/เอกสาร' }, { status: 400 });
    }
    const newManual = db.createManual(body);
    return NextResponse.json({ success: true, message: 'เพิ่มคู่มือสำเร็จ', manual: newManual });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const userId = body.userId || body.adminId;
    if (userId) {
      const user = db.findUserById(userId);
      if (user && user.role !== 'ADMIN') {
        return NextResponse.json({ success: false, message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถแก้ไขคู่มือได้' }, { status: 403 });
      }
    }

    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสคู่มือที่ต้องการแก้ไข' }, { status: 400 });
    }
    const updated = db.updateManual(id, updateData);
    return NextResponse.json({ success: true, message: 'แก้ไขข้อมูลคู่มือสำเร็จ', manual: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    if (userId) {
      const user = db.findUserById(userId);
      if (user && user.role !== 'ADMIN') {
        return NextResponse.json({ success: false, message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถลบคู่มือได้' }, { status: 403 });
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสคู่มือที่ต้องการลบ' }, { status: 400 });
    }
    db.deleteManual(id);
    return NextResponse.json({ success: true, message: 'ลบคู่มือสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
