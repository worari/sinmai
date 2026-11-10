#!/bin/bash
# ==============================================================================
# deploy/nginx/setup-ssl.sh
# สคริปต์เปิดใช้งาน HTTPS / SSL Reverse Proxy สำหรับโดเมน sinmai.rta.mi.th
# ==============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ กรุณารันด้วยสิทธิ์ root เช่น: sudo bash deploy/nginx/setup-ssl.sh${NC}"
    exit 1
fi

DOMAIN="sinmai.rta.mi.th"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${CYAN}====================================================================${NC}"
echo -e "${YELLOW}🔒 ตั้งค่าระบบความปลอดภัย HTTPS (SSL) สำหรับ: https://${DOMAIN}${NC}"
echo -e "${CYAN}====================================================================${NC}"
echo "กรุณาเลือกวิธีการติดตั้ง SSL Certificate:"
echo "  [1] ติดตั้งฟรีผ่าน Let's Encrypt (Certbot) อัตโนมัติ (แนะนำสำหรับโดเมนที่ชี้ IP มาแล้ว)"
echo "  [2] สร้าง Self-Signed Certificate ชั่วคราว (เปิดทดสอบ HTTPS ได้ทันที)"
echo "  [3] นำเข้าใบรับรอง Custom Certificate ของ ทบ. (.crt / .key)"
echo ""
read -p "เลือกวิธี (1-3) [ค่าเริ่มต้น 1]: " SSL_CHOICE
SSL_CHOICE="${SSL_CHOICE:-1}"

# ตรวจสอบและเปิด Port 443 ใน Firewall
echo -e "\n${YELLOW}🛡️ ตรวจสอบ Firewall พอร์ต 443 (HTTPS)...${NC}"
ufw allow 443/tcp comment 'HTTPS' 2>/dev/null || true
ufw allow 80/tcp comment 'HTTP' 2>/dev/null || true

