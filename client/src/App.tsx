import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { loadUser, setAuthToken, isAuthenticated, getCurrentUser } from './utils/auth';

// Pages
import Home from './pages/Home';
import PatientAuth from './pages/auth/PatientAuth';
import DoctorLogin from './pages/auth/DoctorLogin';
import NurseLogin from './pages/auth/NurseLogin';
import AdminLogin from './pages/auth/AdminLogin';

// Dashboard Pages
import PatientDashboard from './pages/dashboard/PatientDashboard';
import DoctorDashboard from './pages/dashboard/DoctorDashboard';
import NurseDashboard from './pages/dashboard/NurseDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import BookAppointment from './pages/appointments/BookAppointment';
import AppointmentSuccess from './pages/appointments/AppointmentSuccess';
import ManageAppointmentsPage from './pages/appointments/ManageAppointmentsPage';
import ManageGeneralDataPage from './pages/admin/ManageGeneralDataPage';
import ManageMedicalRecordsPage from './pages/nurse/ManageMedicalRecordsPage';
import ManageStaffSchedulePage from './pages/admin/ManageStaffSchedulePage';
import ManageUserPage from './pages/admin/ManageUserPage';
import PerformTestPage from './pages/doctor/PerformTestPage';
import ProcessPaymentPage from './pages/payment/ProcessPaymentPage';
import VerifyInformationPage from './pages/patient/VerifyInformationPage';
import TakeCareOfPatientPage from './pages/nurse/TakeCareOfPatientPage';

// Doctor features
import PrescribeMedication from './pages/doctor/prescribe/PrescribeMedication';
import DiagnoseDisease from './pages/doctor/diagnose/DiagnoseDisease';

// Protected Route Component
interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRole?: string;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  element, 
  requiredRole, 
  redirectPath = '/doctor/login' 
}) => {
  // Check if authenticated
  const authenticated = isAuthenticated();
  
  // If not authenticated, redirect to login
  if (!authenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // If role is required, check user role
  if (requiredRole) {
    const user = getCurrentUser();
    if (!user || user.role !== requiredRole) {
      // Redirect to appropriate login based on requiredRole
      let loginPath = '/';
      switch (requiredRole) {
        case 'doctor':
          loginPath = '/doctor/login';
          break;
        case 'nurse':
          loginPath = '/nurse/login';
          break;
        case 'admin':
          loginPath = '/admin/login';
          break;
        case 'patient':
          loginPath = '/patient/login';
          break;
      }
      return <Navigate to={loginPath} replace />;
    }
  }
  
  // If authenticated and role is correct, render the element
  return <>{element}</>;
};

function App() {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check for token and load user
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          await loadUser();
        } catch (err) {
          console.error('Error loading user in App.tsx:', err);
        }
      }
      setAuthChecked(true);
    };
    
    initAuth();
  }, []);

  // Show loading while checking authentication
  if (!authChecked) {
    return <div className="App">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Authentication Routes */}
          <Route path="/patient/login" element={<PatientAuth />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/nurse/login" element={<NurseLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Dashboard Routes - Protected */}
          <Route path="/patient/dashboard" element={
            <ProtectedRoute element={<PatientDashboard />} requiredRole="patient" redirectPath="/patient/login" />
          } />
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute element={<DoctorDashboard />} requiredRole="doctor" redirectPath="/doctor/login" />
          } />
          <Route path="/nurse/dashboard" element={
            <ProtectedRoute element={<NurseDashboard />} requiredRole="nurse" redirectPath="/nurse/login" />
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute element={<AdminDashboard />} requiredRole="admin" redirectPath="/admin/login" />
          } />
          
          {/* Appointment Routes */}
          <Route path="/appointments/book" element={
            <ProtectedRoute element={<BookAppointment />} requiredRole="patient" redirectPath="/patient/login" />
          } />
          <Route path="/appointment/success" element={
            <ProtectedRoute element={<AppointmentSuccess />} requiredRole="patient" redirectPath="/patient/login" />
          } />
          <Route path="/nurse/appointments" element={
            <ProtectedRoute element={<ManageAppointmentsPage />} requiredRole="nurse" redirectPath="/nurse/login" />
          } />
          <Route path="/admin/general-data" element={
            <ProtectedRoute element={<ManageGeneralDataPage />} requiredRole="admin" redirectPath="/admin/login" />
          } />
          
          {/* Admin Staff Schedule Management Route - Protected */}
          <Route path="/admin/staff-schedule" element={
            <ProtectedRoute element={<ManageStaffSchedulePage />} requiredRole="admin" redirectPath="/admin/login" />
          } />
          
          {/* Admin User Management Route - Protected */}
          <Route path="/admin/manage-users" element={
            <ProtectedRoute element={<ManageUserPage />} requiredRole="admin" redirectPath="/admin/login" />
          } />
          
          {/* Nurse Medical Records Management Route - Protected */}
          <Route path="/nurse/records" element={
            <ProtectedRoute element={<ManageMedicalRecordsPage />} requiredRole="nurse" redirectPath="/nurse/login" />
          } />
          
          {/* Nurse Take Care of Patient Route - Protected */}
          <Route path="/nurse/patients" element={
            <ProtectedRoute element={<TakeCareOfPatientPage />} requiredRole="nurse" redirectPath="/nurse/login" />
          } />
          
          {/* Doctor Feature Routes - Protected */}
          <Route path="/doctor/prescribe" element={
            <ProtectedRoute element={<PrescribeMedication />} requiredRole="doctor" redirectPath="/doctor/login" />
          } />
          <Route path="/doctor/diagnose" element={
            <ProtectedRoute element={<DiagnoseDisease />} requiredRole="doctor" redirectPath="/doctor/login" />
          } />
          <Route path="/doctor/perform-test" element={
            <ProtectedRoute element={<PerformTestPage />} requiredRole="doctor" redirectPath="/doctor/login" />
          } />
          
          {/* Patient Payment Route - Protected */}
          <Route path="/patient/process-payment" element={
            <ProtectedRoute element={<ProcessPaymentPage />} requiredRole="patient" redirectPath="/patient/login" />
          } />
          
          {/* Patient Verify Information Route - Protected */}
          <Route path="/patient/verify-information" element={
            <ProtectedRoute element={<VerifyInformationPage />} requiredRole="patient" redirectPath="/patient/login" />
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
