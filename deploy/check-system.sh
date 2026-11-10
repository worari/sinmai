#!/bin/bash
# ==============================================================================
# deploy/check-system.sh
# สคริปต์ตรวจสอบสถานะการทำงานของระบบทั้งหมดแบบครบวงจร (Health Check Dashboard)
# ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน กองทัพบก (RTA Claim Management System)
# ==============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo -e "${CYAN}====================================================================${NC}"
echo -e "${BOLD}${YELLOW}🎖️  ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน กองทัพบก (RTA Claim System)${NC}"
echo -e "${CYAN}📊  รายงานสถานะการทำงานของระบบ (Full System Health Check)${NC}"
echo -e "${CYAN}⏰  เวลาที่ตรวจสอบ: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${CYAN}====================================================================${NC}"

# โหลดค่าคอนฟิกจาก .env หากมี
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

# ------------------------------------------------------------------------------
# 1. ตรวจสอบ Node.js & NPM
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}[1/7] ตรวจสอบสภาพแวดล้อม Node.js & NPM${NC}"
if command -v node >/dev/null 2>&1; then
    NODE_VER=$(node -v)
    echo -e "  Node.js:  ${GREEN}✓ ติดตั้งแล้ว ($NODE_VER)${NC}"
else
    echo -e "  Node.js:  ${RED}✗ ไม่พบ Node.js${NC}"
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VER=$(npm -v)
    echo -e "  NPM:      ${GREEN}✓ ติดตั้งแล้ว (v$NPM_VER)${NC}"
else
    echo -e "  NPM:      ${RED}✗ ไม่พบ NPM${NC}"
fi

