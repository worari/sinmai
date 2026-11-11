// app/api/telegram/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  getTelegramConfig,
  updateTelegramConfig,
  getNotificationHistory,
  getUnreadCount,
  sendTelegramNotification,
  SendToTelegram,
  getTelegramBotInfo,
  markNotificationsRead,
  clearNotificationHistory
} from '@/lib/telegram';
import { buildTelegramBotReply } from '@/lib/bot-commands';
import { requireAuth } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

function maskToken(token) {
  if (!token) return '';
  if (token.length <= 10) return `${token.slice(0, 3)}...`;
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

export async function GET(request) {
  try {
    const auth = await requireAuth(request, db);
    if (auth.response) return auth.response;
    const user = auth.user;

    const { searchParams } = new URL(request.url);
    const checkBot = searchParams.get('checkBot') === 'true' && user.role === 'ADMIN';

    const config = getTelegramConfig();
    const history = getNotificationHistory(user);
    const unreadCount = getUnreadCount(user.id, history);

    const io = global.io || globalThis.io;
    const socketClients = io?.engine?.clientsCount ?? 0;

    let botInfo = null;
    if (checkBot) {
      botInfo = await getTelegramBotInfo();
    }

    return NextResponse.json(
      {
        success: true,
        config: {
          botToken: user.role === 'ADMIN' ? maskToken(config.botToken) : '',
          hasBotToken: Boolean(config.botToken),
          chatId: user.role === 'ADMIN' ? (config.chatId || '') : '',
          enabled: config.enabled
        },
        history,
        unreadCount,
        socketClients,
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
    const body = await request.json();
    const { action, botToken, chatId, enabled, testMessage, message, title, trackingCode, notificationId, markAll, dryRun, command } = body;

    if (action === 'MARK_READ') {
      const auth = await requireAuth(request, db);
      if (auth.response) return auth.response;
      const updatedCount = markNotificationsRead({ notificationId, userId: auth.user.id, markAll: Boolean(markAll) });
      await db.flush();
      return NextResponse.json({ success: true, updatedCount });
    }

    // การตั้งค่า/ทดสอบ/ส่งประกาศ Bot ทั้งหมดจำกัดเฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้น
    const auth = await requireAuth(request, db, { roles: ['ADMIN'] });
    if (auth.response) return auth.response;
    const actor = auth.user;
    const actorName = `${actor.rank || ''} ${actor.firstName} ${actor.lastName}`.trim() || 'ผู้ดูแลระบบ';

    if (action === 'UPDATE_CONFIG') {
      const updateData = {};
      if (botToken !== undefined && !String(botToken).includes('...')) {
        updateData.botToken = botToken;
      }
      if (chatId !== undefined) updateData.chatId = chatId;
      if (enabled !== undefined) updateData.enabled = enabled;

      const updated = updateTelegramConfig(updateData);
      db.saveToFile(['notifications', 'telegramConfig']);
      await db.flush();
      return NextResponse.json({
        success: true,
        message: 'บันทึกการตั้งค่า Telegram Bot สำเร็จและบันทึกลงฐานข้อมูลแล้ว',
        config: {
          botToken: maskToken(updated.botToken),
          hasBotToken: Boolean(updated.botToken),
          chatId: updated.chatId || '',
          enabled: updated.enabled
        }
      });
    }

    if (action === 'CHECK_BOT') {
      const botInfo = await getTelegramBotInfo();
      return NextResponse.json({
        success: botInfo.ok,
        message: botInfo.ok
          ? `เชื่อมต่อ @${botInfo.bot?.username || 'Bot'} สำเร็จ`
          : botInfo.description || 'ไม่สามารถเชื่อมต่อ Telegram Bot ได้',
        botInfo
      });
    }

    if (action === 'SEND_TEST') {
      const result = await sendTelegramNotification({
        title: 'ทดสอบระบบแจ้งเตือน Socket.IO & Telegram Bot ทบ.',
        message: testMessage || 'ระบบสามารถเชื่อมต่อ Real-time Socket.IO และ Telegram Bot API ได้สำเร็จ',
        trackingCode: 'TEST-BOT-001',
        type: 'TEST',
        by: actorName,
        bypassEnabled: true
      });
      await db.flush();

      const ok = result.telegramSent;
      return NextResponse.json({
        success: true,
        telegramSent: ok,
        message: ok
          ? 'ส่งข้อความทดสอบไปยัง Telegram Bot และ Socket.IO สำเร็จแล้ว'
          : `ส่งแจ้งเตือนผ่าน Socket.IO สำเร็จ (สถานะ Telegram: ${result.error || result.status})`,
        result
      });
    }

    if (action === 'SEND_TO_TELEGRAM' || action === 'SEND_CUSTOM') {
      const customMsg = String(message || testMessage || '').trim();
      if (!customMsg) {
        return NextResponse.json({ success: false, message: 'กรุณาระบุข้อความที่ต้องการส่ง' }, { status: 400 });
      }

      if (body.rawDirectOnly) {
        const directRes = await SendToTelegram(customMsg, { bypassEnabled: Boolean(body.bypassEnabled) });
        return NextResponse.json({
          success: directRes.ok || directRes.skipped,
          message: directRes.ok ? 'ส่งข้อความผ่าน SendToTelegram สำเร็จ' : directRes.description,
          result: directRes
        });
      }

      const result = await sendTelegramNotification({
        title: title || 'ประกาศแจ้งเตือนจากส่วนกลาง กพ.ทบ.',
        message: customMsg,
        trackingCode: trackingCode || 'BROADCAST',
        type: 'TELEGRAM_DIRECT',
        by: actorName,
        bypassEnabled: Boolean(body.bypassEnabled !== false)
      });
      await db.flush();

      return NextResponse.json({
        success: true,
        telegramSent: result.telegramSent,
        message: result.telegramSent
          ? 'ส่งประกาศแจ้งเตือนไปยัง Socket.IO และ Telegram Bot เรียบร้อยแล้ว'
          : `ส่งแจ้งเตือนผ่าน Socket.IO แล้ว (Telegram: ${result.error || result.status})`,
        result
      });
    }

    if (action === 'SCAN_SLA') {
      const slaResult = db.scanAndNotifySla({
        dryRun: Boolean(dryRun),
        triggeredBy: actorName
      });
      if (slaResult.notification && typeof slaResult.notification.then === 'function') {
        slaResult.notification = await slaResult.notification;
      }
      await db.flush();
      return NextResponse.json({
        success: true,
        message: dryRun
          ? `พบคำร้องเกินกำหนด ${slaResult.overdueCount} เรื่อง และใกล้ครบกำหนด ${slaResult.warningCount} เรื่อง`
          : `ส่งสรุปแจ้งเตือน SLA (เกินกำหนด ${slaResult.overdueCount} / เฝ้าระวัง ${slaResult.warningCount} เรื่อง) แล้ว`,
        ...slaResult
      });
    }

    if (action === 'BOT_COMMAND') {
      const reply = buildTelegramBotReply(command || '/stats');
      if (!reply) {
        return NextResponse.json({ success: false, message: 'ไม่รู้จักคำสั่ง Bot ที่ระบุ (ลอง /help, /stats, /sla, /pending)' }, { status: 400 });
      }
      let sent = null;
      if (body.sendToTelegram) {
        sent = await SendToTelegram(reply, { bypassEnabled: true, parseMode: 'HTML' });
      }
      return NextResponse.json({ success: true, reply, sent });
    }

    if (action === 'CLEAR_HISTORY') {
      clearNotificationHistory();
      await db.flush();
      return NextResponse.json({ success: true, message: 'ล้างประวัติการแจ้งเตือนทั้งหมดแล้ว' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
