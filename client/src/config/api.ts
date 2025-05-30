// API Configuration
export const API_CONFIG = {
  // Use the environment variable if defined, otherwise use localhost:3001
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  
  // Timeout for API requests in milliseconds
  TIMEOUT: 5000,
  
  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER_PATIENT: '/api/auth/register/patient',
      CURRENT_USER: '/api/auth/me'
    },
    
    // User endpoints
    USERS: {
      PATIENTS: '/api/users/patients',
      DOCTORS: '/api/users/doctors',
      NURSES: '/api/users/nurses'
    },
    
    // Appointment endpoints
    APPOINTMENTS: '/api/appointments'
  }
};

export default API_CONFIG; 