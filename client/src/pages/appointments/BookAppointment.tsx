import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import VerifyInformation from './steps/VerifyInformation';
import SelectDoctor from './steps/SelectDoctor';
import ViewAvailableSlots from './steps/ViewAvailableSlots';
import ReceiveNotification from './steps/ReceiveNotification';
import ModifyAppointment from './steps/ModifyAppointment';
import { AppointmentData } from '../../types/appointment';
import { getCurrentUser, isAuthenticated } from '../../utils/auth';
import '../../assets/appointments.css';

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showModifyView, setShowModifyView] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  // Complete appointment data structure based on use case
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    patientInfo: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      healthInsurance: ''
    },
    selectedDoctor: null,
    selectedSlot: null,
    appointmentType: '',
    appointmentReason: '',
    notifications: {
      email: true,
      sms: false
    }
  });

  // Check if the patient is authenticated and retrieve their info
  useEffect(() => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        navigate('/patient/login');
        return;
      }
      
      // Get current user data
      const userData = getCurrentUser();
      console.log("BookAppointment - User data from auth:", userData);
      
      if (userData && userData.role === 'patient') {
        // Successfully verified patient - prefill the form data
        const fullName = userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}`
          : userData.name || '';
          
        const updatedPatientInfo = {
          fullName: fullName,
          email: userData.email || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth || '',
          address: userData.address || '',
          healthInsurance: userData.insurance || ''
        };
        
        console.log("Setting initial patient info:", updatedPatientInfo);
        
        // Update appointment data with user info
        setAppointmentData(prevData => ({
          ...prevData,
          patientInfo: updatedPatientInfo
        }));
      } else {
        setBookingError('Patient not found. Please register or log in first.');
      }
    } catch (error) {
      console.error("Error retrieving patient data:", error);
      setBookingError('Failed to verify patient information. Please try again.');
    }
  }, [navigate]);

  // Total number of steps in the main flow
  const totalSteps = 3;

  // Handle data updates from child components
  const updateAppointmentData = (data: Partial<AppointmentData>) => {
    setAppointmentData(prevData => ({
      ...prevData,
      ...data
    }));
  };

  // Move to next step
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - submit appointment
      submitAppointment();
    }
  };

  // Go back to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit the appointment
  const submitAppointment = () => {
    try {
      // Here we would normally send the data to the server
      console.log("Submitting appointment:", appointmentData);
      
      // Simulate success - in a real app, this would be a server response
      const success = Math.random() > 0.1; // 90% success rate for demo
      
      if (success) {
        // Show notification view (extension point)
        setShowSuccessNotification(true);
      } else {
        // Show error for booking failure
        setBookingError('Failed to save appointment. The system is currently unavailable. Please try again.');
      }
    } catch (error) {
      setBookingError('An unexpected error occurred. Please try again.');
    }
  };

  // Handle appointment modification request
  const handleModifyRequest = () => {
    setShowSuccessNotification(false);
    setShowModifyView(true);
  };

  // Save modified appointment
  const saveModifiedAppointment = () => {
    // Here we would normally update the appointment on the server
    console.log("Saving modified appointment:", appointmentData);
    
    // Return to notification view
    setShowModifyView(false);
    setShowSuccessNotification(true);
  };

  // Cancel modify and return to notification view
  const cancelModification = () => {
    setShowModifyView(false);
    setShowSuccessNotification(true);
  };

  // Go to dashboard
  const returnToDashboard = () => {
    navigate('/patient/dashboard');
  };

  // Check for errors and show error view if needed
  if (bookingError) {
    return (
      <div className="booking-container">
        <Navbar />
        <div className="booking-header">
          <div className="container py-4">
            <h1>Book an Appointment</h1>
          </div>
        </div>
        <div className="container py-5">
          <div className="alert alert-danger">
            <h4 className="alert-heading">Error</h4>
            <p>{bookingError}</p>
            <hr />
            <div className="d-flex justify-content-end">
              <button 
                className="btn btn-outline-secondary me-2"
                onClick={() => setBookingError(null)}
              >
                Try Again
              </button>
              <button 
                className="btn btn-primary"
                onClick={returnToDashboard}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render notification view (extended use case)
  if (showSuccessNotification) {
    return (
      <div className="booking-container">
        <Navbar />
        <div className="booking-header">
          <div className="container py-4">
            <h1>Appointment Confirmation</h1>
          </div>
        </div>
        <div className="container py-5">
          <ReceiveNotification
            patientInfo={appointmentData.patientInfo}
            selectedDoctor={appointmentData.selectedDoctor}
            selectedSlot={appointmentData.selectedSlot}
            appointmentType={appointmentData.appointmentType}
            appointmentReason={appointmentData.appointmentReason}
            notifications={appointmentData.notifications}
            onModify={handleModifyRequest}
          />
        </div>
      </div>
    );
  }

  // Render modify view (extended use case)
  if (showModifyView) {
    return (
      <div className="booking-container">
        <Navbar />
        <div className="booking-header">
          <div className="container py-4">
            <h1>Modify Appointment</h1>
          </div>
        </div>
        <div className="container py-5">
          <ModifyAppointment
            appointmentData={appointmentData}
            onUpdateData={updateAppointmentData}
            onSave={saveModifiedAppointment}
            onCancel={cancelModification}
          />
        </div>
      </div>
    );
  }

  // Render the current step in the main flow
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        // Verify Information (included use case)
        return (
          <VerifyInformation 
            patientInfo={appointmentData.patientInfo}
            onUpdateData={updateAppointmentData}
            onNext={goToNextStep}
          />
        );
      case 2:
        // Select Doctor (included use case)
        return (
          <SelectDoctor 
            selectedDoctor={appointmentData.selectedDoctor}
            onUpdateData={updateAppointmentData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 3:
        // View Available Slots (included use case)
        return (
          <ViewAvailableSlots 
            selectedDoctor={appointmentData.selectedDoctor}
            selectedSlot={appointmentData.selectedSlot}
            onUpdateData={updateAppointmentData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="booking-container">
      <Navbar />
      
      <div className="booking-header">
        <div className="container py-4">
          <h1>Book an Appointment</h1>
          <p className="text-white">Complete the steps below to book your appointment</p>
        </div>
      </div>
      
      <div className="container py-5">
        {/* Progress indicator */}
        <div className="booking-progress mb-5">
          <div className="progress-steps">
            {[1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
              >
                <div className="step-number">{step}</div>
                <div className="step-title">
                  {step === 1 && 'Verify Information'}
                  {step === 2 && 'Select Doctor'}
                  {step === 3 && 'Choose Time Slot'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Current step content */}
        <div className="booking-step-content">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment; 