#!/bin/bash

# Script để thiết lập cơ sở dữ liệu MySQL cho ứng dụng Hospital Management System

echo "===== Thiết lập cơ sở dữ liệu MySQL cho Hospital Management System ====="

# Kiểm tra xem MySQL đã được cài đặt chưa
if ! command -v mysql &> /dev/null; then
    echo "MySQL chưa được cài đặt. Vui lòng cài đặt MySQL trước khi chạy script này."
    exit 1
fi

# Lấy thông tin kết nối từ người dùng
read -p "Nhập tên máy chủ MySQL (mặc định: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Nhập tên người dùng MySQL (mặc định: root): " DB_USER
DB_USER=${DB_USER:-root}

read -p "Nhập mật khẩu MySQL (để trống nếu không có): " DB_PASSWORD

read -p "Nhập tên cơ sở dữ liệu (mặc định: hospital_db): " DB_NAME
DB_NAME=${DB_NAME:-hospital_db}

# Tạo cơ sở dữ liệu
echo "Tạo cơ sở dữ liệu $DB_NAME..."
mysql -h $DB_HOST -u $DB_USER ${DB_PASSWORD:+-p$DB_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS $DB_NAME DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;"

if [ $? -ne 0 ]; then
    echo "Lỗi khi tạo cơ sở dữ liệu. Vui lòng kiểm tra thông tin kết nối."
    exit 1
fi

# Tạo file .env
echo "Tạo file .env với thông tin cấu hình..."
cat > .env << EOF
# MySQL Database Configuration
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# Server Configuration
PORT=3000
EOF

echo "File .env đã được tạo thành công."

# Khởi tạo cấu trúc cơ sở dữ liệu
echo "Cài đặt các gói Node.js cần thiết..."
npm install

echo "Khởi tạo cấu trúc cơ sở dữ liệu và dữ liệu mẫu..."
node add-mysql-test-data.js

echo "===== Thiết lập cơ sở dữ liệu MySQL hoàn tất ====="
echo "Bạn có thể chạy server với lệnh: npm run mysql" 