# ------------------------------------------------------------------------------
# 2. ตรวจสอบ PM2 Process Manager
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}[2/7] ตรวจสอบ Process Manager (PM2)${NC}"
if command -v pm2 >/dev/null 2>&1; then
    PM2_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"rta-sinmai"[^}]*"status":"[^"]*"' | sed -e 's/.*"status":"\([^"]*\)".*/\1/' || echo "unknown")
    if [ "$PM2_STATUS" = "online" ]; then
        echo -e "  สถานะแอป: ${GREEN}✓ ONLINE (กำลังทำงานตามปกติ)${NC}"
    elif [ -n "$PM2_STATUS" ] && [ "$PM2_STATUS" != "unknown" ]; then
        echo -e "  สถานะแอป: ${RED}⚠ $PM2_STATUS${NC}"
    else
        echo -e "  สถานะแอป: ${YELLOW}⚠ ไม่พบโปรเซส rta-sinmai ใน PM2${NC}"
    fi
    echo -e "  สรุปตารางสถานะ PM2:"
    pm2 status rta-sinmai 2>/dev/null || pm2 status
else
    echo -e "  ${RED}✗ ไม่พบคำสั่ง pm2 ในระบบ${NC}"
fi

# ------------------------------------------------------------------------------
# 3. ตรวจสอบฐานข้อมูล PostgreSQL
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}[3/7] ตรวจสอบฐานข้อมูล PostgreSQL${NC}"
if systemctl is-active --quiet postgresql; then
    echo -e "  บริการ PostgreSQL: ${GREEN}✓ ACTIVE (กำลังทำงาน)${NC}"
    
    # ทดสอบเชื่อมต่อฐานข้อมูลจริง
    if command -v psql >/dev/null 2>&1; then
        DB_CONN_TEST=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT 1;" 2>&1 | tr -d '[:space:]')
        if [ "$DB_CONN_TEST" = "1" ]; then
            echo -e "  การเชื่อมต่อ DB:    ${GREEN}✓ เชื่อมต่อสำเร็จ ($DB_USER@$DB_HOST:$DB_PORT/$DB_NAME)${NC}"
            
            # ดึงสถิติจำนวนข้อมูลในตารางสำคัญ
            USER_COUNT=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM users;" 2>/dev/null | tr -d '[:space:]')
            CLAIM_COUNT=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM claims;" 2>/dev/null | tr -d '[:space:]')
            UNIT_COUNT=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM military_units;" 2>/dev/null | tr -d '[:space:]')
            EXAM_COUNT=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM knowledge_questions;" 2>/dev/null | tr -d '[:space:]')
            
            echo -e "  ข้อมูลในตาราง:"
            echo -e "    - ผู้ใช้งาน (Users):           ${CYAN}${USER_COUNT:-0} ราย${NC}"
            echo -e "    - คำร้องขอรับสินไหม (Claims):  ${CYAN}${CLAIM_COUNT:-0} รายการ${NC}"
            echo -e "    - หน่วยทหาร (Military Units):   ${CYAN}${UNIT_COUNT:-0} หน่วย${NC}"
            echo -e "    - คลังข้อสอบ (Exam Questions):  ${CYAN}${EXAM_COUNT:-0} ข้อ${NC}"
        else
            echo -e "  การเชื่อมต่อ DB:    ${RED}✗ เชื่อมต่อล้มเหลว (ตรวจสอบรหัสผ่านใน .env)${NC}"
            echo -e "  Error: $DB_CONN_TEST"
        fi
    fi
else
    echo -e "  บริการ PostgreSQL: ${RED}✗ INACTIVE (ไม่ได้ทำงาน) -> สั่งเปิดด้วย: sudo systemctl start postgresql${NC}"
fi

# ------------------------------------------------------------------------------
# 4. ตรวจสอบ Nginx Reverse Proxy
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}[4/7] ตรวจสอบเว็บเซิร์ฟเวอร์ Nginx${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "  บริการ Nginx:      ${GREEN}✓ ACTIVE (กำลังทำงาน)${NC}"
    
    # ทดสอบความถูกต้องของ Configuration
    NGINX_TEST=$(sudo nginx -t 2>&1)
    if echo "$NGINX_TEST" | grep -q "syntax is ok"; then
        echo -e "  Nginx Config:      ${GREEN}✓ Syntax ถูกต้อง (OK)${NC}"
    else
        echo -e "  Nginx Config:      ${RED}⚠ พบข้อผิดพลาดใน config${NC}"
        echo "$NGINX_TEST"
    fi
    
    # ตรวจสอบไฟล์ไซต์ที่เปิดใช้งาน
    if [ -f "/etc/nginx/sites-enabled/sinmai" ]; then
        echo -e "  Site Configuration: ${GREEN}✓ พบ /etc/nginx/sites-enabled/sinmai${NC}"
    else
        echo -e "  Site Configuration: ${YELLOW}⚠ ยังไม่ได้เปิดใช้งาน sinmai ใน sites-enabled${NC}"
    fi
else
    echo -e "  บริการ Nginx:      ${RED}✗ INACTIVE (ไม่ได้ทำงาน) -> สั่งเปิดด้วย: sudo systemctl start nginx${NC}"
fi

# ------------------------------------------------------------------------------
# 5. ตรวจสอบสถานะการเปิดรับการเชื่อมต่อ (Port Listening)
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}[5/7] ตรวจสอบพอร์ตเครือข่าย (Network Ports)${NC}"
check_port() {
    local port=$1
    local name=$2
    if ss -tulpn 2>/dev/null | grep -q ":$port "; then
        echo -e "  Port $port ($name):  ${GREEN}✓ เปิดรับการเชื่อมต่อ (LISTENING)${NC}"
    elif netstat -tulpn 2>/dev/null | grep -q ":$port "; then
        echo -e "  Port $port ($name):  ${GREEN}✓ เปิดรับการเชื่อมต่อ (LISTENING)${NC}"
    else
        echo -e "  Port $port ($name):  ${RED}✗ ไม่ได้เปิดรับการเชื่อมต่อ${NC}"
    fi
}

check_port 3000 "Node.js / Next.js Web App"
check_port 80   "Nginx HTTP"
check_port 443  "Nginx HTTPS"
check_port 5432 "PostgreSQL Database"

# ------------------------------------------------------------------------------
# 6. ทดสอบการตอบสนองผ่าน HTTP & HTTPS (Local Probing)
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}[6/7] ทดสอบการตอบสนองของระบบ (HTTP Response Probing)${NC}"

