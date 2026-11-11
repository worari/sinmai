// app/api/track/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateSlaStatus } from '@/lib/thai-utils';
import { CLAIM_STATUS } from '@/lib/constants';
import { enforceRateLimit } from '@/lib/api-auth';

export async function POST(request) {
  try {
    const rate = enforceRateLimit(request, 'public-track', {
      maxRequests: 15,
      windowMs: 5 * 60 * 1000,
      message: 'มีการค้นหาข้อมูลบ่อยเกินไป เพื่อคุ้มครองข้อมูลส่วนบุคคล กรุณารอสักครู่แล้วลองใหม่'
    });
    if (rate.response) return rate.response;

    const { citizenId, birthDate } = await request.json();

    if (!citizenId || !birthDate) {
      return NextResponse.json({
        success: false,
        message: 'กรุณากรอกเลขประจำตัวประชาชน (13 หลัก) และวัน/เดือน/ปีเกิดให้ครบถ้วน'
      }, { status: 400 });
    }

    await db.ensureReady();
    const claim = db.trackClaimByCitizenIdAndBirthDate(citizenId, birthDate);
    if (!claim) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบข้อมูลคำร้องขอรับสิทธิเงินสินไหมทดแทนที่ตรงกับเลขประจำตัวประชาชนและวันเกิดที่ระบุ'
      }, { status: 404 });
    }

    const sla = calculateSlaStatus(claim.createdAt, claim.slaTargetDays || 30);
    const statusInfo = CLAIM_STATUS[claim.status] || { step: 1, label: claim.status };

    // กรอง Timeline ไม่ให้เปิดเผยชื่อ-นามสกุลเจ้าหน้าที่หรือหมายเหตุภายในเกินความจำเป็นต่อสาธารณะ
    const sanitizedTimeline = (claim.timeline || []).map((t) => ({
      action: t.action,
      timestamp: t.timestamp,
      remark: t.action?.includes('UPLOAD_DOC') ? 'มีการอัปเดตเอกสารประกอบคำร้อง' : (CLAIM_STATUS[t.action]?.label || t.remark)
    }));

    return NextResponse.json(
      {
        success: true,
        claim: {
          id: claim.id,
          trackingCode: claim.trackingCode,
          casualtyName: `${claim.casualtyRank} ${claim.casualtyFirstName} ${claim.casualtyLastName}`,
          unitName: claim.unitName,
          claimType: claim.claimType,
          compensationAmount: claim.compensationAmount,
          lossType: claim.lossType,
          status: claim.status,
          currentStep: statusInfo.step || 1,
          statusLabel: statusInfo.label,
          createdAt: claim.createdAt,
          daysElapsed: sla.daysElapsed,
          daysRemaining: sla.daysRemaining,
          slaStatus: sla.status,
          slaLabel: sla.label,
          timeline: sanitizedTimeline,
          paidAt: claim.paidAt
        }
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
