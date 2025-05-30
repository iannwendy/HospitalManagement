import React, { useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '../../../utils/auth';
import { PatientInfo } from '../../../types/appointment';

interface VerifyInformationProps {
  patientInfo: PatientInfo;
  onUpdateData: (data: { patientInfo: PatientInfo }) => void;
  onNext: () => void;
}

const VerifyInformation: React.FC<VerifyInformationProps> = ({ 
  patientInfo,
  onUpdateData,
  onNext
}) => {
  const [formData, setFormData] = useState<PatientInfo>(patientInfo);
  const [errors, setErrors] = useState<Partial<PatientInfo>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  const [verifyMessage, setVerifyMessage] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Verify patient identity and set initial form data
  useEffect(() => {
    // Don't reinitialize if we've already done it
    if (initialized) return;

    // In a real app, this would check authentication and retrieve patient data
    const checkPatientAuth = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          setVerificationStatus('failed');
          setVerifyMessage('You must be logged in to book an appointment.');
          return;
        }

        // Get current user data
        const userData = getCurrentUser();
        console.log("User data from auth:", userData); // Debug log
        
        // Simulate retrieving patient medical record
        // (in a real app, this would be an API call to the server)
        setTimeout(() => {
          if (userData && userData.role === 'patient') {
            // Successfully verified patient
            setVerificationStatus('verified');
            setVerifyMessage('Your identity has been verified.');
            
            // If we got patient data from our records, use it to pre-populate the form
            const fullName = userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}`
              : userData.name || '';
              
            const initialData = {
              fullName: fullName,
              email: userData.email || '',
              phone: userData.phone || '',
              dateOfBirth: userData.dateOfBirth || '',
              address: userData.address || '',
              healthInsurance: userData.insurance || ''
            };
            
            setFormData(initialData);
            setInitialized(true);
            
            // Update parent component with this data
            onUpdateData({ patientInfo: initialData });
          } else {
            // Failed verification
            setVerificationStatus('failed');
            setVerifyMessage('Patient information could not be verified. Please contact support.');
          }
        }, 1000); // Simulate network delay
      } catch (error) {
        console.error("Error during verification:", error);
        setVerificationStatus('failed');
        setVerifyMessage('An error occurred during verification. Please try again later.');
      }
    };

    checkPatientAuth();
  }, []); // Remove patientInfo and onUpdateData from dependencies

  // Validate form on data change
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors: Partial<PatientInfo> = {};
    let valid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    }

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
      valid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      valid = false;
    }

    if (!formData.healthInsurance.trim()) {
      newErrors.healthInsurance = 'Health insurance information is required';
      valid = false;
    }

    setErrors(newErrors);
    setIsFormValid(valid);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onUpdateData({ patientInfo: formData });
      onNext();
    }
  };

  // Show loading state while verifying
  if (verificationStatus === 'pending') {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Verifying your information...</p>
      </div>
    );
  }

  // Show error state if verification failed
  if (verificationStatus === 'failed') {
    return (
      <div className="alert alert-danger p-4">
        <h4 className="alert-heading">Verification Failed</h4>
        <p>{verifyMessage}</p>
        <hr />
        <p className="mb-0">
          Please ensure you are logged in with a valid patient account. If you believe this is an error, 
          please contact our support team at support@hospital.com or call (555) 123-4567.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="form-step-title">Verify Your Information</h2>
      
      <div className="alert alert-success mb-4">
        <i className="bi bi-check-circle-fill me-2"></i>
        {verifyMessage}
      </div>
      
      <p className="mb-4">Please review and confirm your personal information below.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
            {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
            {errors.dateOfBirth && <div className="invalid-feedback">{errors.dateOfBirth}</div>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            className={`form-control ${errors.address ? 'is-invalid' : ''}`}
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
            placeholder="Enter your full address"
          ></textarea>
          {errors.address && <div className="invalid-feedback">{errors.address}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="healthInsurance">Health Insurance Information</label>
          <input
            type="text"
            className={`form-control ${errors.healthInsurance ? 'is-invalid' : ''}`}
            id="healthInsurance"
            name="healthInsurance"
            value={formData.healthInsurance}
            onChange={handleChange}
            placeholder="Enter your insurance provider and policy number"
          />
          {errors.healthInsurance && <div className="invalid-feedback">{errors.healthInsurance}</div>}
        </div>
        
        <div className="form-check mb-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="confirmInformation"
            required
          />
          <label className="form-check-label" htmlFor="confirmInformation">
            I confirm that the information provided above is accurate and up-to-date.
          </label>
        </div>
        
        <div className="button-group">
          <div></div> {/* Empty div to align the Continue button to the right */}
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!isFormValid}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerifyInformation; 