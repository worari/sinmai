// app/api/knowledge/bank/[id]/route.js
// จัดการคำถามในธนาคารคำถามกลางรายข้อ (GET, PUT, DELETE)
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const question = db.getQuestionBankById(id);
    if (!question) {
      return NextResponse.json({ success: false, message: 'ไม่พบคำถามที่ระบุ' }, { status: 404 });
    }
    return NextResponse.json({ success: true, question });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = db.updateQuestionBankQuestion(id, body);
    return NextResponse.json({ success: true, message: 'แก้ไขคำถามในธนาคารสำเร็จ', question: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    db.deleteQuestionBankQuestion(id);
    return NextResponse.json({ success: true, message: 'ลบคำถามออกจากธนาคารสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
