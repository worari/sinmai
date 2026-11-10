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

# 1. ดึงโค้ดล่าสุดจาก GitHub แทนที่ข้อมูลเดิม
echo -e "\n${YELLOW}1. ดึงโค้ดเวอร์ชันล่าสุดจาก GitHub (แทนที่ข้อมูลเดิม)...${NC}"
git fetch origin main
git reset --hard origin/main

# 2. ติดตั้ง Dependencies ใหม่ (หากมีการเปลี่ยนแปลง)
echo -e "\n${YELLOW}2. ติดตั้ง Node Packages...${NC}"
npm install --legacy-peer-deps

# 3. อัปเดตโครงสร้างและข้อมูลเริ่มต้นฐานข้อมูล
echo -e "\n${YELLOW}3. ซิงค์โครงสร้างและข้อมูลฐานข้อมูล PostgreSQL...${NC}"

# โหลดการตั้งค่าฐานข้อมูลจาก .env หากมีอยู่
DB_NAME="rta_sinmai"
DB_USER="rta_admin"
DB_PASS="RtaSinmai@2026!"
DB_HOST="localhost"
DB_PORT="5432"

if [ -f "$APP_DIR/.env" ]; then
    while IFS='=' read -r key val || [ -n "$key" ]; do
        [[ "$key" =~ ^[[:space:]]*# ]] && continue
        [[ -z "${key// }" ]] && continue
        key=$(echo "$key" | tr -d '[:space:]')
        val=$(echo "$val" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^["'\'']//' -e 's/["'\'']$//')
        case "$key" in
            DB_NAME) DB_NAME="$val" ;;
            DB_USER) DB_USER="$val" ;;
            DB_PASSWORD|DB_PASS) DB_PASS="$val" ;;
            DB_HOST) DB_HOST="$val" ;;
            DB_PORT) DB_PORT="$val" ;;
        esac
    done < "$APP_DIR/.env"
fi

if [ -f "$APP_DIR/deploy/postgres/schema.sql" ]; then
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$APP_DIR/deploy/postgres/schema.sql" 2>/dev/null || true
fi
if [ -f "$APP_DIR/deploy/postgres/seed-data.sql" ]; then
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$APP_DIR/deploy/postgres/seed-data.sql" 2>/dev/null || true
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

