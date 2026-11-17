// app/api/claims/import/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { parseClaimsFromExcel } from '@/lib/excel';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    await db.ensureReady();
    const auth = await requireAuth(request, db, { roles: ['ADMIN', 'UNIT_OFFICER'] });
    if (auth.response) return auth.response;
    const user = auth.user;

    const contentType = request.headers.get('content-type') || '';

    // กรณีส่งข้อมูลแบบ FormData (อัปโหลดไฟล์ Excel .xlsx หรือ .xls)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      const isPreview = formData.get('preview') === 'true';
      const overwriteExisting = formData.get('overwriteExisting') !== 'false';

      if (!file || typeof file === 'string') {
        return NextResponse.json(
          { success: false, message: 'กรุณาเลือกไฟล์ Excel (.xlsx) ที่ต้องการนำเข้า' },
          { status: 400 }
        );
      }

      const fileName = file.name || '';
      if (!fileName.toLowerCase().endsWith('.xlsx') && !fileName.toLowerCase().endsWith('.xls') && !fileName.toLowerCase().endsWith('.csv')) {
        return NextResponse.json(
          { success: false, message: 'รองรับเฉพาะไฟล์นามสกุล .xlsx, .xls หรือ .csv เท่านั้น' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const allUnits = db.getAllUnits();
      const parsed = parseClaimsFromExcel(buffer, { allUnits });

      if (!parsed.success) {
        return NextResponse.json(parsed, { status: 400 });
      }

      // ถ้าเป็นโหมดพรีวิว ส่งข้อมูลกลับไปให้ผู้ใช้ตรวจสอบก่อนบันทึกจริง
      if (isPreview) {
        return NextResponse.json({
          success: true,
          preview: true,
          fileName,
          totalRows: parsed.totalRows,
          validCount: parsed.validCount,
          errorCount: parsed.errorCount,
          warningCount: parsed.warningCount,
          claims: parsed.claims,
          errors: parsed.errors,
          warnings: parsed.warnings
        });
      }

      // บันทึกข้อมูลลงฐานข้อมูลจริง
      const importResult = db.importClaims(parsed.claims, {
        overwriteExisting,
        currentActor: user,
        user
      });
      await db.flush();

      return NextResponse.json({
        success: true,
        message: `นำเข้าข้อมูลคำร้องสินไหมจากไฟล์ "${fileName}" สำเร็จ เพิ่มใหม่ ${importResult.addedCount} เรื่อง, ปรับปรุง ${importResult.updatedCount} เรื่อง, ข้าม ${importResult.skippedCount} เรื่อง`,
        ...importResult
      }, { status: 200 });
    }

    // กรณีส่งข้อมูลแบบ JSON (กดยืนยันหลังจาก Preview หรือส่ง payload)
    const body = await request.json();
    const { claims, overwriteExisting = true } = body;

    if (!Array.isArray(claims) || claims.length === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบรายการข้อมูลคำร้องที่ต้องการนำเข้า' }, { status: 400 });
    }

    const importResult = db.importClaims(claims, {
      overwriteExisting: Boolean(overwriteExisting),
      currentActor: user,
      user
    });
    await db.flush();

    return NextResponse.json({
      success: true,
      message: `นำเข้าข้อมูลคำร้องสินไหมสำเร็จ เพิ่มใหม่ ${importResult.addedCount} เรื่อง, ปรับปรุง ${importResult.updatedCount} เรื่อง, ข้าม ${importResult.skippedCount} เรื่อง`,
      ...importResult
    }, { status: 200 });

  } catch (error) {
    console.error('Claims Excel Import error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลคำร้องสินไหม' },
      { status: 500 }
    );
  }
}

