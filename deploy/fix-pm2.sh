#!/bin/bash
# ==============================================================================
# deploy/fix-pm2.sh
# สคริปต์แก้ไขและเริ่มการทำงานของ PM2 สำหรับระบบสินไหม ทบ. (rta-sinmai)
# ==============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo -e "${CYAN}====================================================================${NC}"
echo -e "${YELLOW}⚙️  กำลังตั้งค่าและเริ่มต้นระบบ PM2 สำหรับ rta-sinmai...${NC}"
echo -e "${CYAN}====================================================================${NC}"

# 1. สร้างโฟลเดอร์เก็บ Log
mkdir -p "$APP_DIR/logs"

# 2. ตรวจสอบและเคลียร์โปรเซสเก่าที่อาจค้างอยู่ในพอร์ต 3000
echo -e "\n${YELLOW}1. ตรวจสอบโปรเซสบนพอร์ต 3000...${NC}"
sudo pm2 delete rta-sinmai 2>/dev/null || true
pm2 delete rta-sinmai 2>/dev/null || true

# เคลียร์โปรเซสตกค้างบนพอร์ต 3000 (ถ้ามี)
if command -v fuser >/dev/null 2>&1; then
    sudo fuser -k 3000/tcp 2>/dev/null || true
fi

# 3. ตรวจสอบสิทธิ์การเข้าถึงไฟล์
ACTUAL_USER=$(whoami)
echo -e "\n${YELLOW}2. กำหนดสิทธิ์ให้ผู้ใช้ ${ACTUAL_USER}...${NC}"
sudo chown -R "$ACTUAL_USER":"$ACTUAL_USER" "$APP_DIR"

# 4. สั่งเริ่มระบบด้วย PM2 จาก ecosystem.config.js
echo -e "\n${YELLOW}3. สั่งเริ่มการทำงานของ rta-sinmai ด้วย PM2...${NC}"
pm2 start "$APP_DIR/ecosystem.config.js"

# 5. บันทึกรายการโปรเซสไว้สำหรับบูตเครื่องใหม่
echo -e "\n${YELLOW}4. บันทึกสถานะ PM2 (pm2 save)...${NC}"
pm2 save

# 6. ตั้งค่า PM2 Auto-start เมื่อเปิดเครื่อง
echo -e "\n${YELLOW}5. ตั้งค่า Auto-start เมื่อเปิดเครื่อง (systemd)...${NC}"
STARTUP_CMD=$(pm2 startup systemd -u "$ACTUAL_USER" --hp "$HOME" 2>&1 | grep "sudo env" || true)
if [ -n "$STARTUP_CMD" ]; then
    echo "กำลังรันคำสั่งลงทะเบียน Systemd..."
    eval "$STARTUP_CMD"
fi

echo -e "\n${GREEN}====================================================================${NC}"
echo -e "${GREEN}✓ ตั้งค่าและรัน PM2 สำเร็จเรียบร้อย!${NC}"
echo -e "${GREEN}====================================================================${NC}"
pm2 status rta-sinmai
