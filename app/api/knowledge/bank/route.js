// app/api/knowledge/bank/route.js
// API จัดการ BANK (ธนาคารคำถามกลาง) - คำถามที่ไม่ผูกกับแบบทดสอบใดๆ
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// ---------- ดึงคำถามในธนาคารทั้งหมด (เฉพาะ ADMIN) ----------
export async function GET(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    let questions = db.getQuestionBank();
    if (examId) {
      questions = questions.filter((q) => q.examId === examId);
    }
    if (category) {
      questions = questions.filter((q) => (q.category || '').toLowerCase().includes(category.toLowerCase()));
    }
    if (difficulty) {
      questions = questions.filter((q) => q.difficulty === difficulty);
    }
    if (search) {
      const s = search.toLowerCase();
      questions = questions.filter(
        (q) =>
          (q.questionText || '').toLowerCase().includes(s) ||
          (q.category || '').toLowerCase().includes(s) ||
          (Array.isArray(q.tags) && q.tags.some((t) => t.toLowerCase().includes(s)))
      );
    }
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ---------- สร้างคำถามใหม่ในธนาคาร ----------
export async function POST(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const body = await request.json();
    if (!body.questionText) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุคำถาม' }, { status: 400 });
    }
    const question = db.createQuestionBankQuestion(body);
    await db.flush();
    return NextResponse.json({ success: true, message: 'เพิ่มคำถามในธนาคารสำเร็จ', question }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ---------- อัปเดตคำถาม หรือ เชื่อมโยงคำถามเข้าแบบทดสอบ ----------
export async function PUT(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const body = await request.json();

    // 1. กรณีระบุ id โดยตรงเพื่ออัปเดตคำถาม
    if (body.id && !body.questionId) {
      const updated = db.updateQuestionBankQuestion(body.id, body);
      await db.flush();
      return NextResponse.json({ success: true, message: 'แก้ไขคำถามในธนาคารสำเร็จ', question: updated });
    }

    // 2. กรณีเชื่อมโยงคำถามจากธนาคารเข้าสู่แบบทดสอบ
    const { questionId, examId, add } = body;
    if (!questionId || !examId) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุทั้ง questionId และ examId' }, { status: 400 });
    }
    const question = db.getQuestionBankById(questionId);
    if (!question) {
      return NextResponse.json({ success: false, message: 'ไม่พบคำถามที่ระบุในธนาคาร' }, { status: 404 });
    }
    const exam = db.getKnowledgeExamById(examId);
    if (!exam) {
      return NextResponse.json({ success: false, message: 'ไม่พบแบบทดสอบที่ระบุ' }, { status: 404 });
    }

    if (add === true) {
      const examQuestionIds = exam.questionIds || [];
      if (examQuestionIds.includes(questionId)) {
        return NextResponse.json({ success: false, message: 'คำถามนี้ได้ถูกเพิ่มเข้าแบบทดสอบนี้แล้ว' }, { status: 409 });
      }
      const updated = db.updateKnowledgeExam(examId, { questionIds: [...examQuestionIds, questionId] });
      await db.flush();
      return NextResponse.json({ success: true, message: 'เพิ่มคำถามเข้าแบบทดสอบสำเร็จ', exam: updated });
    } else {
      const updated = db.updateKnowledgeExam(examId, { questionIds: (exam.questionIds || []).filter((id) => id !== questionId) });
      await db.flush();
      return NextResponse.json({ success: true, message: 'ลบคำถามออกจากแบบทดสอบสำเร็จ', exam: updated });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ---------- ลบคำถามออกจากธนาคาร (ผ่าน Query String ?id=...) ----------
export async function DELETE(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสคำถามที่ต้องการลบ (id)' }, { status: 400 });
    }
    db.deleteQuestionBankQuestion(id);
    await db.flush();
    return NextResponse.json({ success: true, message: 'ลบคำถามออกจากธนาคารสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
