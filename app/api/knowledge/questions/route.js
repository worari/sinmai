// app/api/knowledge/questions/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, db);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const adminView = searchParams.get('adminView') === 'true';
    const random = searchParams.has('random') ? searchParams.get('random') === 'true' : null;
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    const shuffleOptions = searchParams.has('shuffleOptions') ? searchParams.get('shuffleOptions') === 'true' : null;
    const requestedHideAnswers = searchParams.has('hideAnswers') ? searchParams.get('hideAnswers') !== 'false' : !adminView;

    if ((adminView || !requestedHideAnswers) && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้นที่สามารถดูเฉลยข้อสอบได้' },
        { status: 403 }
      );
    }

    if (!examId) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสแบบทดสอบ (examId)' }, { status: 400 });
    }

    let questions;
    if (adminView) {
      questions = db.getKnowledgeQuestions(examId);
    } else {
      questions = db.getQuestionsForExam(examId, {
        random,
        shuffleOptions,
        limit: limit > 0 ? limit : null,
        hideAnswers: auth.user.role === 'ADMIN' ? requestedHideAnswers : true
      });
    }

    return NextResponse.json({ success: true, questions }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const body = await request.json();
    if (!body.examId || !body.questionText) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสแบบทดสอบและข้อความคำถาม' }, { status: 400 });
    }
    const question = db.createKnowledgeQuestion(body);
    await db.flush();
    return NextResponse.json({ success: true, message: 'เพิ่มข้อสอบสำเร็จ', question }, { status: 201 });
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
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสข้อสอบที่ต้องการแก้ไข' }, { status: 400 });
    }
    const question = db.updateKnowledgeQuestion(id, updateData);
    await db.flush();
    return NextResponse.json({ success: true, message: 'แก้ไขข้อสอบสำเร็จ', question });
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
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสข้อสอบที่ต้องการลบ' }, { status: 400 });
    }
    db.deleteKnowledgeQuestion(id);
    await db.flush();
    return NextResponse.json({ success: true, message: 'ลบข้อสอบสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
