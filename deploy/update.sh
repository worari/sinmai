#!/bin/bash
# =============================================================================
# deploy/update.sh
# สคริปต์อัปเดตเวอร์ชันระบบและฐานข้อมูล PostgreSQL จาก GitHub (Production-Safe)
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo -e "${CYAN}==============================================${NC}"
echo -e "${YELLOW}🎖️  กำลังอัปเดตระบบสินไหม ทบ. จาก GitHub...${NC}"
echo -e "${CYAN}==============================================${NC}"

# โหลดค่าฐานข้อมูลจาก .env หากมีอยู่
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

# 1. สำรองข้อมูลเดิม (PostgreSQL + data-store.json) ก่อนอัปเดต
BACKUP_DIR="$APP_DIR/backups"
mkdir -p "$BACKUP_DIR"
STAMP="$(date '+%Y%m%d_%H%M%S')"
echo -e "\n${YELLOW}1. สำรองฐานข้อมูลและไฟล์ข้อมูลเดิมไว้ที่ $BACKUP_DIR ...${NC}"
if [ -f "$APP_DIR/data-store.json" ]; then
    cp "$APP_DIR/data-store.json" "$BACKUP_DIR/data-store_${STAMP}.json"
    echo -e "${GREEN}✓ สำรอง data-store.json เรียบร้อย${NC}"
fi
if command -v pg_dump >/dev/null 2>&1; then
    PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/db_${STAMP}.sql" 2>/dev/null \
      && echo -e "${GREEN}✓ สำรอง PostgreSQL (${DB_NAME}) เรียบร้อย${NC}" \
      || echo -e "${YELLOW}⚠️  ข้าม pg_dump ด้วยผู้ใช้ $DB_USER (อาจยังไม่มีตารางหรือติดสิทธิ์ owner)${NC}"
fi

# 2. ดึงโค้ดล่าสุดจาก GitHub แทนที่ไฟล์โปรแกรมเดิม (.env และ data-store.json ที่ ignore จะไม่ถูกลบ)
echo -e "\n${YELLOW}2. ดึงโค้ดเวอร์ชันล่าสุดจาก GitHub (origin/main)...${NC}"
git fetch origin main
git reset --hard origin/main

# 3. ติดตั้ง Dependencies ใหม่
echo -e "\n${YELLOW}3. ติดตั้ง Node Packages...${NC}"
npm install --legacy-peer-deps

# 4. อัปเกรดโครงสร้างตารางและตรวจสอบสิทธิ์ PostgreSQL
echo -e "\n${YELLOW}4. ซิงค์โครงสร้างตาราง PostgreSQL (14 ตาราง + Upgrade Columns)...${NC}"
if [ -f "$APP_DIR/deploy/postgres/schema.sql" ]; then
    if ! PGPASSWORD="$DB_PASS" psql -v ON_ERROR_STOP=1 -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$APP_DIR/deploy/postgres/schema.sql"; then
        echo -e "${RED}❌ อัปเกรด Schema PostgreSQL ไม่สำเร็จ (อาจเกิดจากตารางเดิมถูกสร้างด้วยสิทธิ์ postgres)${NC}"
        echo -e "${YELLOW}💡 หากติด permission denied ให้รันคำสั่งด้านล่างด้วยสิทธิ์ postgres (sudo -u postgres psql -d $DB_NAME):${NC}"
        echo "   DO \$\$ DECLARE r RECORD; BEGIN FOR r IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tableowner <> '$DB_USER' LOOP EXECUTE format('ALTER TABLE public.%I OWNER TO $DB_USER;', r.tablename); END LOOP; END \$\$;"
        exit 1
    fi
fi

# Seed เฉพาะกรณีฐานข้อมูลว่าง และยังไม่มี data-store.json (ถ้ามี data-store.json อยู่แล้ว server.js จะ Migrate อัตโนมัติตอนเปิดเว็บ)
USER_CNT=$(PGPASSWORD="$DB_PASS" psql -tAc "SELECT COUNT(*) FROM users" -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" 2>/dev/null || echo "0")
CLAIM_CNT=$(PGPASSWORD="$DB_PASS" psql -tAc "SELECT COUNT(*) FROM claims" -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" 2>/dev/null || echo "0")

if [ "${USER_CNT:-0}" = "0" ] && [ "${CLAIM_CNT:-0}" = "0" ] && [ ! -f "$APP_DIR/data-store.json" ] && [ -f "$APP_DIR/deploy/postgres/seed-data.sql" ]; then
    echo -e "${YELLOW}   ฐานข้อมูลว่าง: กำลังนำเข้าข้อมูลเริ่มต้น (Seed Data)...${NC}"
    PGPASSWORD="$DB_PASS" psql -v ON_ERROR_STOP=1 -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$APP_DIR/deploy/postgres/seed-data.sql"
else
    echo -e "${GREEN}✓ ข้าม seed-data.sql เพื่อรักษาข้อมูลจริงเดิม (users=${USER_CNT}, claims=${CLAIM_CNT})${NC}"
fi

# 5. Build Next.js Production
echo -e "\n${YELLOW}5. กำลัง Build Next.js Production...${NC}"
npm run build

# 6. Reload PM2 (Zero-downtime)
echo -e "\n${YELLOW}6. รีโหลดเซอร์วิส PM2 (rta-sinmai)...${NC}"
if pm2 describe rta-sinmai >/dev/null 2>&1; then
    pm2 reload rta-sinmai --update-env
else
    pm2 start "$APP_DIR/ecosystem.config.js"
    pm2 save
fi

echo -e "\n${GREEN}==============================================${NC}"
echo -e "${GREEN}🎉 อัปเดตระบบและฐานข้อมูล PostgreSQL เสร็จสมบูรณ์!${NC}"
echo -e "${GREEN}==============================================${NC}"
pm2 status rta-sinmai
