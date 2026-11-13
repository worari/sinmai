// app/api/units/template/route.js
import { NextResponse } from 'next/server';
import { generateUnitTemplateExcel } from '@/lib/excel';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const buffer = generateUnitTemplateExcel();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="rta_units_import_template.xlsx"',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

