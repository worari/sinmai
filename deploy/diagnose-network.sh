#!/bin/bash
# ==============================================================================
# deploy/diagnose-network.sh
# สคริปต์วิเคราะห์เครือข่ายและการเข้าถึงจากภายนอก (External Access Diagnostic)
# ==============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}====================================================================${NC}"
echo -e "${BOLD}${YELLOW}🔍 ตรวจสอบการตั้งค่า Nginx และเส้นทางเครือข่ายภายนอก (External Access)${NC}"
echo -e "${CYAN}====================================================================${NC}"

# 1. ตรวจสอบการผูกพอร์ตของ Nginx (Listening Interface)
echo -e "\n${BOLD}[1/4] ตรวจสอบ Nginx ว่ารับคำขอจากทุก IP หรือไม่:${NC}"
NGINX_BIND=$(ss -tulpn | grep nginx || true)
echo "$NGINX_BIND"
if echo "$NGINX_BIND" | grep -q "0.0.0.0:443" || echo "$NGINX_BIND" | grep -q "\*:443"; then
    echo -e "  พอร์ต 443 (HTTPS): ${GREEN}✓ ผูกกับ 0.0.0.0 (รับทุกการเชื่อมต่อทั้งภายในและภายนอก)${NC}"
else
    echo -e "  พอร์ต 443 (HTTPS): ${RED}✗ ไม่ได้ผูกกับ 0.0.0.0${NC}"
fi

if echo "$NGINX_BIND" | grep -q "0.0.0.0:80" || echo "$NGINX_BIND" | grep -q "\*:80"; then
    echo -e "  พอร์ต 80 (HTTP):   ${GREEN}✓ ผูกกับ 0.0.0.0 (รับทุกการเชื่อมต่อทั้งภายในและภายนอก)${NC}"
fi

# 2. ตรวจสอบ Firewall (UFW / iptables) บนเครื่อง Linux
echo -e "\n${BOLD}[2/4] ตรวจสอบ Firewall บนเครื่อง Linux:${NC}"
if command -v ufw >/dev/null 2>&1; then
    sudo ufw status verbose | grep -E '80|443|Status' || sudo ufw status
fi

# 3. ตรวจสอบ Default Gateway (การส่งข้อมูลกลับออกสู่ภายนอก)
echo -e "\n${BOLD}[3/4] ตรวจสอบ Default Gateway และเส้นทางออกสู่อินเทอร์เน็ต:${NC}"
GATEWAY=$(ip route | grep default || echo "None")
echo -e "  Default Route: ${CYAN}$GATEWAY${NC}"
if ping -c 2 8.8.8.8 >/dev/null 2>&1; then
    echo -e "  การออกสู่อินเทอร์เน็ต: ${GREEN}✓ เชื่อมต่ออินเทอร์เน็ตภายนอกได้ปกติ${NC}"
else
    echo -e "  การออกสู่อินเทอร์เน็ต: ${YELLOW}⚠ ไม่สามารถ ping 8.8.8.8 ได้ (อาจถูกบล็อก ICMP)${NC}"
fi

# 4. ทดสอบดักจับแพ็กเกจจริง (Live Packet Capture บนพอร์ต 443)
echo -e "\n${BOLD}[4/4] 🛰️ ทดสอบดักจับแพ็กเกจที่วิ่งเข้ามาที่พอร์ต 443 (เป็นเวลา 15 วินาที)...${NC}"
echo -e "${YELLOW}👉 ในระหว่างนี้ กรุณาลองใช้โทรศัพท์มือถือ (ปิด Wi-Fi ใช้ 4G/5G) เปิดเว็บ https://sinmai.rta.mi.th/${NC}"
echo -e "กำลังเริ่มดักฟัง..."

if command -v tcpdump >/dev/null 2>&1; then
    CAPTURED=$(sudo timeout 15 tcpdump -n -i any "tcp port 443" -c 10 2>&1 || true)
    if echo "$CAPTURED" | grep -q "IP "; then
        echo -e "${GREEN}✓ ตรวจพบแพ็กเกจวิ่งเข้ามาถึงตัวเครื่องเซิร์ฟเวอร์:${NC}"
        echo "$CAPTURED" | grep "IP " | head -n 5
        echo -e "${GREEN}👉 สรุป: แพ็กเกจวิ่งมาถึงเครื่องเซิร์ฟเวอร์แล้ว${NC}"
    else
        echo -e "${RED}✗ ไม่พบแพ็กเกจใดๆ วิ่งเข้ามาถึงเครื่องเซิร์ฟเวอร์เลย (0 packets captured)${NC}"
        echo -e "${YELLOW}👉 สรุปฟันธง: Firewall / Router ส่วนกลางของ ทบ. ยังไม่ได้เปิด Forward Port 443 จาก Public IP (103.146.204.84) มายังเครื่องนี้ (10.200.2.168)${NC}"
    fi
else
    echo -e "${YELLOW}ไม่ได้ติดตั้ง tcpdump (ข้ามการทดสอบส่วนนี้)${NC}"
fi

echo -e "\n${CYAN}====================================================================${NC}"
echo -e "${GREEN}🎯 สิ้นสุดการวินิจฉัยเครือข่าย${NC}"
echo -e "${CYAN}====================================================================${NC}"

