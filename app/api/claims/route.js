// app/api/claims/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateCitizenId, validateAttachmentFile, validateName, validateDateNotFuture } from '@/lib/thai-utils';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, db);
    if (auth.response) return auth.response;
    const user = auth.user;

    const { searchParams } = new URL(request.url);
    const checkCitizenId = searchParams.get('checkCitizenId');
    if (checkCitizenId) {
      const checkResult = db.checkDuplicateCasualty(checkCitizenId);
      return NextResponse.json({ success: true, ...checkResult }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // โหมดแบ่งหน้าจากฝั่ง Server (Server-Side Pagination + Lightweight Payload)
    const pageParam = searchParams.get('page');
    const mode = searchParams.get('mode');
    if (mode === 'paginated' || pageParam !== null) {
      const result = db.getClaimsPaginated(user, {
        page: Number(pageParam) || 1,
        limit: Number(searchParams.get('limit')) || 10,
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || 'ALL',
        sla: searchParams.get('sla') || 'ALL',
        startDate: searchParams.get('startDate') || '',
        endDate: searchParams.get('endDate') || ''
      });
      return NextResponse.json({ success: true, ...result }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // โหมดปกติ: ตัด Base64 fileData ออกโดยอัตโนมัติ (เว้นแต่ระบุ ?includeFiles=1) เพื่อลดขนาด Payload และเร่งความเร็ว
    const includeFiles = searchParams.get('includeFiles') === '1';
    const rawClaims = db.getClaims(user);
    const claims = includeFiles ? rawClaims : rawClaims.map((c) => db.toClaimSummary(c));
    return NextResponse.json({ success: true, claims }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['UNIT_OFFICER', 'ADMIN'] });
    if (auth.response) return auth.response;
    const user = auth.user;

    const body = await request.json();
    const { claimData, isDraft } = body;

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
      await db.flush();

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

    if (!validateName(claimData.casualtyFirstName) || !validateName(claimData.casualtyLastName)) {
      return NextResponse.json({ 
        success: false, 
        message: 'ชื่อและนามสกุลของผู้สูญเสียต้องมีอย่างน้อย 2 ตัวอักษร และต้องไม่มีตัวเลขหรือสัญลักษณ์พิเศษ' 
      }, { status: 400 });
    }

    // ตรวจสอบเลข ปชช. ผู้สูญเสีย
    if (!validateCitizenId(claimData.casualtyCitizenId)) {
      return NextResponse.json({ 
        success: false, 
        message: 'เลขประจำตัวประชาชนของผู้สูญเสียไม่ถูกต้องตามรูปแบบทางการ (Checksum Error)' 
      }, { status: 400 });
    }

    // ตรวจสอบการยื่นเรื่องซ้ำ
    const dupCheck = db.checkDuplicateCasualty(claimData.casualtyCitizenId);
    if (dupCheck.isDuplicate) {
      return NextResponse.json({
        success: false,
        message: `ห้ามยื่นเรื่องซ้ำ: กำลังพลเลขประจำตัวประชาชนนี้เคยยื่นเสนอเรื่องแล้ว (${dupCheck.trackingCode}) โดย ${dupCheck.unitName}`
      }, { status: 409 });
    }

    // ตรวจสอบความถูกต้องของวันที่ (ไม่เกินวันปัจจุบัน และลำดับวันต้องถูกต้อง)
    if (claimData.casualtyBirthDate && !validateDateNotFuture(claimData.casualtyBirthDate)) {
      return NextResponse.json({ success: false, message: 'วัน/เดือน/ปีเกิดของผู้สูญเสียต้องไม่อยู่ในอนาคต' }, { status: 400 });
    }

    if (claimData.lossDate && !validateDateNotFuture(claimData.lossDate)) {
      return NextResponse.json({ success: false, message: 'วันที่เกิดเหตุ/สูญเสีย ต้องไม่อยู่ในอนาคต' }, { status: 400 });
    }

    if (claimData.casualtyBirthDate && claimData.lossDate && claimData.lossDate < claimData.casualtyBirthDate) {
      return NextResponse.json({ success: false, message: 'วันที่เกิดเหตุ/สูญเสีย ต้องอยู่หลังจากวัน/เดือน/ปีเกิดของผู้สูญเสีย' }, { status: 400 });
    }

    if (claimData.reportDate && !validateDateNotFuture(claimData.reportDate)) {
      return NextResponse.json({ success: false, message: 'วันที่รายงานต้องไม่อยู่ในอนาคต' }, { status: 400 });
    }

    if (claimData.lossDate && claimData.reportDate && claimData.reportDate < claimData.lossDate) {
      return NextResponse.json({ success: false, message: 'วันที่รายงานต้องเป็นวันเดียวกันหรือหลังจากวันที่เกิดเหตุ/สูญเสีย' }, { status: 400 });
    }

    if (!claimData.causeOfLoss || String(claimData.causeOfLoss).trim().length < 10) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุรายละเอียดและพฤติการณ์เหตุการณ์ตาม กพ.4 อย่างน้อย 10 ตัวอักษร' }, { status: 400 });
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
    await db.flush();

    return NextResponse.json({ 
      success: true, 
      message: 'ยื่นเสนอเรื่องขอรับสิทธิเงินค่าสินไหมทดแทนเรียบร้อยแล้ว',
      claim: newClaim 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
