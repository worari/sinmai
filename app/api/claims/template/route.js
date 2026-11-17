// app/api/claims/template/route.js
import { NextResponse } from 'next/server';
import { generateClaimsTemplateExcel } from '@/lib/excel';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const buffer = generateClaimsTemplateExcel();
    const filename = 'rta_claims_import_template.xlsx';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

