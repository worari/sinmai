// app/api/claims/[id]/document/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateAttachmentFile } from '@/lib/thai-utils';
import { requireAuth } from '@/lib/api-auth';

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth(request, db, { roles: ['KSP_OFFICER', 'INSURANCE_REP', 'ADMIN'] });
    if (auth.response) return auth.response;
    const user = auth.user;

    const { id } = params;
    const { docIndex, status, comment } = await request.json();

    const updatedClaim = db.updateDocumentStatus(id, docIndex, status, comment, user);
    await db.flush();
    return NextResponse.json({ success: true, claim: updatedClaim });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// อัปโหลดหรือแทนที่ไฟล์เอกสารแนบ (Upload / Replace Attachment File)
export async function POST(request, { params }) {
  try {
    const auth = await requireAuth(request, db, { roles: ['UNIT_OFFICER', 'ADMIN'] });
    if (auth.response) return auth.response;
    const user = auth.user;

    const { id } = params;
    const body = await request.json();
    const { docIndex, fileName, fileUrl, fileData, fileSize } = body;

    // ตรวจสอบความปลอดภัยของไฟล์แนบ (ป้องกัน .exe, .sh, .html, .svg และจำกัดไม่เกิน 10MB)
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
    await db.flush();

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
    const auth = await requireAuth(request, db, { roles: ['UNIT_OFFICER', 'ADMIN'] });
    if (auth.response) return auth.response;
    const user = auth.user;

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const docIndex = Number(searchParams.get('docIndex'));

    if (!docIndex) {
      return NextResponse.json({ success: false, message: 'กรุณาระบุลำดับเอกสาร (docIndex)' }, { status: 400 });
    }

    const updatedClaim = db.removeClaimDocument(id, docIndex, user);
    await db.flush();
    return NextResponse.json({
      success: true,
      message: `ลบไฟล์แนบเอกสารลำดับที่ ${docIndex} เรียบร้อยแล้ว`,
      claim: updatedClaim
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
