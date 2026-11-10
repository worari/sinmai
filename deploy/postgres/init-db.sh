#!/bin/bash
# deploy/postgres/init-db.sh
# สคริปต์สร้างฐานข้อมูลและตาราง PostgreSQL อัตโนมัติ

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# ค่าเริ่มต้น (Default Fallbacks)
DB_NAME="rta_sinmai"
DB_USER="rta_admin"
DB_PASS="RtaSinmai@2026!"
DB_HOST="localhost"
DB_PORT="5432"

# อ่านค่าคอนฟิกจากไฟล์ .env หากมีอยู่
if [ -f "$APP_DIR/.env" ]; then
    echo "📋 โหลดค่าการเชื่อมต่อฐานข้อมูลจาก $APP_DIR/.env ..."
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

echo "=========================================="
echo "🎖️ เริ่มต้นตั้งค่าฐานข้อมูล PostgreSQL สำหรับระบบสินไหม ทบ."
echo "=========================================="

# ตรวจสอบว่า postgres service รันอยู่หรือไม่
if ! systemctl is-active --quiet postgresql; then
    echo "กำลังเริ่มการทำงานของบริการ PostgreSQL..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

echo "1. สร้าง Database User และ Database..."
sudo -u postgres psql <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASS' CREATEDB;
    ELSE
        ALTER ROLE $DB_USER WITH PASSWORD '$DB_PASS';
    END IF;
END
\$\$;

SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
EOF

echo "2. ติดตั้งโครงสร้างตาราง (Tables & Indexes)..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/schema.sql"

if [ -f "$SCRIPT_DIR/seed-data.sql" ]; then
    echo "3. นำเข้าข้อมูลเริ่มต้น (Seed Data)..."
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/seed-data.sql"
fi

echo "=========================================="
echo "✅ สร้างฐานข้อมูล PostgreSQL และนำเข้าข้อมูลเริ่มต้นสำเร็จเรียบร้อย!"
echo "Database: $DB_NAME"
echo "Username: $DB_USER"
echo "Connection URL: postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
echo "=========================================="
