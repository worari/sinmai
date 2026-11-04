// app/layout.js
import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน | กองทัพบก',
  description: 'ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทนกำลังพลผู้สูญเสีย เสียชีวิต หรือพิการทุพพลภาพ กองทัพบก พร้อมระบบรายงานผลแบบ Real-time และการแจ้งเตือน Telegram',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
