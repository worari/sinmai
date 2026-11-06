#!/bin/bash
# =============================================================================
# deploy/install.sh
# สคริปต์ติดตั้งระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน ทบ. อัตโนมัติบน Linux (Ubuntu/Debian)
# รวม: Node.js 20 LTS, PostgreSQL, PM2, Nginx Reverse Proxy, UFW Firewall
# =============================================================================

set -e

# สีสำหรับการแสดงผล
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================================${NC}"
echo -e "${YELLOW}🎖️  ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน กองทัพบก (RTA Claim System)${NC}"
echo -e "${CYAN}🚀  เริ่มต้นการติดตั้งบนเซิร์ฟเวอร์ Linux อัตโนมัติ...${NC}"
echo -e "${CYAN}====================================================================${NC}"

# 1. ตรวจสอบสิทธิ์ Root / Sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ กรุณารันสคริปต์นี้ด้วยสิทธิ์ root หรือ sudo เช่น: sudo bash deploy/install.sh${NC}"
    exit 1
fi

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo -e "\n${BLUE}📂 ตำแหน่งไดเรกทอรีโปรเจกต์: $APP_DIR${NC}"

# 2. อัปเดตแพ็กเกจระบบพื้นฐาน
echo -e "\n${YELLOW}1/7. กำลังอัปเดตระบบปฏิบัติการและติดตั้งเครื่องมือจำเป็น...${NC}"
apt-get update -y
apt-get install -y curl wget git build-essential ufw software-properties-common

# 3. ติดตั้ง Node.js 20 LTS (หากยังไม่ได้ติดตั้ง)
echo -e "\n${YELLOW}2/7. ตรวจสอบและติดตั้ง Node.js 20 LTS...${NC}"
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 18 ]; then
    echo "กำลังติดตั้ง Node.js 20.x จาก NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo -e "${GREEN}✓ Node.js เวอร์ชั่น: $(node -v)${NC}"
echo -e "${GREEN}✓ NPM เวอร์ชั่น: $(npm -v)${NC}"

# 4. ติดตั้ง PM2 Process Manager
echo -e "\n${YELLOW}3/7. ติดตั้ง PM2 Process Manager...${NC}"
if ! command -v pm2 >/dev/null 2>&1; then
    npm install -g pm2
fi
echo -e "${GREEN}✓ PM2 เวอร์ชั่น: $(pm2 -v)${NC}"

# 5. ติดตั้งและตั้งค่า PostgreSQL
echo -e "\n${YELLOW}4/7. ติดตั้งและตั้งค่าฐานข้อมูล PostgreSQL...${NC}"
apt-get install -y postgresql postgresql-contrib

# เริ่มรัน PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# รันสคริปต์สร้างฐานข้อมูลและโครงสร้างตาราง
bash "$APP_DIR/deploy/postgres/init-db.sh"
echo -e "${GREEN}✓ ฐานข้อมูล PostgreSQL พร้อมใช้งาน${NC}"

# 6. ติดตั้ง NPM Dependencies และ Build Next.js
echo -e "\n${YELLOW}5/7. ติดตั้ง Dependencies และทำการ Build ระบบ...${NC}"
mkdir -p logs
npm install --legacy-peer-deps

echo "กำลังสร้าง Production Build (Next.js)..."
npm run build
echo -e "${GREEN}✓ สร้าง Production Build สำเร็จ${NC}"

# ปรับปรุงสิทธิ์การเข้าถึงไฟล์ให้ผู้ใช้ที่แท้จริง (เช่น adminrta)
ACTUAL_USER="${SUDO_USER:-root}"
ACTUAL_HOME=$(eval echo "~$ACTUAL_USER")

if [ "$ACTUAL_USER" != "root" ]; then
    echo "กำหนดสิทธิ์โฟลเดอร์ให้ผู้ใช้: $ACTUAL_USER"
    chown -R "$ACTUAL_USER":"$ACTUAL_USER" "$APP_DIR"
    chmod 755 "$ACTUAL_HOME" 2>/dev/null || true
fi

# 7. ตั้งค่า PM2 ให้รันระบบอัตโนมัติ
echo -e "\n${YELLOW}6/7. เริ่มต้นเซอร์วิสด้วย PM2 และตั้งค่า Auto-Start เมื่อเปิดเครื่อง...${NC}"
if [ "$ACTUAL_USER" != "root" ]; then
    sudo -u "$ACTUAL_USER" pm2 delete rta-sinmai 2>/dev/null || true
    sudo -u "$ACTUAL_USER" pm2 start "$APP_DIR/ecosystem.config.js"
    sudo -u "$ACTUAL_USER" pm2 save
    env PATH=$PATH:/usr/bin pm2 startup systemd -u "$ACTUAL_USER" --hp "$ACTUAL_HOME" || true
