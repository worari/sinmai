// app/api/knowledge/bank/route.js
// API จัดการ BANK (ธนาคารคำถามกลาง) - คำถามที่ไม่ผูกกับแบบทดสอบใดๆ
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ---------- ดึงคำถามในธนาคารทั้งหมด ----------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    let questions = db.getQuestionBank();
    if (examId) {
      questions = questions.filter((q) => q.examId === examId);
    }
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ---------- สร้างคำถามใหม่ในธนาคาร ----------
export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.questionText) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุคำถาม' }, { status: 400 });
    }
    const question = db.createQuestionBankQuestion(body);
    return NextResponse.json({ success: true, message: 'เพิ่มคำถามในธนาคารสำเร็จ', question }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ---------- เชื่อมโยงคำถามจากธนาคารเข้าสู่แบบทดสอบ ----------
export async function PUT(request) {
  try {
    const body = await request.json();
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
      // ตรวจสอบว่าคำถามนี้ยังไม่ได้อยู่ในแบบทดสอบนี้
      const examQuestionIds = exam.questionIds || [];
      if (examQuestionIds.includes(questionId)) {
        return NextResponse.json({ success: false, message: 'คำถามนี้ได้ถูกเพิ่มเข้าแบบทดสอบนี้แล้ว' }, { status: 409 });
      }
      const updated = db.updateKnowledgeExam(examId, { questionIds: [...examQuestionIds, questionId] });
      return NextResponse.json({ success: true, message: 'เพิ่มคำถามเข้าแบบทดสอบสำเร็จ', exam: updated });
    } else {
      // ลบคำถามออกจากแบบทดสอบ
      const updated = db.updateKnowledgeExam(examId, { questionIds: (exam.questionIds || []).filter((id) => id !== questionId) });
      return NextResponse.json({ success: true, message: 'ลบคำถามออกจากแบบทดสอบสำเร็จ', exam: updated });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

