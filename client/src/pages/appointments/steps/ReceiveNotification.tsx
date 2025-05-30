import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Doctor, TimeSlot } from '../../../types/appointment';

interface ReceiveNotificationProps {
  patientInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  selectedDoctor: Doctor | null;
  selectedSlot: TimeSlot | null;
  appointmentType: string;
  appointmentReason: string;
  notifications: {
    email: boolean;
    sms: boolean;
  };
  onModify: () => void;
}

const ReceiveNotification: React.FC<ReceiveNotificationProps> = ({
  patientInfo,
  selectedDoctor,
  selectedSlot,
  appointmentType,
  appointmentReason,
  notifications,
  onModify
}) => {
  const navigate = useNavigate();
  
  // Check if we have all required data to display the notification
  if (!selectedDoctor || !selectedSlot) {
    return (
      <div className="alert alert-danger">
        <h4 className="alert-heading">Missing Appointment Information</h4>
        <p>There was an issue with your appointment details. Please try booking again.</p>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/patient/dashboard')}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const handleReturnDashboard = () => {
    navigate('/patient/dashboard');
  };
  
  return (
    <div className="success-page">
      <div className="success-icon">
        <i className="bi bi-check-circle-fill text-success"></i>
      </div>
      
      <h2 className="success-title">Appointment Confirmed!</h2>
      <p className="success-message">
        Your appointment has been scheduled successfully. We've sent a confirmation to your {notifications.email && 'email'} 
        {notifications.email && notifications.sms && ' and '} 
        {notifications.sms && 'phone'}.
      </p>
      
      <div className="appointment-summary card">
        <div className="card-body">
          <h5 className="card-title mb-4">Appointment Details</h5>
          
          <div className="row mb-4">
            <div className="col-md-6">
              <p className="mb-1"><strong>Patient:</strong> {patientInfo.fullName}</p>
              <p className="mb-1"><strong>Email:</strong> {patientInfo.email}</p>
              <p className="mb-1"><strong>Phone:</strong> {patientInfo.phone}</p>
            </div>
            <div className="col-md-6">
              <p className="mb-1"><strong>Doctor:</strong> {selectedDoctor.name}</p>
              <p className="mb-1"><strong>Specialty:</strong> {selectedDoctor.specialty}</p>
              <p className="mb-1"><strong>Appointment Type:</strong> {appointmentType}</p>
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-12">
              <div className="date-time-box p-3 bg-light rounded">
                <div className="row align-items-center">
                  <div className="col-auto text-center">
                    <i className="bi bi-calendar-event fs-3 text-primary"></i>
                  </div>
                  <div className="col">
                    <p className="mb-1 fs-5"><strong>{formatDate(selectedSlot.date)}</strong></p>
                    <p className="mb-0 text-primary fs-4"><strong>{selectedSlot.time}</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-12">
              <p><strong>Reason for Visit:</strong></p>
              <p className="mb-0 bg-light p-3 rounded">{appointmentReason}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="notification-summary card mt-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Notification Settings</h5>
          <p className="mb-2">
            <i className={`bi bi-${notifications.email ? 'check' : 'x'}-circle me-2 ${notifications.email ? 'text-success' : 'text-danger'}`}></i>
            Email notifications: <strong>{notifications.email ? 'Enabled' : 'Disabled'}</strong>
          </p>
          <p className="mb-0">
            <i className={`bi bi-${notifications.sms ? 'check' : 'x'}-circle me-2 ${notifications.sms ? 'text-success' : 'text-danger'}`}></i>
            SMS notifications: <strong>{notifications.sms ? 'Enabled' : 'Disabled'}</strong>
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <button 
          className="btn btn-outline-primary me-3"
          onClick={onModify}
        >
          <i className="bi bi-pencil me-1"></i> Modify Appointment
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleReturnDashboard}
        >
          <i className="bi bi-house me-1"></i> Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ReceiveNotification; 