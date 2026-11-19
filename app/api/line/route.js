// app/api/line/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  getLineConfig,
  updateLineConfig,
  getLineBotInfo,
  sendLinePushMessage
} from '@/lib/line';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

function maskSecret(secret) {
  if (!secret) return '';
  if (secret.length <= 8) return `${secret.slice(0, 2)}...`;
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}

export async function GET(request) {
  try {
    const auth = await requireAuth(request, db);
    if (auth.response) return auth.response;
    const user = auth.user;

    const { searchParams } = new URL(request.url);
    const checkBot = searchParams.get('checkBot') === 'true' && user.role === 'ADMIN';

    const config = getLineConfig();

    let botInfo = null;
    if (checkBot) {
      botInfo = await getLineBotInfo();
    }

    return NextResponse.json(
      {
        success: true,
        config: {
          channelId: config.channelId || '',
          channelSecret: user.role === 'ADMIN' ? maskSecret(config.channelSecret) : '',
          hasChannelSecret: Boolean(config.channelSecret),
          userId: config.userId || '',
          enabled: config.enabled
        },
        ...(botInfo ? { botInfo } : {})
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;
    const actor = auth.user;

    const body = await request.json();
    const { action, channelId, channelSecret, userId, targetUserId, userIdTarget, enabled, testMessage } = body;

    if (action === 'UPDATE_CONFIG') {
      const updateData = {};
      if (channelId !== undefined) updateData.channelId = String(channelId).trim();
      if (channelSecret !== undefined && !String(channelSecret).includes('...')) {
        updateData.channelSecret = String(channelSecret).trim();
      }
      const resolvedTarget = targetUserId !== undefined ? targetUserId : (userIdTarget !== undefined ? userIdTarget : userId);
      if (resolvedTarget !== undefined) updateData.userId = String(resolvedTarget).trim();
      if (enabled !== undefined) updateData.enabled = Boolean(enabled);

      const updated = updateLineConfig(updateData);
      db.saveToFile(['notifications', 'lineConfig']);
      await db.flush();

      const botInfo = updated.channelId && updated.channelSecret ? await getLineBotInfo() : null;

      return NextResponse.json({
        success: true,
        message: 'บันทึกการตั้งค่า LINE Messaging API เรียบร้อยแล้ว',
        config: {
          channelId: updated.channelId,
          channelSecret: maskSecret(updated.channelSecret),
          hasChannelSecret: Boolean(updated.channelSecret),
          userId: updated.userId,
          enabled: updated.enabled
        },
        botInfo
      });
    }

    if (action === 'TEST_LINE') {
      const targetUser = targetUserId || userIdTarget || userId || undefined;
      const sampleText = testMessage || '🎖️ ทดสอบการแจ้งเตือนจากระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน กองทัพบก (LINE Messaging API: กองสิทธิกำลังพล) เชื่อมต่อสำเร็จเรียบร้อยครับ';

      const result = await sendLinePushMessage({
        to: targetUser,
        text: sampleText,
        bypassEnabled: true
      });

      return NextResponse.json({
        success: result.ok,
        lineSent: result.ok,
        details: result,
        message: result.ok
          ? `ส่งข้อความทดสอบไปยัง LINE (${result.recipientCount} ผู้รับ) สำเร็จเรียบร้อย`
          : `ส่งข้อความไม่สำเร็จ: ${result.results?.[0]?.message || result.description || 'เกิดข้อผิดพลาด'}`
      });
    }

    if (action === 'CHECK_BOT') {
      const botInfo = await getLineBotInfo();
      return NextResponse.json({
        success: Boolean(botInfo.ok),
        message: botInfo.ok
          ? `เชื่อมต่อ LINE Official Account: "${botInfo.bot?.displayName || ''}" (@${botInfo.bot?.basicId || ''}) สำเร็จเรียบร้อย`
          : (botInfo.description || 'ไม่สามารถเชื่อมต่อ LINE Bot ได้'),
        botInfo
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
