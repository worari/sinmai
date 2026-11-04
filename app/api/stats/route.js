// app/api/stats/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear');
    const compareFiscalYear = searchParams.get('compareFiscalYear');
    const stats = db.getStatistics(fiscalYear, compareFiscalYear);
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
