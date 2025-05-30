# Hospital Management System

A comprehensive web application for managing hospital operations, patient records, appointments, prescriptions, and medical workflows.

## 🏥 Overview

This Hospital Management System is a full-stack web application designed to streamline hospital operations and improve healthcare delivery. The system provides role-based access for patients, doctors, nurses, and administrators, each with specialized dashboards and functionality.

## 🚀 Features

### For Patients
- **Patient Registration & Authentication**: Secure account creation and login
- **Appointment Booking**: Schedule appointments with doctors by specialty
- **Medical Records Access**: View personal medical history and records
- **Prescription Management**: Track active prescriptions and medication history
- **Profile Management**: Update personal information and insurance details
- **Payment Processing**: Handle medical bills and payment verification

### For Doctors
- **Patient Management**: Search and access patient records
- **Medical Diagnosis**: Create and manage patient diagnoses
- **Prescription Writing**: Prescribe medications with detailed instructions
- **Test Ordering**: Order additional medical tests and consultations
- **Specialist Consultations**: Refer patients to other specialists
- **Patient Records**: Maintain comprehensive medical histories
- **Payment Verification**: Process and verify patient payments

### For Nurses
- **Patient Care Management**: Monitor and care for assigned patients
- **Medical Records**: Update and maintain patient medical records
- **Treatment Tracking**: Track patient treatments and recovery progress
- **Medication Administration**: Record medication administration

### For Administrators
- **User Management**: Create, update, and manage all user accounts
- **Staff Scheduling**: Manage doctor and nurse schedules
- **System Configuration**: Configure hospital departments and services
- **Data Management**: Oversee general hospital data and statistics
- **Reports & Analytics**: Generate system reports and analytics

### System Features
- **Appointment System**: Complete appointment booking and management
- **Prescription System**: Digital prescription creation and pharmacy integration
- **Medical Records**: Comprehensive electronic health records (EHR)
- **Multi-role Authentication**: Role-based access control and security
- **Real-time Notifications**: System notifications and alerts
- **Modern UI/UX**: Responsive design with Bootstrap integration

## 🛠 Technology Stack

### Frontend
- **React 19.1.0** with TypeScript
- **React Router DOM 7.5.3** for navigation
- **Bootstrap 5.3.6** for responsive UI
- **Bootstrap Icons 1.12.1** for iconography
- **Axios 1.9.0** for API communication

### Backend
- **Node.js** with Express.js 5.1.0
- **MySQL 2** with connection pooling
- **JWT Authentication** for secure access
- **bcrypt** for password hashing
- **CORS** for cross-origin requests
- **dotenv** for environment configuration

### Database
- **MySQL** (Primary database)
- **SQLite** (Alternative option)
- Comprehensive schema with foreign key relationships
- Support for transactions and data integrity

## 📁 Project Structure

```
HOSPITAL/
├── client/                       # React Frontend Application
│   ├── public/                   # Static assets and HTML template
│   ├── src/
│   │   ├── assets/              # CSS styles and images
│   │   ├── components/          # Reusable UI components
│   │   ├── config/              # Application configuration
│   │   ├── pages/               # Application pages
│   │   │   ├── auth/            # Authentication pages
│   │   │   ├── dashboard/       # Role-based dashboards
│   │   │   ├── admin/           # Administrator features
│   │   │   ├── doctor/          # Doctor features
│   │   │   │   ├── diagnose/    # Diagnosis management
│   │   │   │   └── prescribe/   # Prescription management
│   │   │   ├── nurse/           # Nurse features
│   │   │   ├── patient/         # Patient features
│   │   │   ├── appointments/    # Appointment system
│   │   │   │   └── steps/       # Appointment booking steps
│   │   │   └── payment/         # Payment processing
│   │   ├── services/            # API service layers
│   │   ├── types/               # TypeScript type definitions
│   │   └── utils/               # Utility functions
│   ├── package.json
│   └── tsconfig.json
│
└── server/                       # Node.js Backend Server
    ├── database/                 # Database schemas and migrations
    │   ├── init.sql             # Initial database schema
    │   └── prescription-tables.sql # Prescription system tables
    ├── middleware/               # Authentication and security middleware
    ├── routes/                   # API route handlers
    │   ├── api.js               # General API routes
    │   ├── auth.js              # Authentication routes
    │   └── prescriptions.js     # Prescription management API
    ├── database-mysql.js         # MySQL database manager
    ├── server-mysql.js           # Main MySQL server
    ├── setup-mysql.sh            # MySQL setup script
    ├── add-mysql-test-data.js    # Test data generator
    ├── package.json
    └── .env.example              # Environment configuration template
```

