// app/api/knowledge/bank/[id]/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

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
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const { id } = params;
    const body = await request.json();
    const updated = db.updateQuestionBankQuestion(id, body);
    await db.flush();
    return NextResponse.json({ success: true, message: 'แก้ไขคำถามในธนาคารสำเร็จ', question: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const { id } = params;
    db.deleteQuestionBankQuestion(id);
    await db.flush();
    return NextResponse.json({ success: true, message: 'ลบคำถามออกจากธนาคารสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
