// app/api/knowledge/questions/route.js
// API จัดการข้อสอบ (Knowledge Questions) - สำหรับผู้ดูแลระบบ
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ฟิส셔-เยตส์ สุ่มสลับตำแหน่งในอาร์เรย์ (ใช้กับทั้งข้อสอบและตัวเลือก)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const adminView = searchParams.get('adminView') === 'true';
    const random = searchParams.has('random') ? searchParams.get('random') === 'true' : null;
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    const shuffleOptions = searchParams.has('shuffleOptions') ? searchParams.get('shuffleOptions') === 'true' : null;
    const hideAnswers = searchParams.has('hideAnswers') ? searchParams.get('hideAnswers') !== 'false' : !adminView;

    if (!examId) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรหัสแบบทดสอบ (examId)' }, { status: 400 });
    }

    let questions;

    if (adminView) {
      // หน้าผู้ดูแลระบบ: แสดงข้อสอบทั้งหมดในชุดพร้อมคำตอบถูก
      questions = db.getKnowledgeQuestions(examId);
    } else {
      // หน้าผู้เข้าสอบ: ใช้กลไกสุ่มข้อสอบและสุ่มตัวเลือกคำตอบตามที่ตั้งค่าไว้ในชุดข้อสอบ
      questions = db.getQuestionsForExam(examId, {
        random,
        shuffleOptions,
        limit: limit > 0 ? limit : null,
        hideAnswers
      });
    }

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
