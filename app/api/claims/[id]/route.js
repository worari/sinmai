// app/api/claims/[id]/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const user = userId ? db.findUserById(userId) : null;

    const claim = db.getClaimById(id, user);
    if (!claim) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลคำร้อง' }, { status: 404 });
    }

    return NextResponse.json({ success: true, claim });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 403 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { userId, newStatus, remark, extraData } = await request.json();

    const user = db.findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }, { status: 401 });
    }

    // Role-based workflow validation
    if (newStatus === 'UNDER_REVIEW' || newStatus === 'REJECTED_BY_KSP' || newStatus === 'PENDING_APPROVAL') {
      if (user.role !== 'KSP_OFFICER' && user.role !== 'ADMIN') {
        return NextResponse.json({ success: false, message: 'เฉพาะเจ้าหน้าที่ กพ.ทบ.(กสพ.ฯ) เท่านั้นที่ดำเนินการขั้นตอนนี้ได้' }, { status: 403 });
      }
    }

    if (newStatus === 'APPROVED') {
      if (user.role !== 'COMMANDER' && user.role !== 'ADMIN') {
        return NextResponse.json({ success: false, message: 'เฉพาะผู้บังคับบัญชา (จก.กพ.ทบ.) เท่านั้นที่สามารถอนุมัติได้' }, { status: 403 });
      }
    }

    if (newStatus === 'PAID' || newStatus === 'DOC_REQUESTED') {
      if (user.role !== 'INSURANCE_REP' && user.role !== 'ADMIN') {
        return NextResponse.json({ success: false, message: 'เฉพาะตัวแทนบริษัทประกันภัยเท่านั้นที่สามารถดำเนินการขั้นตอนนี้ได้' }, { status: 403 });
      }
    }

    if (newStatus === 'SK_NOTIFIED') {
      if (user.role !== 'SK_OFFICER' && user.role !== 'ADMIN') {
        return NextResponse.json({ success: false, message: 'เฉพาะเจ้าหน้าที่ สก.ทบ. เท่านั้นที่บันทึกรับทราบได้' }, { status: 403 });
      }
    }

    const updatedClaim = db.updateClaimStatus(id, newStatus, user, remark, extraData);
    return NextResponse.json({ success: true, claim: updatedClaim });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
