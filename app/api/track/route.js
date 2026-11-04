// app/api/track/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateSlaStatus } from '@/lib/thai-utils';
import { CLAIM_STATUS } from '@/lib/constants';

export async function POST(request) {
  try {
    const { citizenId, birthDate } = await request.json();

    if (!citizenId || !birthDate) {
      return NextResponse.json({ 
        success: false, 
        message: 'กรุณากรอกเลขประจำตัวประชาชน (13 หลัก) และวัน/เดือน/ปีเกิดให้ครบถ้วน' 
      }, { status: 400 });
    }

    const claim = db.trackClaimByCitizenIdAndBirthDate(citizenId, birthDate);
    if (!claim) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่พบข้อมูลคำร้องขอรับสิทธิเงินสินไหมทดแทนที่ตรงกับเลขประจำตัวประชาชนและวันเกิดที่ระบุ' 
      }, { status: 404 });
    }

    // คำนวณ SLA และขั้นตอน
    const sla = calculateSlaStatus(claim.createdAt, claim.slaTargetDays || 30);
    const statusInfo = CLAIM_STATUS[claim.status] || { step: 1, label: claim.status };

    // Sanitized output for family/public tracking
    return NextResponse.json({
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
        timeline: claim.timeline,
        delayReason: claim.delayReason,
        paidAt: claim.paidAt
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
