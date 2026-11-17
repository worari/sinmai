// app/layout.js
import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน | กองทัพบก',
  description: 'ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทนกำลังพลผู้สูญเสีย เสียชีวิต หรือพิการทุพพลภาพ กองทัพบก พร้อมระบบรายงานผลแบบ Real-time และการแจ้งเตือน Telegram',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#041417'
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