## ⚙️ Installation Guide

### System Requirements

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MySQL Server** (v5.7 or higher)
- **Git** for version control

### Step 1: Clone the Repository

```bash
git clone https://github.com/iannwendy/HospitalManagement
cd HOSPITAL
```

### Step 2: Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your MySQL configuration:
   ```env
   # MySQL Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=hospital_db
   
   # Server Configuration
   PORT=3001
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   ```

4. Setup MySQL Database:

   **Option A: Automated Setup (Recommended)**
   ```bash
   chmod +x setup-mysql.sh
   ./setup-mysql.sh
   ```

   **Option B: Manual Setup**
   ```sql
   -- Login to MySQL and create database
   CREATE DATABASE hospital_db DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;
   ```
   
   Then initialize the database:
   ```bash
   node add-mysql-test-data.js
   ```

### Step 3: Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd ../client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server**:
   ```bash
   cd server
   npm run mysql-dev    # MySQL with auto-restart
   ```
   Server will run at `http://localhost:3001`

2. **Start the Frontend** (in a new terminal):
   ```bash
   cd client
   npm start
   ```
   Application will open at `http://localhost:3000`

### Production Mode

1. **Build the Frontend**:
   ```bash
   cd client
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   cd server
   npm run mysql
   ```

## 👥 User Accounts & Login

All test accounts use the password: `password123`

### Patient Accounts
- `patient@test.com` - Test Patient

### Doctor Accounts
- `doctor@test.com` - Test Doctor

### Nurse Accounts
- `nurse@test.com` - Test Nurse

### Administrator Accounts
- `admin@test.com` - System Administrator

## 📊 Database Schema

The system uses a comprehensive MySQL database with the following main tables:

- **users**: User authentication and basic profile information
- **patients**: Patient-specific information and medical history
- **doctors**: Doctor profiles and specializations
- **nurses**: Nurse profiles and department assignments
- **appointments**: Appointment scheduling and management
- **medical_records**: Patient medical records and diagnoses
- **prescriptions**: Prescription information
- **medications**: Individual medications within prescriptions
- **pharmacies**: Pharmacy information for prescription fulfillment
- **departments**: Hospital departments and services

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Patient registration

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions (with patient filter)
- `POST /api/prescriptions` - Create new prescription
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Delete prescription

### General API
- `GET /api/users` - Get user information
- `POST /api/appointments` - Create appointment
- `GET /api/medical-records` - Get medical records

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for user passwords
- **Role-based Access Control**: Different access levels for user roles
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Cross-origin request security

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
cd client
npm test

# Backend tests (if available)
cd server
npm test
```

### Test Data
The system comes with comprehensive test data including:
- Sample patients, doctors, nurses, and administrators
- Test prescriptions and medications
- Sample appointments and medical records

## 🚀 Deployment

### Frontend Deployment
The React application can be deployed to:
- **Vercel**: Connect your Git repository for automatic deployments
- **Netlify**: Drag and drop the build folder or connect via Git
- **AWS S3 + CloudFront**: For scalable static hosting

### Backend Deployment
The Node.js server can be deployed to:
- **Heroku**: With MySQL add-on
- **DigitalOcean App Platform**: With managed MySQL database
- **AWS EC2**: With RDS MySQL instance
- **Google Cloud Platform**: With Cloud SQL

### Environment Variables for Production
Ensure the following environment variables are configured in production:
```env
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=hospital_db
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
```

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MySQL connection settings in `.env`
- Ensure MySQL server is running
- Verify all dependencies are installed: `npm install`
- Check if port 3001 is available

**Frontend won't start:**
- Ensure Node.js version 14+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check if port 3000 is available

**Database connection errors:**
- Verify MySQL credentials in `.env` file
- Ensure MySQL server is running and accessible
- Check firewall settings if using remote database
- Verify database exists: `SHOW DATABASES;`

**API connection errors:**
- Ensure backend server is running
- Check CORS configuration for cross-origin requests
- Verify API endpoints in frontend service files
- Check network connectivity between frontend and backend

### Logs and Debugging
- Backend logs: Check console output when running `npm run mysql-dev`
- Frontend logs: Open browser developer tools console
- Database logs: Check MySQL error logs
- Network logs: Use browser Network tab to debug API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the comprehensive documentation provided

---

**Hospital Management System** - Improving healthcare delivery through digital innovation. 
