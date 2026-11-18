// app/api/claims/export/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { exportClaimsToExcel } from '@/lib/excel';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await db.ensureReady();
    const auth = await requireAuth(request, db);
    if (auth.response) return auth.response;
    const user = auth.user;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';
    const sla = searchParams.get('sla') || 'ALL';
    const unitId = searchParams.get('unitId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let claims = db.getClaims(user);

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      claims = claims.filter(
        (c) =>
          (c.trackingCode && c.trackingCode.toLowerCase().includes(q)) ||
          (c.casualtyFirstName && c.casualtyFirstName.toLowerCase().includes(q)) ||
          (c.casualtyLastName && c.casualtyLastName.toLowerCase().includes(q)) ||
          (c.casualtyCitizenId && c.casualtyCitizenId.includes(q)) ||
          (c.unitName && c.unitName.toLowerCase().includes(q))
      );
    }

    // Filter by status (รองรับทั้งกลุ่มสถานะหลักและรายสถานะ)
    if (status && status !== 'ALL') {
      if (status === 'GROUP_IN_PROGRESS') {
        claims = claims.filter((c) => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_APPROVAL'].includes(c.status));
      } else if (status === 'GROUP_APPROVED') {
        claims = claims.filter((c) => ['APPROVED', 'INSURANCE_PROCESSING', 'DOC_REQUESTED'].includes(c.status));
      } else if (status === 'GROUP_PAID') {
        claims = claims.filter((c) => c.status === 'PAID' || c.status === 'SK_NOTIFIED');
      } else {
        claims = claims.filter((c) => c.status === status);
      }
    }

    // Filter by SLA
    if (sla !== 'ALL') {
      const now = new Date();
      claims = claims.filter((c) => {
        const created = new Date(c.reportDate || c.createdAt);
        const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        const remaining = 30 - days;
        if (sla === 'OVERDUE') return remaining <= 0 && c.status !== 'SK_NOTIFIED' && c.status !== 'PAID';
        if (sla === 'WARNING') return remaining > 0 && remaining <= 7 && c.status !== 'SK_NOTIFIED' && c.status !== 'PAID';
        if (sla === 'NORMAL') return remaining > 7 || c.status === 'PAID' || c.status === 'SK_NOTIFIED';
        return true;
      });
    }

    // Filter by unitId
    if (unitId && unitId !== 'ALL') {
      claims = claims.filter((c) => c.unitId === unitId);
    }

    // Filter by date range (เปรียบเทียบเฉพาะ YYYY-MM-DD แบบ inclusive ทั้งวันเริ่มต้นและวันสิ้นสุด)
    const getClaimDateKey = (c) => {
      const raw = c.reportDate || c.createdAt || '';
      if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
        return raw.slice(0, 10);
      }
      const d = new Date(raw);
      if (isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    if (startDate) {
      claims = claims.filter((c) => {
        const key = getClaimDateKey(c);
        return key && key >= startDate;
      });
    }
    if (endDate) {
      claims = claims.filter((c) => {
        const key = getClaimDateKey(c);
        return key && key <= endDate;
      });
    }

    const allUnits = db.getAllUnits();
    const buffer = exportClaimsToExcel(claims, { allUnits });

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `rta_claims_export_${dateStr}.xlsx`;

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

