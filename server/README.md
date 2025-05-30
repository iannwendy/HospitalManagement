# Hospital Management System Server

Backend server cho hệ thống quản lý bệnh viện, hỗ trợ cả SQLite và MySQL.

## Môi trường phát triển

- Node.js (v14 trở lên)
- NPM hoặc Yarn
- MySQL (tùy chọn)

## Cài đặt

1. Cài đặt các gói phụ thuộc:
   ```
   npm install
   ```

## Chạy server với SQLite (mặc định)

1. Khởi động server:
   ```
   npm start
   ```
   
   Hoặc chế độ phát triển (tự động khởi động lại khi có thay đổi):
   ```
   npm run dev
   ```

## Chuyển đổi sang MySQL

### Yêu cầu
- MySQL Server đã được cài đặt
- Đặc quyền tạo cơ sở dữ liệu và bảng

### Cài đặt tự động

1. Chạy script thiết lập:
   ```
   chmod +x setup-mysql.sh
   ./setup-mysql.sh
   ```
   
   Script sẽ:
   - Tạo cơ sở dữ liệu MySQL
   - Tạo file `.env` với thông tin kết nối
   - Khởi tạo cấu trúc bảng
   - Thêm dữ liệu mẫu

2. Khởi động server MySQL:
   ```
   npm run mysql
   ```
   
   Hoặc chế độ phát triển:
   ```
   npm run mysql-dev
   ```

### Cài đặt thủ công

1. Tạo cơ sở dữ liệu MySQL:
   ```
   CREATE DATABASE hospital_db DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;
   ```

2. Tạo file `.env` trong thư mục server:
   ```
   # MySQL Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hospital_db

   # Server Configuration
   PORT=3000
   ```

3. Khởi tạo dữ liệu mẫu:
   ```
   npm run setup-mysql
   ```

4. Khởi động server MySQL:
   ```
   npm run mysql
   ```

## Cấu trúc dự án

- `server.js`: Server SQLite (mặc định)
- `server-mysql.js`: Server MySQL
- `database.js`: Kết nối và quản lý SQLite
- `database-mysql.js`: Kết nối và quản lý MySQL
- `add-test-accounts.js`: Thêm tài khoản mẫu cho SQLite
- `add-mysql-test-data.js`: Thêm dữ liệu mẫu cho MySQL
- `setup-mysql.sh`: Script tự động cài đặt MySQL

## Các endpoint API chính

- `POST /auth/login`: Đăng nhập
- `POST /auth/register/patient`: Đăng ký bệnh nhân mới
- `GET /auth/me`: Lấy thông tin người dùng hiện tại
- `GET /prescriptions/patient/:patientId`: Lấy đơn thuốc của bệnh nhân

## Tài khoản Test

- **Email**: `patient@test.com`, **Password**: `password123`, **Role**: `patient`
- **Email**: `doctor@test.com`, **Password**: `password123`, **Role**: `doctor`
- **Email**: `nurse@test.com`, **Password**: `password123`, **Role**: `nurse`
- **Email**: `admin@test.com`, **Password**: `password123`, **Role**: `admin` 