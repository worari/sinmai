// lib/telegram.js
// ระบบแจ้งเตือนผ่าน Telegram Bot API

let telegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  chatId: process.env.TELEGRAM_CHAT_ID || '',
  enabled: process.env.TELEGRAM_ENABLED === 'true' || (Boolean(process.env.TELEGRAM_BOT_TOKEN) && process.env.TELEGRAM_ENABLED !== 'false')
};

const notificationHistory = [];

export function getTelegramConfig() {
  return { ...telegramConfig };
}

export function updateTelegramConfig(newConfig) {
  telegramConfig = { ...telegramConfig, ...newConfig };
  return telegramConfig;
}

export function getNotificationHistory() {
  return [...notificationHistory].reverse().slice(0, 50);
}

/**
 * ส่งข้อความแจ้งเตือนผ่าน Telegram Bot
 */
export async function sendTelegramNotification({ title, message, claimId, trackingCode, type = 'INFO' }) {
  const timestamp = new Date().toISOString();
  const alertRecord = {
    id: 'NOTIF-' + Date.now(),
    title,
    message,
    claimId,
    trackingCode,
    type,
    timestamp,
    status: 'SENT'
  };

  notificationHistory.push(alertRecord);

  // ตรวจสอบว่ามีการตั้งค่า Token และ Chat ID หรือไม่
  if (telegramConfig.enabled && telegramConfig.botToken && telegramConfig.chatId) {
    try {
      const text = `🎖️ *ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน ทบ.*\n\n📢 *${title}*\n📋 เลขที่เรื่อง: \`${trackingCode || '-'}\`\n💬 รายละเอียด: ${message}\n⏰ เวลา: ${new Date().toLocaleString('th-TH')}`;
      
      const response = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramConfig.chatId,
          text: text,
          parse_mode: 'Markdown'
        })
      });

      const resData = await response.json();
      if (!resData.ok) {
        alertRecord.status = 'FAILED';
        alertRecord.error = resData.description;
      }
    } catch (err) {
      alertRecord.status = 'ERROR';
      alertRecord.error = err.message;
    }
  }

  // ส่งต่อให้ Socket.io emit หากมี global.io
  if (global.io) {
    global.io.emit('new_notification', alertRecord);
  }

  return alertRecord;
}
