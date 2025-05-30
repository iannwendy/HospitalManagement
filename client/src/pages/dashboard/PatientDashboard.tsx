import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import '../../assets/dashboard.css';

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/patient/login');
      return;
    }
    
    // Get current user
    const userData = getCurrentUser();
    if (!userData || userData.role !== 'patient') {
      logout();
      navigate('/patient/login');
      return;
    }
    
    setUser(userData);
  }, [navigate]);
  
  if (!user) {
    return <div className="p-5 text-center">Loading...</div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="dashboard-container">
      <Navbar isDashboard={true} />
      
      <div className="dashboard-header" style={{ backgroundColor: '#3a7ca5' }}>
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="text-white mb-0">
                <span className="font-weight-bold">Patient</span> Dashboard
              </h1>
              <p className="text-white-50 mb-0">
                Welcome back, {user.name || user.firstName ? `${user.firstName || ''} ${user.lastName || ''}` : user.email}
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <button 
                className="btn btn-light" 
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-5">
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card h-100 dashboard-card">
              <div className="card-body">
                <div className="card-icon mb-3">
                  <i className="bi bi-calendar-plus"></i>
                </div>
                <h5 className="card-title">Book Appointment</h5>
                <p className="card-text">Schedule a new appointment with a doctor of your choice.</p>
                <button className="btn btn-primary" onClick={() => navigate('/appointments/book')}>Book Now</button>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 dashboard-card">
              <div className="card-body">
                <div className="card-icon mb-3">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h5 className="card-title">Verify Information</h5>
                <p className="card-text">Verify and update your personal information and medical history.</p>
                <Link to="/patient/verify-information" className="btn btn-primary">Verify Now</Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 dashboard-card">
              <div className="card-body">
                <div className="card-icon mb-3">
                  <i className="bi bi-credit-card"></i>
                </div>
                <h5 className="card-title">Process Payment</h5>
                <p className="card-text">View, manage, and make payments for your medical services.</p>
                <Link to="/patient/process-payment" className="btn btn-primary">Process Payments</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-footer mt-4 text-center">
          <p className="text-muted">
            <small>Hospital Management System | Patient Portal</small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard; 