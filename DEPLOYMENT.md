# 🎖️ คู่มือการติดตั้งระบบบน Linux Server (Production Deployment Guide)
### ระบบเสนอขอรับสิทธิเงินค่าสินไหมทดแทน กองทัพบก (RTA Claim Management System)

คู่มือนี้แนะนำขั้นตอนการนำระบบขึ้นเซิร์ฟเวอร์ Linux จริง (รองรับ **Ubuntu 20.04 / 22.04 / 24.04 LTS** หรือ **Debian 11 / 12**) พร้อมการติดตั้งและตั้งค่า:
1. **Node.js 20 LTS** & Next.js Runtime
2. **PostgreSQL** ฐานข้อมูลหลัก
3. **PM2** สำหรับการบริหารจัดการ Process และเปิดทำงานอัตโนมัติเมื่อรีสตาร์ทเครื่อง (Auto-restart on reboot)
4. **Nginx Reverse Proxy** สำหรับรับคำขอที่ Port 80/443 และส่งต่อไปยัง Next.js/Socket.io
5. **SSL (HTTPS)** ด้วย Let's Encrypt Certbot ฟรี

---

## 🚀 วิธีที่ 1: ติดตั้งอัตโนมัติด้วยคำสั่งเดียว (Recommended - Fast 1-Click)

หากท่านเพิ่งได้เซิร์ฟเวอร์ Linux เครื่องใหม่ ให้ล็อกอินผ่าน SSH ในฐานะ `root` แล้วรันคำสั่งต่อไปนี้:

```bash
# 1. เข้าสู่โฟลเดอร์ /var/www
sudo mkdir -p /var/www && cd /var/www

# 2. Clone โปรเจกต์จาก GitHub
git clone https://github.com/worari/sinmai.git rta-sinmai
cd rta-sinmai

# 3. ให้สิทธิ์ execute และรันสคริปต์ติดตั้งอัตโนมัติ
chmod +x deploy/install.sh deploy/update.sh deploy/postgres/init-db.sh
sudo bash deploy/install.sh
```

สคริปต์จะทำการติดตั้ง Node.js 20, PostgreSQL, PM2, Nginx, UFW Firewall, สร้างฐานข้อมูล และสั่ง Build + Run ให้เสร็จสิ้นโดยอัตโนมัติ เมื่อเสร็จแล้วสามารถเปิดดูผ่านเบราว์เซอร์ได้ทันที!

---

## 🛠️ วิธีที่ 2: ขั้นตอนการติดตั้งแบบทีละขั้นตอน (Step-by-Step Manual Installation)

### ขั้นตอนที่ 1: อัปเดตระบบและติดตั้งแพ็กเกจพื้นฐาน
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ufw software-properties-common
```

---

### ขั้นตอนที่ 2: ติดตั้ง Node.js 20 LTS และ PM2
```bash
# ติดตั้ง Node.js 20.x จาก NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# ตรวจสอบเวอร์ชัน
node -v   # ควรเป็น v20.x.x
npm -v

# ติดตั้ง PM2 Process Manager แบบ Global
sudo npm install -g pm2
```

---

### ขั้นตอนที่ 3: ติดตั้งและตั้งค่า PostgreSQL
```bash
# ติดตั้ง PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# เริ่มต้นและตั้งค่าให้รันอัตโนมัติ
sudo systemctl start postgresql
sudo systemctl enable postgresql

# สร้าง User และ Database
sudo -u postgres psql <<EOF
CREATE ROLE rta_admin WITH LOGIN PASSWORD 'RtaSinmai@2026!' CREATEDB;
CREATE DATABASE rta_sinmai OWNER rta_admin;
GRANT ALL PRIVILEGES ON DATABASE rta_sinmai TO rta_admin;
EOF
```

#### นำเข้าโครงสร้างตารางและข้อมูลเริ่มต้น (Schema & Seed Data):
```bash
cd /var/www/rta-sinmai

# ติดตั้งตาราง
PGPASSWORD='RtaSinmai@2026!' psql -h localhost -U rta_admin -d rta_sinmai -f deploy/postgres/schema.sql

