// app/api/claims/[id]/document/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { userId, docIndex, status, comment } = await request.json();

    const user = db.findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'ไม่พบผู้ใช้งาน' }, { status: 401 });
    }

    if (user.role !== 'KSP_OFFICER' && user.role !== 'INSURANCE_REP' && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'เฉพาะ กพ.ทบ.(กสพ.ฯ) และ บริษัทประกันภัย เท่านั้นที่มีสิทธิตรวจสอบเอกสาร' }, { status: 403 });
    }

    const updatedClaim = db.updateDocumentStatus(id, docIndex, status, comment, user);
    return NextResponse.json({ success: true, claim: updatedClaim });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
