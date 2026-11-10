// app/api/claims/[id]/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateCitizenId, validateAttachmentFile } from '@/lib/thai-utils';

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

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, claimData, submitNow } = body;

    const user = db.findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }, { status: 401 });
    }

    // ตรวจสอบความปลอดภัยของไฟล์แนบทั้งหมด
    const docs = Array.isArray(claimData.documents) ? claimData.documents : [];
    for (const doc of docs) {
      if (doc.uploaded && doc.fileName) {
        const val = validateAttachmentFile({ name: doc.fileName, size: doc.fileSize });
        if (!val.valid) {
          return NextResponse.json({
            success: false,
            message: `ข้อผิดพลาดในเอกสารข้อที่ ${doc.index}: ${val.error}`
          }, { status: 400 });
        }
      }
    }

    const compensationAmount = claimData.claimType === 'HIGH_RISK' ? 300000 : 60000;
    const isAccident = claimData.incidentType === 'ACCIDENT';
    const specificCause = (
      claimData.lossSpecificCause || 
      (claimData.lossType === 'DECEASED' ? claimData.deathCertificateCause : claimData.disabledOrganDetail) || 
      claimData.deathCertificateCause || 
      claimData.disabledOrganDetail || 
      ''
    ).trim();

    if (submitNow) {
      // ตรวจสอบความถูกต้องครบถ้วนเมื่อส่งเรื่องเสนอจริง (Official Submission)
      if (!claimData.casualtyFirstName || !claimData.casualtyLastName) {
        return NextResponse.json({ success: false, message: 'กรุณากรอกชื่อและนามสกุลของผู้สูญเสีย' }, { status: 400 });
      }

      if (!validateCitizenId(claimData.casualtyCitizenId)) {
        return NextResponse.json({ 
          success: false, 
          message: 'เลขประจำตัวประชาชนของผู้สูญเสียไม่ถูกต้องตามรูปแบบทางการ (Checksum Error)' 
        }, { status: 400 });
      }

      // ตรวจสอบเอกสารข้อที่ 1 (รายงาน กพ.4)
      const doc1 = docs.find((d) => d.index === 1);
      if (!doc1 || !doc1.uploaded) {
        return NextResponse.json({ success: false, message: 'บังคับต้องแนบเอกสารข้อที่ 1 (รายงาน กพ.4)' }, { status: 400 });
      }

      if (claimData.lossType === 'DECEASED') {
        const doc2 = docs.find((d) => d.index === 2);
        if (!doc2 || !doc2.uploaded) {
          return NextResponse.json({ success: false, message: 'กรณีผู้เสียชีวิต บังคับต้องแนบเอกสารข้อที่ 2 (ใบมรณบัตร)' }, { status: 400 });
        }
        if (!specificCause) {
          return NextResponse.json({ success: false, message: 'กรณีผู้เสียชีวิต กรุณาระบุสาเหตุการเสียชีวิต (ตามใบมรณบัตร)' }, { status: 400 });
        }
      } else if (claimData.lossType === 'DISABLED') {
        const doc7 = docs.find((d) => d.index === 7);
        if (!doc7 || !doc7.uploaded) {
          return NextResponse.json({ success: false, message: 'กรณีพิการทุพพลภาพ บังคับต้องแนบเอกสารข้อที่ 7 (คำสั่งปลดฯ)' }, { status: 400 });
        }
        if (!specificCause) {
          return NextResponse.json({ success: false, message: 'กรณีพิการทุพพลภาพ กรุณาระบุสาเหตุการสูญเสีย / อวัยวะที่สูญเสีย' }, { status: 400 });
        }
      }

      if (claimData.claimType === 'HIGH_RISK') {
        const doc10 = docs.find((d) => d.index === 10);
        if (!doc10 || !doc10.uploaded) {
          return NextResponse.json({
            success: false,
            message: 'กรณีปฏิบัติหน้าที่สำคัญ (รับเงิน 300,000 บาท) บังคับต้องแนบเอกสารข้อที่ 10 (รูปถ่ายขนาด 4x6 นิ้ว)'
          }, { status: 400 });
        }
      }

      const updatedClaim = db.updateDraftClaim(id, {
        ...claimData,
        incidentType: claimData.incidentType || 'ILLNESS',
        isDriver: isAccident ? (claimData.isDriver || 'YES') : null,
        alcoholTestResult: isAccident ? (claimData.alcoholTestResult || 'NOT_EXCEEDED') : null,
        lossSpecificCause: specificCause,
        deathCertificateCause: claimData.lossType === 'DECEASED' ? specificCause : (claimData.deathCertificateCause || ''),
        disabledOrganDetail: claimData.lossType === 'DISABLED' ? specificCause : '',
        compensationAmount
      }, user, true);

      return NextResponse.json({
        success: true,
        message: 'ส่งเรื่องเสนอขอรับสิทธิเงินค่าสินไหมทดแทนเรียบร้อยแล้ว',
        claim: updatedClaim
      });
    } else {
      // บันทึกแก้ไขแบบร่างต่อ (Save Draft updates)
      const updatedClaim = db.updateDraftClaim(id, {
        ...claimData,
        incidentType: claimData.incidentType || 'ILLNESS',
        isDriver: isAccident ? (claimData.isDriver || 'YES') : null,
        alcoholTestResult: isAccident ? (claimData.alcoholTestResult || 'NOT_EXCEEDED') : null,
        lossSpecificCause: specificCause,
        deathCertificateCause: claimData.lossType === 'DECEASED' ? specificCause : (claimData.deathCertificateCause || ''),
        disabledOrganDetail: claimData.lossType === 'DISABLED' ? specificCause : '',
        compensationAmount
      }, user, false);

      return NextResponse.json({
        success: true,
        message: 'บันทึกการแก้ไขแบบร่างคำร้องเรียบร้อยแล้ว (สามารถกลับมาแก้ไขและแนบเอกสารเพิ่มได้อีก)',
        claim: updatedClaim,
        isDraft: true
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
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
