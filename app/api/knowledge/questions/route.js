// app/api/knowledge/questions/route.js
// API จัดการข้อสอบ (Knowledge Questions) - สำหรับผู้ดูแลระบบ
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    if (!examId) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสแบบทดสอบ (examId)' }, { status: 400 });
    }
    const questions = db.getKnowledgeQuestions(examId);
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.examId || !body.questionText) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสแบบทดสอบและข้อความคำถาม' }, { status: 400 });
    }
    const question = db.createKnowledgeQuestion(body);
    return NextResponse.json({ success: true, message: 'เพิ่มข้อสอบสำเร็จ', question }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสข้อสอบที่ต้องการแก้ไข' }, { status: 400 });
    }
    const question = db.updateKnowledgeQuestion(id, updateData);
    return NextResponse.json({ success: true, message: 'แก้ไขข้อสอบสำเร็จ', question });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสข้อสอบที่ต้องการลบ' }, { status: 400 });
    }
    db.deleteKnowledgeQuestion(id);
    return NextResponse.json({ success: true, message: 'ลบข้อสอบสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
