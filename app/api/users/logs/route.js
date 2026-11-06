// app/api/users/logs/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';
    const action = searchParams.get('action') || 'ALL';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const result = db.getActivityLogs({
      searchQuery,
      action,
      limit,
      page
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
