// app/api/content/upload/route.js - API อัปโหลดไฟล์คู่มือและเอกสารประกอบ
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // 1. ตรวจสอบกรณี Multipart Form Data
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || typeof file === 'string') {
        return NextResponse.json({ success: false, message: 'ไม่พบไฟล์ที่ต้องการอัปโหลด' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // คำนวณขนาดไฟล์ให้อ่านง่าย
      const sizeInBytes = file.size;
      let humanSize = `${(sizeInBytes / 1024).toFixed(0)} KB`;
      if (sizeInBytes >= 1024 * 1024) {
        humanSize = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
      }

      // ดึงนามสกุลไฟล์
      const originalName = file.name || 'document.pdf';
      const ext = path.extname(originalName).replace('.', '').toUpperCase() || 'PDF';

      // สร้างชื่อไฟล์ปลอดภัยพร้อม timestamp
      const timestamp = Date.now();
      const cleanBaseName = path.basename(originalName, path.extname(originalName)).replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, '_');
      const safeFileName = `${cleanBaseName}_${timestamp}.${ext.toLowerCase()}`;

      // บันทึกลง disk ใน public/uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadsDir, safeFileName), buffer);
      } catch (err) {
        console.warn('Cannot write to public/uploads disk, relying on dataUrl:', err.message);
      }

      // สร้าง Base64 Data URL สำหรับ Client preview และ download
      const mimeType = file.type || 'application/octet-stream';
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

    // 2. ตรวจสอบกรณี JSON payload (Base64 data)
    const body = await request.json();
    if (!body || !body.fileData || !body.fileName) {
      return NextResponse.json({ success: false, message: 'ข้อมูลไฟล์ไม่ถูกต้อง' }, { status: 400 });
    }

    const { fileName, fileData, format, size } = body;
    return NextResponse.json({
      success: true,
      message: `บันทึกไฟล์ "${fileName}" สำเร็จ`,
      fileName,
      fileUrl: `/uploads/${fileName}`,
      fileData,
      size: size || '1.0 MB',
      format: (format || path.extname(fileName).replace('.', '')).toUpperCase() || 'PDF'
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ' + error.message 
    }, { status: 500 });
  }
}