else
    pm2 delete rta-sinmai 2>/dev/null || true
    pm2 start "$APP_DIR/ecosystem.config.js"
    pm2 save
    pm2 startup systemd -u root --hp /root || true
fi
echo -e "${GREEN}✓ PM2 จัดการ Process เรียบร้อย (ผู้ใช้: $ACTUAL_USER)${NC}"

# 8. ติดตั้งและตั้งค่า Nginx Reverse Proxy
echo -e "\n${YELLOW}7/7. ติดตั้งและตั้งค่า Nginx Reverse Proxy...${NC}"
apt-get install -y nginx

# ลบ default site เก่า
rm -f /etc/nginx/sites-enabled/default

# คัดลอกคอนฟิก Nginx ของระบบ
cp "$APP_DIR/deploy/nginx/sinmai.conf" /etc/nginx/sites-available/sinmai
ln -sf /etc/nginx/sites-available/sinmai /etc/nginx/sites-enabled/sinmai

# ทดสอบไวยากรณ์ Nginx และ Reload
nginx -t
systemctl restart nginx
systemctl enable nginx
echo -e "${GREEN}✓ Nginx Reverse Proxy ทำงานเรียบร้อย (Port 80 -> 127.0.0.1:3000)${NC}"

# 9. ตั้งค่า Firewall (UFW)
echo -e "\n${YELLOW}🛡️ กำหนดค่า Firewall (UFW)...${NC}"
# สำคัญมาก: อนุญาตพอร์ต SSH พิเศษ 4224 และ 22 เพื่อไม่ให้การเชื่อมต่อหลุด
ufw allow 4224/tcp comment 'SSH Custom Port 4224'
ufw allow 22/tcp comment 'SSH Port 22'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable || true
echo -e "${GREEN}✓ อนุญาตพอร์ต SSH (4224, 22), HTTP (80), HTTPS (443)${NC}"

SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "\n${CYAN}====================================================================${NC}"
echo -e "${GREEN}🎉 ติดตั้งระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน ทบ. บน Linux สำเร็จเรียบร้อย!${NC}"
echo -e "${CYAN}====================================================================${NC}"
echo -e "🌐 สามารถเข้าใช้งานระบบผ่านเว็บเบราว์เซอร์ได้ที่:"
echo -e "   👉 โดเมนหลัก:  ${YELLOW}http://sinmai.rta.mi.th${NC}"
echo -e "   👉 Public IP:  ${YELLOW}http://103.146.204.84${NC}"
echo -e "   👉 Private IP: ${YELLOW}http://10.200.2.168${NC} (IP เครื่อง: ${SERVER_IP})"
echo -e ""
echo -e "👤 บัญชีผู้ดูแลระบบเริ่มต้น (Super Admin):"
echo -e "   - อีเมล: ${GREEN}admin@army.mil.th${NC} (หรือเลข ปชช: 1100500001122)"
echo -e "   - รหัสผ่าน: ${GREEN}password123${NC}"
echo -e ""
echo -e "📊 คำสั่งตรวจสอบการทำงานของระบบ:"
echo -e "   - ดูสถานะ PM2:     ${CYAN}pm2 status${NC}"
echo -e "   - ดูบันทึก Log:     ${CYAN}pm2 logs rta-sinmai${NC}"
echo -e "   - รีสตาร์ทระบบ:    ${CYAN}pm2 restart rta-sinmai${NC}"
echo -e "   - ดูสถานะ Nginx:   ${CYAN}sudo systemctl status nginx${NC}"
echo -e "   - ดูสถานะ DB:      ${CYAN}sudo systemctl status postgresql${NC}"
echo -e ""
echo -e "🔒 การเปิดใช้งาน HTTPS (SSL Certificate จาก Let's Encrypt สำหรับ sinmai.rta.mi.th):"
echo -e "   1. ตรวจสอบว่าโดเมน sinmai.rta.mi.th ชี้มาที่ IP 103.146.204.84 แล้ว"
echo -e "   2. รันคำสั่ง: ${CYAN}sudo apt install -y certbot python3-certbot-nginx${NC}"
echo -e "   3. รันคำสั่ง: ${CYAN}sudo certbot --nginx -d sinmai.rta.mi.th${NC}"
echo -e "${CYAN}====================================================================${NC}"
echo -e "   1. ชี้โดเมนมายัง IP นี้: ${SERVER_IP}"
echo -e "   2. รันคำสั่ง: ${CYAN}sudo apt install -y certbot python3-certbot-nginx${NC}"
echo -e "   3. รันคำสั่ง: ${CYAN}sudo certbot --nginx -d โดเมนของท่าน.army.mil.th${NC}"
echo -e "${CYAN}====================================================================${NC}"

