// app/api/claims/[id]/document/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateAttachmentFile } from '@/lib/thai-utils';

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

// อัปโหลดหรือแทนที่ไฟล์เอกสารแนบ (Upload / Replace Attachment File)
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, docIndex, fileName, fileUrl, fileData, fileSize } = body;

    const user = db.findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }, { status: 401 });
    }

    // ตรวจสอบความปลอดภัยของไฟล์แนบ (ป้องกัน .exe, .sh และจำกัดไม่เกิน 10MB)
    const val = validateAttachmentFile({ name: fileName, size: fileSize });
    if (!val.valid) {
      return NextResponse.json({ success: false, message: val.error }, { status: 400 });
    }

    const updatedClaim = db.attachClaimDocument(id, docIndex, {
      fileName,
      fileUrl: fileUrl || `/uploads/${fileName}`,
      fileData,
      fileSize
    }, user);

    return NextResponse.json({
      success: true,
      message: `แนบไฟล์เอกสารลำดับที่ ${docIndex} เรียบร้อยแล้ว`,
      claim: updatedClaim
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

// ลบไฟล์เอกสารแนบ (Remove Attachment File)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const docIndex = Number(searchParams.get('docIndex'));

    const user = db.findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }, { status: 401 });
    }

    if (!docIndex) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุลำดับเอกสาร (docIndex)' }, { status: 400 });
    }

    const updatedClaim = db.removeClaimDocument(id, docIndex, user);
    return NextResponse.json({
      success: true,
      message: `ลบไฟล์แนบเอกสารลำดับที่ ${docIndex} เรียบร้อยแล้ว`,
      claim: updatedClaim
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
