#!/bin/bash
# =============================================================================
# deploy/update.sh
# สคริปต์อัปเดตเวอร์ชันระบบอัตโนมัติ (Zero-downtime Reload)
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo -e "${CYAN}==============================================${NC}"
echo -e "${YELLOW}🎖️  กำลังอัปเดตระบบสินไหม ทบ. จาก GitHub...${NC}"
echo -e "${CYAN}==============================================${NC}"

# 1. ดึงโค้ดล่าสุดจาก GitHub
echo -e "\n${YELLOW}1. ดึงโค้ดเวอร์ชันล่าสุด...${NC}"
git pull origin main

# 2. ติดตั้ง Dependencies ใหม่ (หากมีการเปลี่ยนแปลง)
echo -e "\n${YELLOW}2. ติดตั้ง Node Packages...${NC}"
npm install --legacy-peer-deps

# 3. อัปเดตโครงสร้างฐานข้อมูล (ถ้ามี)
if [ -f "$APP_DIR/deploy/postgres/schema.sql" ]; then
    echo -e "\n${YELLOW}3. ซิงค์โครงสร้างฐานข้อมูล...${NC}"
    PGPASSWORD="RtaSinmai@2026!" psql -h localhost -U rta_admin -d rta_sinmai -f "$APP_DIR/deploy/postgres/schema.sql" 2>/dev/null || true
fi

# 4. Build Next.js
echo -e "\n${YELLOW}4. กำลัง Build Next.js Production...${NC}"
npm run build

# 5. Reload PM2 (Zero-downtime)
echo -e "\n${YELLOW}5. สั่ง PM2 Reload เซอร์วิส...${NC}"
pm2 reload rta-sinmai --update-env

echo -e "\n${GREEN}==============================================${NC}"
echo -e "${GREEN}🎉 อัปเดตระบบเสร็จสมบูรณ์เรียบร้อย!${NC}"
echo -e "${GREEN}==============================================${NC}"
pm2 status rta-sinmai
