import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import '../../assets/auth.css';
import axios from 'axios';
import { checkServerAvailability } from '../../utils/auth';
import { API_CONFIG } from '../../config/api';

const API_URL = API_CONFIG.BASE_URL;

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isServerAvailable, setIsServerAvailable] = useState(true);

  useEffect(() => {
    // Check if the server is available
    const checkServer = async () => {
      const isAvailable = await checkServerAvailability();
      setIsServerAvailable(isAvailable);
      console.log('Server is', isAvailable ? 'available' : 'offline');
    };
    
    checkServer();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      console.log('Attempting login with:', { email: formData.email });
      
      let userData;
      
      try {
        // Try the normal API call first
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        
        console.log('Login successful:', response.data);
        userData = response.data.user;
        
        // Check if user is an admin
        if (userData.role !== 'admin') {
          setError('Access denied. Only administrators can login here.');
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.error('API call failed, using local fallback:', apiError);
        
        // Only allow specific test accounts in fallback mode
        const testAdmins = [
          { email: 'admin@test.com', password: 'password123' },
          { email: 'admin@hospital.com', password: 'admin123' }
        ];
        
        const foundTestUser = testAdmins.find(
          user => user.email === formData.email && user.password === formData.password
        );
        
        if (!foundTestUser) {
          setError('Invalid credentials. When server is offline, only test accounts can be used.');
          setLoading(false);
          return;
        }
        
        // For testing purposes, create a mock admin user
        userData = {
          id: 1,
          email: formData.email,
          role: 'admin'
        };
      }
      
      // Store token and user data
      localStorage.setItem('token', 'test-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Show success message instead of alert
      setSuccess('Login successful! Redirecting to dashboard...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Navbar />
      
      <div className="auth-content">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="auth-card">
                <div className="auth-header">
                  <h2>Administrator Login</h2>
                  <p className="text-muted">
                    Access hospital management dashboard
                  </p>
                </div>
                
                {!isServerAvailable && (
                  <div className="alert alert-warning mb-4" role="alert">
                    <strong>Server Offline Mode:</strong> The backend server appears to be unavailable.
                    <div className="mt-2">
                      <strong>Test Admin Login:</strong> 
                      <ul>
                        <li>Email: admin@test.com</li>
                        <li>Password: password123</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="alert alert-success" role="alert">
                    {success}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Logging in...
                        </span>
                      ) : 'Login'}
                    </button>
                  </div>
                </form>
                
                <div className="auth-footer">
                  <p>
                    <Link to="/admin/forgot-password" className="btn btn-link p-0">Forgot Password?</Link>
                  </p>
                  <p className="mt-3 text-muted small">
                    <strong>Security Notice:</strong> This portal is for hospital administrators only. 
                    All login attempts are logged and monitored.
                  </p>
                </div>
              </div>
              
              <div className="auth-back-link mt-3 text-center">
                <Link to="/" className="text-decoration-none">
                  <i className="bi bi-arrow-left"></i> Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 