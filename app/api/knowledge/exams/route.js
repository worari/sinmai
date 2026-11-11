// app/api/knowledge/exams/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, db);
    if (auth.response) return auth.response;

    const exams = db.getKnowledgeExams();
    return NextResponse.json({ success: true, exams }, { headers: { 'Cache-Control': 'no-store' } });
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
      return NextResponse.json({ success: false, message: 'กรุณาระบุชื่อแบบทดสอบ' }, { status: 400 });
    }
    const exam = db.createKnowledgeExam(body);
    await db.flush();
    return NextResponse.json({ success: true, message: 'สร้างแบบทดสอบสำเร็จ', exam }, { status: 201 });
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
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสแบบทดสอบที่ต้องการแก้ไข' }, { status: 400 });
    }
    const exam = db.updateKnowledgeExam(id, updateData);
    await db.flush();
    return NextResponse.json({ success: true, message: 'แก้ไขแบบทดสอบสำเร็จ', exam });
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
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสแบบทดสอบที่ต้องการลบ' }, { status: 400 });
    }
    db.deleteKnowledgeExam(id);
    await db.flush();
    return NextResponse.json({ success: true, message: 'ลบแบบทดสอบสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
