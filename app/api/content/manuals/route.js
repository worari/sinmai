// app/api/content/manuals/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { sanitizeSafeUrl } from '@/lib/security';

export async function GET() {
  try {
    await db.ensureReady();
    const manuals = db.getManuals();
    return NextResponse.json({ success: true, manuals });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุชื่อคู่มือ/เอกสาร' }, { status: 400 });
    }
    const sanitized = { ...body, ...(body.fileUrl ? { fileUrl: sanitizeSafeUrl(body.fileUrl) } : {}) };
    const newManual = db.createManual(sanitized);
    await db.flush();
    return NextResponse.json({ success: true, message: 'เพิ่มคู่มือสำเร็จ', manual: newManual });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสคู่มือที่ต้องการแก้ไข' }, { status: 400 });
    }
    const sanitized = { ...updateData, ...(updateData.fileUrl ? { fileUrl: sanitizeSafeUrl(updateData.fileUrl) } : {}) };
    const updated = db.updateManual(id, sanitized);
    await db.flush();
    return NextResponse.json({ success: true, message: 'แก้ไขข้อมูลคู่มือสำเร็จ', manual: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสคู่มือที่ต้องการลบ' }, { status: 400 });
    }
    db.deleteManual(id);
    await db.flush();
    return NextResponse.json({ success: true, message: 'ลบคู่มือสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