# ทดสอบเข้า Next.js ตรงที่พอร์ต 3000
HTTP_3000=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || echo "000")
if [ "$HTTP_3000" = "200" ] || [ "$HTTP_3000" = "307" ] || [ "$HTTP_3000" = "308" ]; then
    echo -e "  Direct Node.js (http://127.0.0.1:3000):  ${GREEN}✓ ตอบสนอง HTTP $HTTP_3000${NC}"
else
    echo -e "  Direct Node.js (http://127.0.0.1:3000):  ${RED}✗ รหัสตอบสนอง HTTP $HTTP_3000${NC}"
fi

# ทดสอบผ่าน Nginx Reverse Proxy พอร์ต 80
HTTP_80=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/ || echo "000")
if [ "$HTTP_80" = "200" ] || [ "$HTTP_80" = "301" ] || [ "$HTTP_80" = "302" ]; then
    echo -e "  Nginx Proxy HTTP (http://127.0.0.1):       ${GREEN}✓ ตอบสนอง HTTP $HTTP_80${NC}"
else
    echo -e "  Nginx Proxy HTTP (http://127.0.0.1):       ${YELLOW}⚠ รหัสตอบสนอง HTTP $HTTP_80${NC}"
fi

# ทดสอบผ่าน Nginx Reverse Proxy พอร์ต 443 (HTTPS)
HTTPS_443=$(curl -s -k -o /dev/null -w "%{http_code}" https://127.0.0.1/ || echo "000")
if [ "$HTTPS_443" = "200" ] || [ "$HTTPS_443" = "307" ] || [ "$HTTPS_443" = "308" ]; then
    echo -e "  Nginx Proxy HTTPS (https://127.0.0.1):     ${GREEN}✓ ตอบสนอง HTTPS $HTTPS_443 (SSL ใช้งานได้)${NC}"
else
    echo -e "  Nginx Proxy HTTPS (https://127.0.0.1):     ${YELLOW}⚠ รหัสตอบสนอง HTTPS $HTTPS_443 (ยังไม่ได้เปิดใช้งาน SSL หรือกำลังรอใบรับรอง)${NC}"
fi

# ------------------------------------------------------------------------------
# 7. ตรวจสอบทรัพยากรเครื่องแม่ข่าย (System Resources & Firewall)
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}[7/7] ทรัพยากรเครื่องแม่ข่าย (System Resources & Firewall)${NC}"
# แรม
RAM_INFO=$(free -h | awk '/^Mem:/ {print "ใช้งาน: "$3" / ทั้งหมด: "$2}')
echo -e "  หน่วยความจำ (RAM):  ${CYAN}$RAM_INFO${NC}"

# พื้นที่ดิสก์
DISK_INFO=$(df -h / | awk 'NR==2 {print "ใช้งาน: "$3" / ทั้งหมด: "$2" (เหลือ "$4" - "$5")"}')
echo -e "  พื้นที่ดิสก์ (Disk):   ${CYAN}$DISK_INFO${NC}"

# Firewall UFW
if command -v ufw >/dev/null 2>&1; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | grep -i "Status:" || echo "Status: inactive")
    echo -e "  Firewall (UFW):     ${CYAN}$UFW_STATUS${NC}"
fi

# ตรวจสอบบันทึก Error ล่าสุดของ PM2
echo -e "\n${BOLD}${BLUE}📝 บันทึกข้อผิดพลาดล่าสุด (PM2 Error Log - 5 บรรทัดล่าสุด):${NC}"
if [ -f "$APP_DIR/logs/pm2-error.log" ] && [ -s "$APP_DIR/logs/pm2-error.log" ]; then
    tail -n 5 "$APP_DIR/logs/pm2-error.log"
else
    echo -e "  ${GREEN}✓ ไม่พบ Error ล่าสุดใน pm2-error.log (ระบบทำงานราบรื่น)${NC}"
fi

echo -e "\n${CYAN}====================================================================${NC}"
echo -e "${GREEN}🎯 สิ้นสุดการตรวจสอบสถานะระบบ${NC}"
echo -e "${CYAN}====================================================================${NC}"
