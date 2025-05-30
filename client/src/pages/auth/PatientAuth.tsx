import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import '../../assets/auth.css';
import axios from 'axios';
import { checkServerAvailability } from '../../utils/auth';
import { API_CONFIG } from '../../config/api';

const API_URL = API_CONFIG.BASE_URL;

const PatientAuth: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    insurance: ''
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (isLogin) {
        // Handle login
        console.log('Attempting login with:', { email: formData.email });
        
        let userData;
        
        try {
          // Try the normal API call first
          const response = await axios.post(`${API_URL}/auth/login`, {
            email: formData.email,
            password: formData.password
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Login successful:', response.data);
          userData = {
            token: response.data.token,
            user: response.data.user
          };
        } catch (apiError: any) {
          console.error('API call failed, using local fallback:', apiError);
          
          // Check if this is a server connection issue or an authentication issue
          const isServerError = !apiError.response || apiError.response.status >= 500;
          
          if (isServerError) {
            // Server is actually unavailable despite the availability check
            setIsServerAvailable(false);
            
            // Only allow specific test accounts in fallback mode
            const testPatients = [
              { email: 'patient@test.com', password: 'password123' },
              { email: 'john@example.com', password: 'password123' }
            ];
            
            const foundTestUser = testPatients.find(
              user => user.email === formData.email && user.password === formData.password
            );
            
            if (!foundTestUser) {
              setError('Invalid credentials. When server is offline, only test accounts can be used.');
              setLoading(false);
              return;
            }
            
            // For testing purposes, create a mock patient user
            userData = {
              token: 'test-token-' + Date.now(),
              user: {
                id: 1,
                email: formData.email,
                role: 'patient',
                firstName: 'Test',
                lastName: 'Patient',
                name: 'Test Patient',
                phone: '(123) 456-7890',
                dateOfBirth: '1990-01-01',
                gender: 'Male',
                address: '123 Main St, New York, NY',
                insurance: 'ABC Insurance #12345'
              }
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
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData.user));
        
        // Show success message instead of alert
        setSuccess('Login successful! Redirecting to dashboard...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/patient/dashboard');
        }, 1500);
      } else {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        
        // Validate date of birth
        if (!formData.dateOfBirth) {
          setError('Date of birth is required');
          setLoading(false);
          return;
        }
        
        // Validate gender
        if (!formData.gender) {
          setError('Gender is required');
          setLoading(false);
          return;
        }
        
        console.log('Attempting registration with:', { 
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          phone: formData.phone
        });
        
        // Handle registration
        let userData;
        
        try {
          // Try the normal API call first
          const response = await axios.post(`${API_URL}/auth/register/patient`, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            phone: formData.phone,
            address: formData.address,
            insurance: formData.insurance
          });
          
          console.log('Registration successful:', response.data);
          userData = response.data;
        } catch (apiError: any) {
          console.error('API call failed:', apiError);
          
          // Check if this is a duplicate email error
          if (apiError.response && apiError.response.data && 
              apiError.response.data.error && 
              apiError.response.data.error.includes('already registered')) {
            setError('This email address is already registered. Please use a different email or try logging in.');
            setLoading(false);
            return;
          }
          
          // If it's a server connection issue, use the fallback
          const isServerError = !apiError.response || apiError.response.status >= 500;
          
          if (isServerError) {
            setIsServerAvailable(false);
            
            // Validate the registration data more strictly in fallback mode
            if (formData.email.indexOf('@') === -1 || formData.password.length < 8) {
              setError('Email must be valid and password must be at least 8 characters long.');
              setLoading(false);
              return;
            }
            
            // Check for common email providers to avoid fake emails
            const validDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'test.com', 'example.com'];
            const emailDomain = formData.email.split('@')[1];
            
            if (!validDomains.includes(emailDomain)) {
              setError('Please use a valid email domain for testing.');
              setLoading(false);
              return;
            }
            
            // If the API call fails due to server error, use a local fallback for testing
            userData = {
              token: 'test-token-' + Date.now(),
              user: {
                id: 1,
                email: formData.email,
                role: 'patient',
                firstName: formData.firstName,
                lastName: formData.lastName,
                name: `${formData.firstName} ${formData.lastName}`,
                phone: formData.phone || '',
                dateOfBirth: formData.dateOfBirth || '',
                gender: formData.gender || '',
                address: formData.address || '',
                insurance: formData.insurance || ''
              },
              message: 'Patient registered successfully (local fallback)'
            };
          } else {
            // This is a regular error from the server (not specifically handled above)
            const errorMessage = apiError.response?.data?.error || 'Registration failed. Please try again.';
            setError(errorMessage);
            setLoading(false);
            return;
          }
        }
        
        // Store token and user data
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData.user));
        
        // Show success message instead of alert
        setSuccess('Registration successful! Redirecting to dashboard...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/patient/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Auth error full details:', err);
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
        
        setError(err.response.data.error || 'An error occurred. Please try again.');
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Error request:', err.request);
        setError('No response from server. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
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
                  <h2>{isLogin ? 'Patient Login' : 'Patient Registration'}</h2>
                  <p className="text-muted">
                    {isLogin 
                      ? 'Access your medical records and appointments' 
                      : 'Create an account to manage your healthcare'}
                  </p>
                </div>
                
                {!isServerAvailable && (
                  <div className="alert alert-warning mb-4" role="alert">
                    <strong>Server Offline Mode:</strong> The backend server appears to be unavailable.
                    {isLogin ? (
                      <div className="mt-2">
                        <strong>Test Patient Login:</strong> 
                        <ul>
                          <li>Email: patient@test.com</li>
                          <li>Password: password123</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="mt-2">
                        Registration will be simulated, but data won't be saved permanently.
                      </div>
                    )}
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
                  {!isLogin && (
                    <>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="firstName" className="form-label">First Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="lastName" className="form-label">Last Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                          <input
                            type="date"
                            className="form-control"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="gender" className="form-label">Gender</label>
                          <select
                            className="form-select"
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="address" className="form-label">Address</label>
                        <textarea
                          className="form-control"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={2}
                          placeholder="Enter your full address"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="insurance" className="form-label">Health Insurance Information</label>
                        <input
                          type="text"
                          className="form-control"
                          id="insurance"
                          name="insurance"
                          value={formData.insurance}
                          onChange={handleChange}
                          placeholder="Enter your insurance provider and policy number"
                          required
                        />
                      </div>
                    </>
                  )}
                  
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
                  
                  {!isLogin && (
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}
                  
                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {isLogin ? 'Logging in...' : 'Registering...'}
                        </span>
                      ) : (
                        isLogin ? 'Login' : 'Register'
                      )}
                    </button>
                  </div>
                </form>
                
                <div className="auth-footer">
                  <p>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                      type="button" 
                      className="btn btn-link p-0" 
                      onClick={toggleForm}
                    >
                      {isLogin ? 'Register' : 'Login'}
                    </button>
                  </p>
                  {isLogin && (
                    <p>
                      <Link to="/patient/forgot-password" className="btn btn-link p-0">Forgot Password?</Link>
                    </p>
                  )}
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

export default PatientAuth; 