case "$SSL_CHOICE" in
    1)
        echo -e "\n${YELLOW}1. กำลังตรวจสอบและติดตั้ง Certbot...${NC}"
        # เพิ่ม repository universe (สำหรับ Ubuntu)
        command -v add-apt-repository >/dev/null 2>&1 && add-apt-repository universe -y || true
        apt-get update -y
        apt-get install -y certbot python3-certbot-nginx || true

        # หาก apt ติดตั้งไม่สำเร็จหรือหาแพ็กเกจไม่เจอ ให้ติดตั้งผ่าน snap
        if ! command -v certbot >/dev/null 2>&1; then
            echo -e "${YELLOW}กำลังติดตั้ง Certbot ผ่าน Snap...${NC}"
            apt-get install -y snapd
            systemctl enable --now snapd.socket 2>/dev/null || true
            snap install core && snap refresh core
            snap install --classic certbot
            ln -sf /snap/bin/certbot /usr/bin/certbot
        fi

        echo -e "${GREEN}✓ Certbot เวอร์ชั่น: $(certbot --version 2>/dev/null || echo 'พร้อมใช้งาน')${NC}"

        echo -e "\n${YELLOW}2. ตรวจสอบการคอนฟิก Nginx พื้นฐาน...${NC}"
        cp "$SCRIPT_DIR/sinmai.conf" /etc/nginx/sites-available/sinmai
        ln -sf /etc/nginx/sites-available/sinmai /etc/nginx/sites-enabled/sinmai
        nginx -t
        systemctl reload nginx

        echo -e "\n${YELLOW}3. ขอใบรับรอง SSL Certificate จาก Let's Encrypt...${NC}"
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect

        echo -e "\n${GREEN}✓ ติดตั้ง Let's Encrypt SSL สำเร็จเรียบร้อย!${NC}"
        ;;

    2)
        echo -e "\n${YELLOW}1. กำลังสร้าง Self-Signed Certificate สำหรับ $DOMAIN (อายุ 365 วัน)...${NC}"
        mkdir -p /etc/ssl/certs /etc/ssl/private
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /etc/ssl/private/sinmai.rta.mi.th.key \
            -out /etc/ssl/certs/sinmai.rta.mi.th.crt \
            -subj "/C=TH/ST=Bangkok/L=Phra Nakhon/O=Royal Thai Army/OU=Personnel Department/CN=${DOMAIN}"

        chmod 600 /etc/ssl/private/sinmai.rta.mi.th.key
        chmod 644 /etc/ssl/certs/sinmai.rta.mi.th.crt

        echo -e "\n${YELLOW}2. กำหนดค่า Nginx ให้ใช้ Self-Signed Certificate...${NC}"
        sed -e 's|/etc/letsencrypt/live/sinmai.rta.mi.th/fullchain.pem|/etc/ssl/certs/sinmai.rta.mi.th.crt|g' \
            -e 's|/etc/letsencrypt/live/sinmai.rta.mi.th/privkey.pem|/etc/ssl/private/sinmai.rta.mi.th.key|g' \
            "$SCRIPT_DIR/sinmai-ssl.conf" > /etc/nginx/sites-available/sinmai

        ln -sf /etc/nginx/sites-available/sinmai /etc/nginx/sites-enabled/sinmai
        nginx -t
        systemctl reload nginx

        echo -e "\n${GREEN}✓ ติดตั้ง Self-Signed Certificate สำเร็จเรียบร้อย!${NC}"
        ;;

    3)
        echo -e "\n${YELLOW}กรุณาระบุที่อยู่ไฟล์ใบรับรองของ ทบ.:${NC}"
        read -p "ระบุ Full Path ของไฟล์ .crt หรือ .pem: " CERT_PATH
        read -p "ระบุ Full Path ของไฟล์ .key: " KEY_PATH

        if [ ! -f "$CERT_PATH" ] || [ ! -f "$KEY_PATH" ]; then
            echo -e "${RED}❌ ไม่พบไฟล์ใบรับรองที่ระบุ กรุณาตรวจสอบ path อีกครั้ง${NC}"
            exit 1
        fi

        mkdir -p /etc/ssl/certs /etc/ssl/private
        cp "$CERT_PATH" /etc/ssl/certs/sinmai.rta.mi.th.crt
        cp "$KEY_PATH" /etc/ssl/private/sinmai.rta.mi.th.key
        chmod 600 /etc/ssl/private/sinmai.rta.mi.th.key
        chmod 644 /etc/ssl/certs/sinmai.rta.mi.th.crt

        sed -e 's|/etc/letsencrypt/live/sinmai.rta.mi.th/fullchain.pem|/etc/ssl/certs/sinmai.rta.mi.th.crt|g' \
            -e 's|/etc/letsencrypt/live/sinmai.rta.mi.th/privkey.pem|/etc/ssl/private/sinmai.rta.mi.th.key|g' \
            "$SCRIPT_DIR/sinmai-ssl.conf" > /etc/nginx/sites-available/sinmai

        ln -sf /etc/nginx/sites-available/sinmai /etc/nginx/sites-enabled/sinmai
        nginx -t
        systemctl reload nginx

        echo -e "\n${GREEN}✓ ติดตั้ง Custom Certificate สำเร็จเรียบร้อย!${NC}"
        ;;

    *)
        echo -e "${RED}❌ ตัวเลือกไม่ถูกต้อง กรุณารันคำสั่งใหม่อีกครั้ง${NC}"
        exit 1
        ;;
esac

echo -e "\n${CYAN}====================================================================${NC}"
echo -e "${GREEN}🎉 ตั้งค่า HTTPS Nginx Reverse Proxy เรียบร้อยแล้ว!${NC}"
echo -e "   👉 เข้าใช้งานระบบได้ที่: ${YELLOW}https://${DOMAIN}/${NC}"
echo -e "${CYAN}====================================================================${NC}"

