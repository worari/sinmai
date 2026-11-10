// app/api/claims/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateCitizenId, validateAttachmentFile } from '@/lib/thai-utils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkCitizenId = searchParams.get('checkCitizenId');
    if (checkCitizenId) {
      const checkResult = db.checkDuplicateCasualty(checkCitizenId);
      return NextResponse.json({ success: true, ...checkResult });
    }

    const userId = searchParams.get('userId');
    const user = userId ? db.findUserById(userId) : null;

    const claims = db.getClaims(user);
    return NextResponse.json({ success: true, claims });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, claimData, isDraft } = body;

    const user = db.findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }, { status: 401 });
    }

    if (user.role !== 'UNIT_OFFICER' && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'เฉพาะเจ้าหน้าที่หน่วยเสนอเรื่องเท่านั้นที่สามารถสร้างรายงานได้' }, { status: 403 });
    }

    // กำหนดยอดเงินตามประเภทสินไหม
    // ยามปกติ 60,000 หรือ หน้าที่สำคัญ/เสี่ยงภัย 300,000
    const compensationAmount = claimData.claimType === 'HIGH_RISK' ? 300000 : 60000;

    // ตรวจสอบความถูกต้องและปลอดภัยของไฟล์แนบทั้งหมด
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

    const specificCause = (
      claimData.lossSpecificCause || 
      (claimData.lossType === 'DECEASED' ? claimData.deathCertificateCause : claimData.disabledOrganDetail) || 
      claimData.deathCertificateCause || 
      claimData.disabledOrganDetail || 
      ''
    ).trim();

    // ==========================================
    // กรณีบันทึกแบบร่าง (DRAFT MODE)
    // ==========================================
    if (isDraft) {
      const isAccident = claimData.incidentType === 'ACCIDENT';
      const draftClaim = db.createClaim({
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
        message: 'บันทึกแบบร่างคำร้องเรียบร้อยแล้ว (สามารถกลับมาแก้ไขและแนบเอกสารเพิ่มเติมได้)',
        claim: draftClaim,
        isDraft: true
      });
    }

    // ==========================================
    // กรณียื่นเสนอเรื่องจริง (OFFICIAL SUBMIT)
    // ==========================================
    if (!claimData.casualtyFirstName || !claimData.casualtyLastName) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกชื่อและนามสกุลของผู้สูญเสีย' }, { status: 400 });
    }

    // ตรวจสอบเลข ปชช. ผู้สูญเสีย
    if (!validateCitizenId(claimData.casualtyCitizenId)) {
      return NextResponse.json({ 
        success: false, 
        message: 'เลขประจำตัวประชาชนของผู้สูญเสียไม่ถูกต้องตามรูปแบบทางการ (Checksum Error)' 
      }, { status: 400 });
    }

    // ตรวจสอบเอกสารข้อที่ 1 (รายงาน กพ.4)
    const doc1 = docs.find((d) => d.index === 1);
    if (!doc1 || !doc1.uploaded) {
      return NextResponse.json({
        success: false,
        message: 'บังคับต้องแนบเอกสารข้อที่ 1 (รายงาน กพ.4)'
      }, { status: 400 });
    }

    // ตรวจสอบเงื่อนไขตามประเภทการสูญเสีย (ผู้เสียชีวิต vs พิการทุพพลภาพ)
    if (claimData.lossType === 'DECEASED') {
      // กรณีผู้เสียชีวิต: บังคับแนบใบมรณบัตร (เอกสารข้อ 2)
      const doc2 = docs.find((d) => d.index === 2);
      if (!doc2 || !doc2.uploaded) {
        return NextResponse.json({
          success: false,
          message: 'กรณีผู้เสียชีวิต บังคับต้องแนบเอกสารข้อที่ 2 (ใบมรณบัตร)'
        }, { status: 400 });
      }
      if (!specificCause) {
        return NextResponse.json({
          success: false,
          message: 'กรณีผู้เสียชีวิต กรุณาระบุสาเหตุการเสียชีวิต (ตามใบมรณบัตร)'
        }, { status: 400 });
      }
    } else if (claimData.lossType === 'DISABLED') {
      // กรณีพิการทุพพลภาพ: เอกสารข้อ 7 บังคับแนบ และต้องระบุอวัยวะที่สูญเสีย
      const doc7 = docs.find((d) => d.index === 7);
      if (!doc7 || !doc7.uploaded) {
        return NextResponse.json({
          success: false,
          message: 'กรณีพิการทุพพลภาพ บังคับต้องแนบเอกสารข้อที่ 7 (คำสั่งปลดฯ)'
        }, { status: 400 });
      }
      if (!specificCause) {
        return NextResponse.json({
          success: false,
          message: 'กรณีพิการทุพพลภาพ กรุณาระบุสาเหตุการสูญเสีย / อวัยวะที่สูญเสีย'
        }, { status: 400 });
      }
    }

    // ตรวจสอบเงื่อนไขเอกสารข้อที่ 10 (รูปถ่ายขนาด 4x6 นิ้ว)
    // กรณีหน้าที่สำคัญ (300,000 บาท) บังคับแนบรูปถ่าย แต่กรณีรับเงิน 60,000 บาท ไม่ต้องแนบ
    if (claimData.claimType === 'HIGH_RISK') {
      const doc10 = docs.find((d) => d.index === 10);
      if (!doc10 || !doc10.uploaded) {
        return NextResponse.json({
          success: false,
          message: 'กรณีปฏิบัติหน้าที่สำคัญ (รับเงิน 300,000 บาท) บังคับต้องแนบเอกสารข้อที่ 10 (รูปถ่ายขนาด 4x6 นิ้ว)'
        }, { status: 400 });
      }
    }

    const isAccident = claimData.incidentType === 'ACCIDENT';
    const newClaim = db.createClaim({
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
      message: 'ยื่นเสนอเรื่องขอรับสิทธิเงินค่าสินไหมทดแทนเรียบร้อยแล้ว',
      claim: newClaim 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
