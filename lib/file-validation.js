// lib/file-validation.js
// ระบบตรวจสอบความปลอดภัยและขนาดไฟล์แนบ (ป้องกันไฟล์สั่งรัน .exe และจำกัดขนาดไม่เกิน 10MB)

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB = 10,485,760 bytes
export const MAX_FILE_SIZE_MB = 10;

// รายการนามสกุลไฟล์อันตราย / ไฟล์สั่งรัน (Dangerous Executable & Script Extensions)
export const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.vbs', '.vbe', '.js', '.jse', '.wsf', 
  '.wsh', '.msc', '.msi', '.msp', '.com', '.scr', '.pif', '.application', '.gadget', 
  '.ps1', '.ps1xml', '.ps2', '.ps2xml', '.psc1', '.psc2', '.jar', '.dll', '.cpl', 
  '.hta', '.reg', '.inf', '.sys', '.drv', '.apk', '.bin', '.cgi', '.py', '.rb',
  '.pl', '.php', '.asp', '.aspx', '.jsp', '.elf', '.iso', '.dmg'
];

// รายการนามสกุลไฟล์ที่อนุญาตตามระเบียบราชการ (Allowed Safe Document & Image Extensions)
export const ALLOWED_EXTENSIONS = [
  '.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.doc', '.docx', '.xls', '.xlsx'
];

/**
 * ตรวจสอบความถูกต้องและความปลอดภัยของไฟล์แนบ
 * @param {File|Object} file - อ็อบเจกต์ไฟล์ (Browser File หรือ Object ที่มี name, size)
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAttachmentFile(file) {
  if (!file) {
    return { valid: false, error: 'ไม่พบข้อมูลไฟล์' };
  }

  const fileName = file.name || file.fileName || '';
  const fileSize = file.size !== undefined ? file.size : (file.fileSize || 0);
  const lowerName = fileName.toLowerCase().trim();

  // 1. ตรวจสอบว่ามีนามสกุลอันตรายหรือไม่ (ป้องกันไฟล์สั่งรัน)
  const isDangerous = DANGEROUS_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (isDangerous) {
    return {
      valid: false,
      error: `ตรวจพบไฟล์ไม่ปลอดภัย: ไม่อนุญาตให้อัปโหลดไฟล์สั่งรันหรือโปรแกรม (${fileName}) เพื่อความปลอดภัยของระบบราชการ อนุญาตเฉพาะไฟล์เอกสารและรูปภาพ (.pdf, .jpg, .png, .doc, .docx) เท่านั้น`
    };
  }

  // 2. ตรวจสอบว่านามสกุลอยู่ในรายการที่อนุญาตหรือไม่
  const isAllowed = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (!isAllowed) {
    return {
      valid: false,
      error: `ประเภทไฟล์ไม่ถูกต้อง: ไฟล์ "${fileName}" ไม่ใช่ไฟล์ที่ระบบรองรับ กรุณาแนบไฟล์ PDF, รูปภาพ (JPG, PNG) หรือเอกสาร (DOC, DOCX)`
    };
  }

  // 3. ตรวจสอบขนาดไฟล์ไม่เกิน 10MB
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (fileSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `ขนาดไฟล์เกินกำหนด: ไฟล์ "${fileName}" มีขนาด ${sizeInMB} MB ซึ่งเกินขีดจำกัดสูงสุด 10 MB กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 10 MB`
    };
  }

  return { valid: true };
}

