import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import '../../assets/dashboard.css';

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Initialize user data from authentication
    const initDashboard = async () => {
      setLoading(true);
      
      // Check if user is authenticated
      if (!isAuthenticated()) {
        // If not authenticated, navigate to login
        navigate('/doctor/login');
        return;
      }
      
      // Get current user
      const userData = getCurrentUser();
      
      // Validate role
      if (!userData) {
        console.error('User data is missing in dashboard');
        navigate('/doctor/login');
        return;
      }
      
      if (userData.role !== 'doctor') {
        console.warn('User tried to access doctor dashboard without doctor role');
        // Logout and redirect
        logout();
        navigate('/doctor/login');
        return;
      }
      
      // Set user data
      setUser(userData);
      setLoading(false);
    };
    
    initDashboard();
  }, [navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  if (loading) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-5 text-center">Please login to continue</div>;
  }
  
  return (
    <div className="dashboard-container">
      <Navbar isDashboard={true} />
      
      <div className="dashboard-header" style={{ backgroundColor: '#2c6975' }}>
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="text-white mb-0">
                <span className="font-weight-bold">Doctor</span> Dashboard
              </h1>
              <p className="text-white-50 mb-0">Welcome back, Dr. {user.name || user.email}</p>
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
                  <i className="bi bi-capsule"></i>
                </div>
                <h5 className="card-title">Prescribe Medication</h5>
                <p className="card-text">Create and manage prescriptions for patients under your care.</p>
                <Link to="/doctor/prescribe" className="btn btn-primary">Prescribe Now</Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 dashboard-card">
              <div className="card-body">
                <div className="card-icon mb-3">
                  <i className="bi bi-clipboard2-pulse"></i>
                </div>
                <h5 className="card-title">Perform Test</h5>
                <p className="card-text">Order and review medical tests for accurate diagnosis.</p>
                <Link to="/doctor/perform-test" className="btn btn-primary">Order Tests</Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 dashboard-card">
              <div className="card-body">
                <div className="card-icon mb-3">
                  <i className="bi bi-heart-pulse"></i>
                </div>
                <h5 className="card-title">Diagnose A Disease</h5>
                <p className="card-text">Evaluate symptoms and test results to diagnose patient conditions.</p>
                <Link to="/doctor/diagnose" className="btn btn-primary">Diagnose Patient</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-footer mt-4 text-center">
          <p className="text-muted">
            <small>Hospital Management System | Doctor Portal</small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard; 