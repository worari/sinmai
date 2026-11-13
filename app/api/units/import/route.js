// app/api/units/import/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { parseUnitsFromExcel } from '@/lib/excel';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;

    await db.ensureReady();
    const contentType = request.headers.get('content-type') || '';

    // กรณีส่งข้อมูลแบบ FormData (อัปโหลดไฟล์ Excel .xlsx)
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
      if (!fileName.toLowerCase().endsWith('.xlsx') && !fileName.toLowerCase().endsWith('.xls')) {
        return NextResponse.json(
          { success: false, message: 'รองรับเฉพาะไฟล์ Excel นามสกุล .xlsx หรือ .xls เท่านั้น' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const parsed = parseUnitsFromExcel(buffer, db.units);

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
          units: parsed.units,
          errors: parsed.errors,
          warnings: parsed.warnings
        });
      }

      // บันทึกข้อมูลลงฐานข้อมูลจริง
      const importResult = db.importUnits(parsed.units, {
        overwriteExisting,
        currentAdmin: auth.user
      });
      await db.flush();

      return NextResponse.json({
        success: true,
        message: `นำเข้าโครงสร้างหน่วยจากไฟล์ "${fileName}" สำเร็จ เพิ่มใหม่ ${importResult.addedCount} หน่วย, ปรับปรุง ${importResult.updatedCount} หน่วย, ข้าม ${importResult.skippedCount} หน่วย`,
        ...importResult
      }, { status: 200 });
    }

    // กรณีส่งข้อมูลแบบ JSON (กดยืนยันหลังจาก Preview หรือส่ง payload)
    const body = await request.json();
    const { units, overwriteExisting = true } = body;

    if (!Array.isArray(units) || units.length === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบรายการข้อมูลหน่วยที่ต้องการนำเข้า' }, { status: 400 });
    }

    const importResult = db.importUnits(units, {
      overwriteExisting: Boolean(overwriteExisting),
      currentAdmin: auth.user
    });
    await db.flush();

    return NextResponse.json({
      success: true,
      message: `นำเข้าโครงสร้างหน่วยสำเร็จ เพิ่มใหม่ ${importResult.addedCount} หน่วย, ปรับปรุง ${importResult.updatedCount} หน่วย, ข้าม ${importResult.skippedCount} หน่วย`,
      ...importResult
    }, { status: 200 });

  } catch (error) {
    console.error('Units Excel Import error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel โครงสร้างหน่วย' },
      { status: 500 }
    );
  }
}

