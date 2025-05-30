import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import '../../assets/auth.css';
import axios from 'axios';
import { checkServerAvailability } from '../../utils/auth';
import { API_CONFIG } from '../../config/api';

const API_URL = API_CONFIG.BASE_URL;

const DoctorLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
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
    setLoading(true);
    setSuccess('');
    
    try {
      console.log('Attempting login with:', { email: formData.email });
      
      let userData;
      
      try {
        // Try the normal API call first - explicitly log API endpoint
        const loginUrl = `${API_URL}/api/auth/login`;
        console.log('Login URL:', loginUrl);
        
        const response = await axios.post(loginUrl, {
          email: formData.email,
          password: formData.password
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 seconds timeout
        });
        
        console.log('Login successful:', response.data);
        userData = response.data.user;
        
        // Check if user is a doctor
        if (userData.role !== 'doctor') {
          setError('Access denied. Only doctors can login here.');
          setLoading(false);
          return;
        }
      } catch (apiError: any) {
        console.error('API call failed:', apiError);
        
        // Log more details about the error
        if (apiError.response) {
          console.log('Error response:', {
            status: apiError.response.status,
            data: apiError.response.data,
            headers: apiError.response.headers
          });
        } else if (apiError.request) {
          console.log('Error request (no response received):', apiError.request);
        }
        
        // Check if this is a server connection issue or an authentication issue
        const isServerError = !apiError.response || apiError.response.status >= 500;
        
        if (isServerError) {
          // Server is actually unavailable despite the availability check
          setIsServerAvailable(false);
          
          // Only allow specific test accounts in fallback mode
          const testDoctors = [
            { email: 'doctor@test.com', password: 'password123' },
            { email: 'drsmith@example.com', password: 'password123' }
          ];
          
          const foundTestUser = testDoctors.find(
            user => user.email === formData.email && user.password === formData.password
          );
          
          if (!foundTestUser) {
            setError('Invalid credentials. When server is offline, only test accounts can be used.');
            setLoading(false);
            return;
          }
          
          // For testing purposes, create a mock doctor user
          userData = {
            id: 1,
            email: formData.email,
            role: 'doctor'
          };
        } else {
          // This is a regular authentication error from the server (like wrong password)
          const errorMessage = apiError.response?.data?.error || 'Invalid email or password. Please try again.';
          setError(errorMessage);
          setLoading(false);
          return;
        }
      }
      
      // Store token and user data
      localStorage.setItem('token', 'test-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Show success message instead of alert
      setSuccess('Login successful! Redirecting to dashboard...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/doctor/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleServerMode = () => {
    setIsServerAvailable(!isServerAvailable);
    console.log('Manually toggled server mode to:', !isServerAvailable ? 'online' : 'offline');
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
                  <h2>Doctor Login</h2>
                  <p className="text-muted">
                    Access your medical dashboard to manage patient records and appointments
                  </p>
                </div>
                
                {!isServerAvailable && (
                  <div className="alert alert-warning mb-4" role="alert">
                    <strong>Server Offline Mode:</strong> The backend server appears to be unavailable.
                    <div className="mt-2">
                      <strong>Test Doctor Login:</strong> 
                      <ul>
                        <li>Email: doctor@test.com</li>
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
                    <Link to="/doctor/forgot-password" className="btn btn-link p-0">Forgot Password?</Link>
                  </p>
                  <p className="mt-3 text-muted small">
                    Note: Only authorized doctors can access this portal. If you're experiencing issues logging in,
                    please contact the hospital administration.
                  </p>
                </div>
                
                <div className="mt-4 pt-3 border-top text-center">
                  <small className="text-muted d-block mb-2">Having connection issues?</small>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    type="button"
                    onClick={toggleServerMode}
                  >
                    {isServerAvailable ? 'Switch to Offline Mode' : 'Try Online Mode'}
                  </button>
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

export default DoctorLogin; 