# นำเข้าข้อมูลเริ่มต้น (ผู้ใช้งานเริ่มต้น, หน่วยทหาร, แบบทดสอบ)
PGPASSWORD='RtaSinmai@2026!' psql -h localhost -U rta_admin -d rta_sinmai -f deploy/postgres/seed-data.sql
```

---

### ขั้นตอนที่ 4: ดาวน์โหลดโค้ด ติดตั้ง Dependencies และ Build
```bash
cd /var/www/rta-sinmai

# สร้างโฟลเดอร์เก็บ Log
mkdir -p logs

# ติดตั้ง Node Packages
npm install --legacy-peer-deps

# สั่ง Build โค้ดสำหรับ Production
npm run build
```

---

### ขั้นตอนที่ 5: เริ่มการทำงานด้วย PM2 (Background Daemon)
ไฟล์ `ecosystem.config.js` ได้เตรียมไว้ให้เรียบร้อยแล้ว:
```bash
# สั่งเริ่มการทำงานระบบ
pm2 start ecosystem.config.js

# บันทึกสถานะเพื่อให้เปิดขึ้นมาอัตโนมัติเมื่อ Server รีบูต
pm2 save

# ลงทะเบียนเข้า Systemd Startup
pm2 startup systemd -u root --hp /root
```

---

### ขั้นตอนที่ 6: ติดตั้งและตั้งค่า Nginx Reverse Proxy
```bash
# ติดตั้ง Nginx
sudo apt install -y nginx

# ลบ default configuration
sudo rm -f /etc/nginx/sites-enabled/default

# ลิงก์ไฟล์คอนฟิกจากโปรเจกต์
sudo cp deploy/nginx/sinmai.conf /etc/nginx/sites-available/sinmai
sudo ln -sf /etc/nginx/sites-available/sinmai /etc/nginx/sites-enabled/sinmai

# ทดสอบไวยากรณ์คอนฟิก
sudo nginx -t

# รีสตาร์ท Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

### ขั้นตอนที่ 7: ตั้งค่า Firewall (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 🔒 ขั้นตอนที่ 8: ติดตั้ง HTTPS (SSL ฟรีจาก Let's Encrypt)
เมื่อทำการชี้ชื่อ Domain Name (เช่น `sinmai.army.mil.th`) มายัง IP ของเครื่องแล้ว สามารถเปิด HTTPS ได้ง่ายๆ ด้วย Certbot:

```bash
# ติดตั้ง Certbot Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# สั่งออกใบรับรอง SSL อัตโนมัติ
sudo certbot --nginx -d sinmai.army.mil.th

# ระบบจะแก้ไข Nginx config เป็น HTTPS ให้อัตโนมัติ และตั้งค่า Auto-renewal ทุก 90 วัน
```

---

## 🔄 คำสั่งสำหรับผู้ดูแลระบบ (Operations & Maintenance)

| คำสั่ง | วัตถุประสงค์ |
| :--- | :--- |
| `bash deploy/update.sh` | **อัปเดตระบบอัตโนมัติ** ดึงโค้ดจาก Git + Build + Reload PM2 |
| `pm2 status` | ตรวจสอบสถานะการทำงานของ Node.js App |
| `pm2 logs rta-sinmai` | ดู Log สดแบบ Real-time |
| `pm2 restart rta-sinmai` | รีสตาร์ท Process ของระบบ |
| `sudo systemctl status nginx` | ตรวจสอบสถานะของ Nginx |
| `sudo systemctl restart nginx` | รีสตาร์ท Nginx |
| `sudo systemctl status postgresql` | ตรวจสอบสถานะฐานข้อมูล PostgreSQL |

---

## 👤 บัญชีผู้ดูแลระบบตั้งต้น (Default Admin Account)
- **URL เข้าสู่ระบบ:** `http://<IP-SERVER>/login`
- **อีเมล:** `admin@army.mil.th`
- **เลขประจำตัวประชาชน:** `1100500001122`
- **รหัสผ่าน:** `password123`
- **สิทธิ์:** ผู้ดูแลระบบสูงสุด (ADMIN) สามารถอนุมัติผู้ใช้, จัดการชุดข้อสอบ, ดูประวัติ Log และเข้าถึงได้ทุกส่วนของระบบ
