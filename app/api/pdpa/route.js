// app/api/pdpa/route.js
// ระบบจัดการความยินยอม PDPA (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล) และการเก็บสถิติเยี่ยมชมเว็บไซต์ (Cookie Consent)
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  PDPA_COOKIE_NAME,
  VISITOR_COOKIE_NAME,
  PDPA_POLICY_VERSION,
  isHttpsRequest,
  maskIpAddress,
  parsePdpaConsentCookie,
  authenticateRequest
} from '@/lib/security';
import { extractClientInfo } from '@/lib/client-info';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminView = searchParams.get('admin') === 'true';

    if (adminView) {
      const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
      if (auth.response) return auth.response;

      const summary = db.getPdpaAndVisitSummary();
      const storage = await db.getStorageDiagnostics();
      return NextResponse.json(
        {
          success: true,
          policyVersion: PDPA_POLICY_VERSION,
          summary,
          storage
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const consent = parsePdpaConsentCookie(request);
    return NextResponse.json(
      {
        success: true,
        policyVersion: PDPA_POLICY_VERSION,
        hasConsented: Boolean(consent && consent.version === PDPA_POLICY_VERSION),
        consent
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await db.ensureReady();
    const body = await request.json();
    const { action, analytics = false, preferences = false, path: visitPath = '/' } = body;
    const clientInfo = extractClientInfo(request);
    const maskedIp = maskIpAddress(clientInfo.ip);
    const auth = authenticateRequest(request, db);

    if (action === 'SAVE_CONSENT') {
      const existingVid = request.cookies?.get?.(VISITOR_COOKIE_NAME)?.value;
      const visitorId = existingVid || 'v-' + crypto.randomUUID();
      const consentPayload = {
        necessary: true,
        securityLog: true,
        analytics: Boolean(analytics),
        preferences: Boolean(preferences),
        version: PDPA_POLICY_VERSION,
        consentedAt: new Date().toISOString()
      };

      const record = db.recordPdpaConsent({
        visitorId,
        userId: auth.user?.id || null,
        analytics: consentPayload.analytics,
        preferences: consentPayload.preferences,
        version: PDPA_POLICY_VERSION,
        maskedIp,
        device: clientInfo.device
      });
      await db.flush();

      const response = NextResponse.json(
        {
          success: true,
          message: 'บันทึกการตั้งค่าคุกกี้และความยินยอม PDPA เรียบร้อยแล้ว',
          consent: consentPayload,
          recordId: record.id
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );

      const isHttps = isHttpsRequest(request);
      response.cookies.set(PDPA_COOKIE_NAME, JSON.stringify(consentPayload), {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
        secure: isHttps
      });

      response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: consentPayload.analytics || consentPayload.preferences ? 90 * 24 * 60 * 60 : undefined,
        secure: isHttps
      });

      return response;
    }

    if (action === 'TRACK_VISIT') {
      const consent = parsePdpaConsentCookie(request);
      if (!consent || !consent.analytics) {
        return NextResponse.json({
          success: true,
          recorded: false,
          reason: 'analytics_consent_not_granted'
        });
      }

      const visitorId = request.cookies?.get?.(VISITOR_COOKIE_NAME)?.value || 'consented-session';
      db.recordVisitLog({
        visitorId,
        userRole: auth.user?.role || 'GUEST',
        path: visitPath,
        maskedIp,
        device: clientInfo.device
      });
      await db.flush();

      return NextResponse.json({ success: true, recorded: true });
    }

    return NextResponse.json({ success: false, message: 'Invalid PDPA action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

