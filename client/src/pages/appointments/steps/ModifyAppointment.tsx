import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppointmentData } from '../../../types/appointment';

interface ModifyAppointmentProps {
  appointmentData: AppointmentData;
  onUpdateData: (data: Partial<AppointmentData>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ModifyAppointment: React.FC<ModifyAppointmentProps> = ({
  appointmentData,
  onUpdateData,
  onSave,
  onCancel
}) => {
  const navigate = useNavigate();
  const [reason, setReason] = useState(appointmentData.appointmentReason);
  const [appointmentType, setAppointmentType] = useState(appointmentData.appointmentType);
  const [notifyEmail, setNotifyEmail] = useState(appointmentData.notifications.email);
  const [notifySMS, setNotifySMS] = useState(appointmentData.notifications.sms);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Format date for display
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not selected';
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const handleSave = () => {
    onUpdateData({
      appointmentReason: reason,
      appointmentType: appointmentType,
      notifications: {
        email: notifyEmail,
        sms: notifySMS
      }
    });
    
    onSave();
  };
  
  const handleCancelAppointment = () => {
    // In a real app, this would make an API call to cancel the appointment
    navigate('/patient/dashboard', { 
      state: { 
        message: 'Your appointment has been cancelled successfully',
        type: 'info'
      } 
    });
  };
  
  // Check if we have basic appointment data
  if (!appointmentData.selectedDoctor) {
    return (
      <div className="alert alert-warning">
        <h4 className="alert-heading">Incomplete Appointment</h4>
        <p>You don't have a complete appointment to modify.</p>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/appointments/book')}
        >
          Book New Appointment
        </button>
      </div>
    );
  }
  
  return (
    <div className="modify-page">
      <h2 className="form-step-title">Modify Your Appointment</h2>
      <p className="mb-4">You can modify the details of your appointment below.</p>
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Current Appointment Details</h5>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <p className="mb-1">
                <strong>Doctor:</strong> {appointmentData.selectedDoctor?.name || 'Not selected'}
              </p>
              <p className="mb-1">
                <strong>Specialty:</strong> {appointmentData.selectedDoctor?.specialty || 'Not selected'}
              </p>
            </div>
            <div className="col-md-6">
              <p className="mb-1">
                <strong>Date:</strong> {appointmentData.selectedSlot?.date ? 
                  formatDate(appointmentData.selectedSlot.date) : 'Not selected'}
              </p>
              <p className="mb-1">
                <strong>Time:</strong> {appointmentData.selectedSlot?.time || 'Not selected'}
              </p>
            </div>
          </div>
          
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            To change your doctor or appointment time, please cancel this appointment and book a new one.
          </div>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Modify Appointment Details</h5>
          
          <div className="form-group mb-3">
            <label htmlFor="appointmentType" className="form-label">Appointment Type</label>
            <select
              id="appointmentType"
              className="form-select"
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
            >
              <option value="New Patient">New Patient</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Consultation">Consultation</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          
          <div className="form-group mb-3">
            <label htmlFor="reason" className="form-label">Reason for Visit</label>
            <textarea
              id="reason"
              className="form-control"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
          </div>
          
          <h5 className="mt-4 mb-3">Notification Preferences</h5>
          
          <div className="form-check mb-2">
            <input
              type="checkbox"
              className="form-check-input"
              id="emailNotify"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="emailNotify">
              Email Notifications
            </label>
          </div>
          
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="smsNotify"
              checked={notifySMS}
              onChange={(e) => setNotifySMS(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="smsNotify">
              SMS Notifications
            </label>
          </div>
        </div>
      </div>
      
      {showCancelConfirm ? (
        <div className="card mb-4 border-danger">
          <div className="card-body">
            <h5 className="card-title text-danger mb-3">Cancel Appointment</h5>
            <p>Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => setShowCancelConfirm(false)}
              >
                No, Keep Appointment
              </button>
              <button
                className="btn btn-danger"
                onClick={handleCancelAppointment}
              >
                Yes, Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-end mb-4">
          <button
            className="btn btn-outline-danger"
            onClick={() => setShowCancelConfirm(true)}
          >
            <i className="bi bi-x-circle me-1"></i>
            Cancel Appointment
          </button>
        </div>
      )}
      
      <div className="button-group">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
        >
          Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ModifyAppointment; 