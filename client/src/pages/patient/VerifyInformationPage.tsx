import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import '../../assets/appointments.css';

// Interface for patient data
interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateOfBirth?: string; // YYYY-MM-DD
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  medicalConditions?: string[];
  allergies?: string[];
}

// Mock current patient data - in a real app, this would be fetched
const mockPatientData: PatientProfile = {
  id: 'patient123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '555-123-4567',
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '90210',
    country: 'USA',
  },
  dateOfBirth: '1985-07-20',
  emergencyContact: {
    name: 'Jane Doe',
    relationship: 'Spouse',
    phoneNumber: '555-987-6543',
  },
  medicalConditions: ['None Reported'],
  allergies: ['Pollen (Mild)'],
};

const VerifyInformationPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<PatientProfile>(mockPatientData);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/patient/login');
      return;
    }
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'patient') {
      logout();
      navigate('/patient/login');
      return;
    }
    setUser(currentUser);
    setProfile(prevProfile => ({
      ...prevProfile,
      email: currentUser.email,
      firstName: currentUser.name || prevProfile.firstName
    }));
  }, [navigate]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfile(prev => ({
      ...prev,
      address: { ...prev.address!, [name]: value },
    }));
  };

  const handleEmergencyContactChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfile(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact!, [name]: value },
    }));
  };

  const validateProfile = (): boolean => {
    if (!profile.firstName || !profile.lastName || !profile.email) {
      setMessage({ type: 'error', text: 'First name, last name, and email are required.' });
      return false;
    }
    if (profile.email && !/\S+@\S+\.\S+/.test(profile.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (!validateProfile()) {
      return;
    }

    console.log('Updating profile:', profile);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const isSuccess = Math.random() > 0.1;
    if (isSuccess) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
    } else {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again. (Simulated Error)' });
    }
  };

  if (!user) {
    return <div className="p-5 text-center">Loading user data...</div>;
  }

  return (
    <div className="booking-container">
      <Navbar isDashboard={false} />
      
      <div className="booking-header">
        <div className="container py-4">
          <h1>My Profile Information</h1>
          <p className="text-white-50">Review and update your personal information</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="booking-step-content">
          {message && (
            <div className={`alert alert-${message.type} alert-dismissible fade show mb-4`} role="alert">
              {message.text}
              <button type="button" className="btn-close" onClick={() => setMessage(null)} aria-label="Close"></button>
            </div>
          )}

          {!editMode ? (
            <div className="profile-view">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="info-section">
                    <h3 className="form-step-title">Personal Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Full Name</span>
                        <span className="info-value">{profile.firstName} {profile.lastName}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">{profile.email}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Phone</span>
                        <span className="info-value">{profile.phoneNumber || 'Not Provided'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Date of Birth</span>
                        <span className="info-value">{profile.dateOfBirth || 'Not Provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="info-section">
                    <h3 className="form-step-title">Address</h3>
                    <div className="info-grid">
                      {profile.address ? (
                        <>
                          <div className="info-item">
                            <span className="info-label">Street</span>
                            <span className="info-value">{profile.address.street}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">City</span>
                            <span className="info-value">{profile.address.city}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">State</span>
                            <span className="info-value">{profile.address.state}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">ZIP Code</span>
                            <span className="info-value">{profile.address.zipCode}</span>
                          </div>
                        </>
                      ) : (
                        <div className="info-item">
                          <span className="info-value text-muted">No address provided</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="info-section">
                    <h3 className="form-step-title">Emergency Contact</h3>
                    <div className="info-grid">
                      {profile.emergencyContact ? (
                        <>
                          <div className="info-item">
                            <span className="info-label">Name</span>
                            <span className="info-value">{profile.emergencyContact.name}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Relationship</span>
                            <span className="info-value">{profile.emergencyContact.relationship}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Phone</span>
                            <span className="info-value">{profile.emergencyContact.phoneNumber}</span>
                          </div>
                        </>
                      ) : (
                        <div className="info-item">
                          <span className="info-value text-muted">No emergency contact provided</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="info-section">
                    <h3 className="form-step-title">Medical Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Medical Conditions</span>
                        <span className="info-value">
                          {profile.medicalConditions?.join(', ') || 'None Reported'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Allergies</span>
                        <span className="info-value">
                          {profile.allergies?.join(', ') || 'None Reported'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="form-section">
                    <h3 className="form-step-title">Personal Information</h3>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="firstName"
                          name="firstName"
                          value={profile.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="lastName"
                          name="lastName"
                          value={profile.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={profile.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={profile.phoneNumber || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-12">
                        <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          value={profile.dateOfBirth || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-section">
                    <h3 className="form-step-title">Address</h3>
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="street" className="form-label">Street</label>
                        <input
                          type="text"
                          className="form-control"
                          id="street"
                          name="street"
                          value={profile.address?.street || ''}
                          onChange={handleAddressChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="city" className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control"
                          id="city"
                          name="city"
                          value={profile.address?.city || ''}
                          onChange={handleAddressChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="state" className="form-label">State</label>
                        <input
                          type="text"
                          className="form-control"
                          id="state"
                          name="state"
                          value={profile.address?.state || ''}
                          onChange={handleAddressChange}
                        />
                      </div>
                      <div className="col-md-2">
                        <label htmlFor="zipCode" className="form-label">ZIP</label>
                        <input
                          type="text"
                          className="form-control"
                          id="zipCode"
                          name="zipCode"
                          value={profile.address?.zipCode || ''}
                          onChange={handleAddressChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-section">
                    <h3 className="form-step-title">Emergency Contact</h3>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="emergencyContactName" className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="emergencyContactName"
                          name="name"
                          value={profile.emergencyContact?.name || ''}
                          onChange={handleEmergencyContactChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="emergencyContactRelationship" className="form-label">Relationship</label>
                        <input
                          type="text"
                          className="form-control"
                          id="emergencyContactRelationship"
                          name="relationship"
                          value={profile.emergencyContact?.relationship || ''}
                          onChange={handleEmergencyContactChange}
                        />
                      </div>
                      <div className="col-12">
                        <label htmlFor="emergencyContactPhoneNumber" className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="emergencyContactPhoneNumber"
                          name="phoneNumber"
                          value={profile.emergencyContact?.phoneNumber || ''}
                          onChange={handleEmergencyContactChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-section">
                    <h3 className="form-step-title">Medical Information</h3>
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="medicalConditions" className="form-label">Medical Conditions</label>
                        <textarea
                          className="form-control"
                          id="medicalConditions"
                          name="medicalConditions"
                          rows={3}
                          value={profile.medicalConditions?.join(', ') || ''}
                          onChange={(e) => setProfile(p => ({...p, medicalConditions: e.target.value.split(',').map(s => s.trim())}))}
                          placeholder="Enter medical conditions separated by commas"
                        ></textarea>
                      </div>
                      <div className="col-12">
                        <label htmlFor="allergies" className="form-label">Allergies</label>
                        <textarea
                          className="form-control"
                          id="allergies"
                          name="allergies"
                          rows={3}
                          value={profile.allergies?.join(', ') || ''}
                          onChange={(e) => setProfile(p => ({...p, allergies: e.target.value.split(',').map(s => s.trim())}))}
                          placeholder="Enter allergies separated by commas"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setEditMode(false);
                    setMessage(null);
                    setProfile(mockPatientData);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyInformationPage; 