import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const AppointmentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);
  const [error, setError] = useState<string | null>(null);
  
  // This would normally use location.state to get the appointment data
  // For demo purposes, we'll just show a generic success message
  
  useEffect(() => {
    // Automatically redirect to dashboard after countdown
    const timer = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(timer);
          try {
            navigate('/patient/dashboard');
          } catch (err) {
            setError('Unable to redirect to dashboard. Please click the button below.');
          }
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate]);
  
  const handleViewDashboard = () => {
    try {
      navigate('/patient/dashboard');
    } catch (err) {
      setError('Unable to navigate to dashboard. Please try refreshing the page.');
    }
  };

  return (
    <div className="booking-container">
      <Navbar />
      
      <div className="booking-header">
        <div className="container py-4">
          <h1>Appointment Booked</h1>
        </div>
      </div>
      
      <div className="container py-5">
        <div className="success-page text-center">
          <div className="success-icon">
            <i className="bi bi-check-circle-fill" style={{ fontSize: '5rem', color: '#10b981' }}></i>
          </div>
          
          <h2 className="success-title mt-4">Your Appointment is Confirmed!</h2>
          
          <p className="success-message mt-3">
            Thank you for booking an appointment with us. You will receive a confirmation 
            email shortly with all the details. We look forward to seeing you!
          </p>
          
          {error && (
            <div className="alert alert-warning mt-4">
              <p>{error}</p>
            </div>
          )}
          
          <div className="mt-5">
            <p>You will be redirected to your dashboard in {countdown} seconds.</p>
            <button 
              className="btn btn-primary"
              onClick={handleViewDashboard}
            >
              Return to Dashboard Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSuccess; 