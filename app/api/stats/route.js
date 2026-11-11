// app/api/stats/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireAuth(request, db);
    if (auth.response) return auth.response;
    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear');
    const compareFiscalYear = searchParams.get('compareFiscalYear');
    const periodType = searchParams.get('periodType') || 'fiscal';
    const compareYearsParam = searchParams.get('compareYears');
    const compareYears = compareYearsParam
      ? compareYearsParam.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n))
      : null;

    const stats = db.getStatistics(fiscalYear, compareFiscalYear, {
      periodType,
      compareYears
    });
    return NextResponse.json(
      { success: true, stats },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
