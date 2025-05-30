import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import '../../assets/dashboard.css';

const NurseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/nurse/login');
      return;
    }
    
    // Get current user
    const userData = getCurrentUser();
    if (!userData || userData.role !== 'nurse') {
      logout();
      navigate('/nurse/login');
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
      
      <div className="dashboard-header" style={{ backgroundColor: '#6fb98f' }}>
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="text-white mb-0">
                <span className="font-weight-bold">Nurse</span> Dashboard
              </h1>
              <p className="text-white-50 mb-0">Welcome back, {user.email}</p>
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
                  <i className="bi bi-heart-pulse"></i>
                </div>
                <h5 className="card-title">Take Care Of Patients</h5>
                <p className="card-text">Manage patient care plans, vital signs, and treatments.</p>
                <Link to="/nurse/patients" className="btn btn-primary">View Patients</Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 dashboard-card">
              <div className="card-body">
                <div className="card-icon mb-3">
                  <i className="bi bi-calendar3"></i>
                </div>
                <h5 className="card-title">Manage appointment</h5>
                <p className="card-text">View and manage patient appointments.</p>
                <Link to="/nurse/appointments" className="btn btn-primary">View Schedule</Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card h-100 dashboard-card">
              <div className="card-body">
                <div className="card-icon mb-3">
                  <i className="bi bi-file-earmark-medical"></i>
                </div>
                <h5 className="card-title">Manage medical records</h5>
                <p className="card-text">Access and update patient medical records.</p>
                <Link to="/nurse/records" className="btn btn-primary">Manage Records</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-footer mt-4 text-center">
          <p className="text-muted">
            <small>Hospital Management System | Nurse Portal</small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard; 