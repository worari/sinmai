// app/api/claims/[id]/document/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateAttachmentFile } from '@/lib/thai-utils';
import { requireAuth } from '@/lib/api-auth';

function parseDataUriToBuffer(dataUri) {
  if (!dataUri || typeof dataUri !== 'string' || !dataUri.startsWith('data:')) return null;
  const commaIdx = dataUri.indexOf(',');
  if (commaIdx === -1) return null;
  const header = dataUri.slice(5, commaIdx);
  const base64Part = dataUri.slice(commaIdx + 1);
  const mimeType = header.split(';')[0] || 'application/octet-stream';
  const buffer = Buffer.from(base64Part, 'base64');
  return { mimeType, buffer };
}

// ดึงไฟล์แนบจริงรายเอกสารแบบ On-Demand (รองรับทั้งโหมดสตรีมไฟล์จริง raw/download และโหมด JSON)
export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(request, db);
    if (auth.response) return auth.response;
    const user = auth.user;

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const docIndexParam = searchParams.get('docIndex');
    const isRaw = searchParams.get('raw') === '1';
    const isDownload = searchParams.get('download') === '1';

    const claim = db.getClaimById(id, user);
    if (!claim) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลคำร้อง' }, { status: 404 });
    }

    let targetDoc = null;
    if (docIndexParam === 'approval' || docIndexParam === 'อนุมัติ') {
      if (claim.approvalDocument) {
        targetDoc = {
          index: 'อนุมัติ',
          name: 'หนังสือคำสั่งอนุมัติสิทธิเงินสินไหม (จก.กพ.ทบ.)',
          fileName: claim.approvalDocument.fileName || 'approval_order.pdf',
          fileData: claim.approvalDocument.fileData || null,
          fileUrl: claim.approvalDocument.fileUrl || '',
          uploaded: Boolean(claim.approvalDocument.fileData || claim.approvalDocument.fileName)
        };
      }
    } else {
      const idx = Number(docIndexParam);
      if (!idx) {
        return NextResponse.json({ success: false, message: 'กรุณาระบุลำดับเอกสาร (docIndex)' }, { status: 400 });
      }
      targetDoc = (claim.documents || []).find((d) => Number(d.index) === idx) || null;
    }

    if (!targetDoc) {
      return NextResponse.json({ success: false, message: 'ไม่พบเอกสารที่ระบุ' }, { status: 404 });
    }

    if (isRaw || isDownload) {
      const parsed = parseDataUriToBuffer(targetDoc.fileData);
      if (!parsed) {
        return NextResponse.json(
          { success: false, message: 'ยังไม่มีไฟล์แนบจริงในเอกสารรายการนี้' },
          { status: 404 }
        );
      }

      const safeFileName = (targetDoc.fileName || `document_${docIndexParam}.pdf`).replace(/[\r\n"]/g, '');
      const encodedName = encodeURIComponent(safeFileName);
      const disposition = isDownload
        ? `attachment; filename="document_${docIndexParam}"; filename*=UTF-8''${encodedName}`
        : `inline; filename="document_${docIndexParam}"; filename*=UTF-8''${encodedName}`;

      return new NextResponse(parsed.buffer, {
        status: 200,
        headers: {
          'Content-Type': parsed.mimeType,
          'Content-Disposition': disposition,
          'Content-Length': String(parsed.buffer.length),
          'Cache-Control': 'private, max-age=300',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    return NextResponse.json(
      {
        success: true,
        document: {
          ...targetDoc,
          hasFileData: Boolean(targetDoc.fileData)
        }
      },
      { headers: { 'Cache-Control': 'private, max-age=60' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 403 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth(request, db, { roles: ['KSP_OFFICER', 'INSURANCE_REP', 'ADMIN'] });
    if (auth.response) return auth.response;
    const user = auth.user;

    const { id } = params;
    const { docIndex, status, comment } = await request.json();

    const updatedClaim = db.updateDocumentStatus(id, docIndex, status, comment, user);
    await db.flush();
    return NextResponse.json({
      success: true,
      claim: { ...db.toClaimSummary(updatedClaim), timeline: updatedClaim.timeline || [] }
    });
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
      claim: { ...db.toClaimSummary(updatedClaim), timeline: updatedClaim.timeline || [] }
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
      claim: { ...db.toClaimSummary(updatedClaim), timeline: updatedClaim.timeline || [] }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
