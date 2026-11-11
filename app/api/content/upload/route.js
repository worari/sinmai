// app/api/content/upload/route.js - API อัปโหลดไฟล์คู่มือและเอกสารประกอบ (เฉพาะ Admin พร้อมตรวจสอบความปลอดภัยไซเบอร์)
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { validateContentUpload } from '@/lib/security';

export async function POST(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || typeof file === 'string') {
        return NextResponse.json({ success: false, message: 'ไม่พบไฟล์ที่ต้องการอัปโหลด' }, { status: 400 });
      }

      const originalName = file.name || 'document.pdf';
      const mimeType = file.type || 'application/octet-stream';
      const check = validateContentUpload({ fileName: originalName, mimeType, size: file.size });
      if (!check.valid) {
        return NextResponse.json({ success: false, message: check.error }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const sizeInBytes = file.size;
      let humanSize = `${(sizeInBytes / 1024).toFixed(0)} KB`;
      if (sizeInBytes >= 1024 * 1024) {
        humanSize = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
      }

      const ext = check.ext.toUpperCase();
      const timestamp = Date.now();
      const cleanBaseName = path
        .basename(originalName, path.extname(originalName))
        .replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, '_')
        .slice(0, 60);
      const safeFileName = `${cleanBaseName || 'doc'}_${timestamp}.${check.ext}`;

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadsDir, safeFileName), buffer);
      } catch (err) {
        console.warn('Cannot write to public/uploads disk, relying on dataUrl:', err.message);
      }

      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return NextResponse.json({
        success: true,
        message: `อัปโหลดไฟล์ "${originalName}" สำเร็จ`,
        fileName: originalName,
        savedFileName: safeFileName,
        fileUrl: `/uploads/${safeFileName}`,
        fileData: dataUrl,
        size: humanSize,
        format: ext
      });
    }

    const body = await request.json();
    if (!body || !body.fileData || !body.fileName) {
      return NextResponse.json({ success: false, message: 'ข้อมูลไฟล์ไม่ถูกต้อง' }, { status: 400 });
    }

    const check = validateContentUpload({
      fileName: body.fileName,
      mimeType: '',
      size: Buffer.byteLength(String(body.fileData), 'utf8')
    });
    if (!check.valid) {
      return NextResponse.json({ success: false, message: check.error }, { status: 400 });
    }

    const safeFileName = path.basename(String(body.fileName)).replace(/[^a-zA-Z0-9._\u0E00-\u0E7F-]/g, '_');
    const { format, size, fileData } = body;
    return NextResponse.json({
      success: true,
      message: `บันทึกไฟล์ "${safeFileName}" สำเร็จ`,
      fileName: safeFileName,
      fileUrl: `/uploads/${safeFileName}`,
      fileData,
      size: size || '1.0 MB',
      format: (format || check.ext).toUpperCase() || 'PDF'
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ' + error.message },
      { status: 500 }
    );
  }
}
