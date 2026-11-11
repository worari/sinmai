// app/api/telegram/webhook/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SendToTelegram, getTelegramConfig } from '@/lib/telegram';
import { buildTelegramBotReply } from '@/lib/bot-commands';

export const dynamic = 'force-dynamic';

export async function GET() {
  await db.ensureReady();
  const config = getTelegramConfig();
  return NextResponse.json({
    success: true,
    webhookActive: true,
    telegramEnabled: config.enabled,
    configured: Boolean(config.botToken && config.chatId),
    commands: ['/start', '/help', '/stats', '/sla', '/pending', '/track']
  });
}

export async function POST(request) {
  try {
    const update = await request.json().catch(() => null);
    const msg = update?.message || update?.edited_message;
    const text = msg?.text;
    const incomingChatId = msg?.chat?.id ? String(msg.chat.id) : null;

    if (!text || !incomingChatId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // ตรวจสอบเฉพาะคำสั่ง Bot (ขึ้นต้นด้วย /)
    if (!text.trim().startsWith('/')) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    await db.ensureReady();
    // หากมีการตั้งค่า Chat ID ไว้ ให้จำกัดตอบเฉพาะกลุ่มที่กำหนด (หรือแชทส่วนตัวที่ผู้ดูแลตั้งค่า)
    const config = getTelegramConfig();
    if (config.chatId && String(config.chatId) !== incomingChatId && msg?.chat?.type !== 'private') {
      return NextResponse.json({ ok: true, ignored: 'unauthorized_chat' });
    }

    const reply = buildTelegramBotReply(text);
    if (!reply) {
      return NextResponse.json({ ok: true, ignored: 'unknown_command' });
    }

    const sendRes = await SendToTelegram(reply, {
      chatId: incomingChatId,
      bypassEnabled: true,
      parseMode: 'HTML'
    });

    return NextResponse.json({ ok: true, replied: sendRes.ok });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
}

