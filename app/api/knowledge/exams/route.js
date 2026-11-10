// app/api/knowledge/exams/route.js
// API จัดการแบบทดสอบความรู้ (Knowledge Exams) - สำหรับผู้ดูแลระบบ
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const exams = db.getKnowledgeExams();
    return NextResponse.json({ success: true, exams });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุชื่อแบบทดสอบ' }, { status: 400 });
    }
    const exam = db.createKnowledgeExam(body);
    return NextResponse.json({ success: true, message: 'สร้างแบบทดสอบสำเร็จ', exam }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสแบบทดสอบที่ต้องการแก้ไข' }, { status: 400 });
    }
    const exam = db.updateKnowledgeExam(id, updateData);
    return NextResponse.json({ success: true, message: 'แก้ไขแบบทดสอบสำเร็จ', exam });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสแบบทดสอบที่ต้องการลบ' }, { status: 400 });
    }
    db.deleteKnowledgeExam(id);
    return NextResponse.json({ success: true, message: 'ลบแบบทดสอบสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
