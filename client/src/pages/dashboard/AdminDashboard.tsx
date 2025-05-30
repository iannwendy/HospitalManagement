import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import '../../assets/dashboard.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    
    // Get current user
    const userData = getCurrentUser();
    if (!userData || userData.role !== 'admin') {
      logout();
      navigate('/admin/login');
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
      
      <div className="dashboard-header" style={{ backgroundColor: '#004e64' }}>
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="text-white mb-0">
                <span className="font-weight-bold">Administrator</span> Dashboard
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
          {/* Manage general data */}
          <div className="col-md-4 mb-4">
            <div className="card h-100 dashboard-card">
              <div className="card-body">
                <div className="card-icon mb-3">
                  <i className="bi bi-archive-fill"></i>
                </div>
                <h5 className="card-title">Manage general data</h5>
                <p className="card-text">Oversee and manage hospital-wide general data and configurations.</p>
                <Link to="/admin/general-data" className="btn btn-primary">Access Data</Link>
              </div>
            </div>
          </div>
          
          {/* Manage Staff Schedule */}
          <div className="col-md-4 mb-4">
            <div className="card h-100 dashboard-card">
              <div className="card-body">
                <div className="card-icon mb-3">
                  <i className="bi bi-calendar-range"></i>
                </div>
                <h5 className="card-title">Manage Staff Schedule</h5>
                <p className="card-text">Organize and update schedules for all hospital staff.</p>
                <Link to="/admin/staff-schedule" className="btn btn-primary">Manage Schedules</Link>
              </div>
            </div>
          </div>
          
          {/* Manage user */}
          <div className="col-md-4 mb-4">
            <div className="card h-100 dashboard-card">
              <div className="card-body">
                <div className="card-icon mb-3">
                  <i className="bi bi-people-fill"></i>
                </div>
                <h5 className="card-title">Manage user</h5>
                <p className="card-text">Administer user accounts, roles, and permissions.</p>
                <Link to="/admin/manage-users" className="btn btn-primary">Manage Users</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-footer mt-4 text-center">
          <p className="text-muted">
            <small>Hospital Management System | Administrator Portal</small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 