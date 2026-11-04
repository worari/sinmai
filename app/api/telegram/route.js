// app/api/telegram/route.js
import { NextResponse } from 'next/server';
import { getTelegramConfig, updateTelegramConfig, getNotificationHistory, sendTelegramNotification } from '@/lib/telegram';

export async function GET() {
  const config = getTelegramConfig();
  const history = getNotificationHistory();
  return NextResponse.json({ 
    success: true, 
    config: {
      botToken: config.botToken ? `${config.botToken.slice(0, 6)}...${config.botToken.slice(-4)}` : '',
      chatId: config.chatId || '',
      enabled: config.enabled
    },
    history 
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, botToken, chatId, enabled, testMessage } = body;

    if (action === 'UPDATE_CONFIG') {
      const updateData = {};
      if (botToken !== undefined && !botToken.includes('...')) updateData.botToken = botToken;
      if (chatId !== undefined) updateData.chatId = chatId;
      if (enabled !== undefined) updateData.enabled = enabled;

      const updated = updateTelegramConfig(updateData);
      return NextResponse.json({ success: true, message: 'บันทึกการตั้งค่า Telegram สำเร็จ', config: updated });
    }

    if (action === 'SEND_TEST') {
      const result = await sendTelegramNotification({
        title: 'ทดสอบระบบแจ้งเตือน Telegram Bot ทบ.',
        message: testMessage || 'ระบบสามารถเชื่อมต่อและส่งข้อความแจ้งเตือนอัตโนมัติสำเร็จ',
        trackingCode: 'TEST-BOT-001',
        type: 'TEST'
      });

      return NextResponse.json({ success: true, message: 'ส่งข้อความทดสอบเรียบร้อยแล้ว', result });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
