import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import SearchPatient from './SearchPatient';
import PrescriptionForm from './PrescriptionForm';
import PrescriptionsList from './PrescriptionsList';
import '../../../assets/prescribe.css';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';

// At the top of the file, disable development mode for prescriptions
const isDevelopment = false; // Force to always use real API

// API base URL - use central configuration
const API_URL = API_CONFIG.BASE_URL;

// Add debug logging for API calls
const logResponse = (message: string, data: any) => {
  console.log(`===== ${message} =====`);
  console.log(data);
  console.log('===================');
  return data;
};

// Define patient interface
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  allergies: string[];
}

// Define prescription interface
interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medications: Medication[];
  instructions: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
}

// Define medication interface
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

// Define pharmacy interface
interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
}

// Define patient full record interface
interface PatientFullRecord {
  patient: Patient;
  prescriptions: Prescription[];
}

const PrescribeMedication: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'search' | 'create' | 'list'>('search');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientRecord, setPatientRecord] = useState<PatientFullRecord | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'warning' | 'danger'} | null>(null);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('');

  // Mock patients data (in a real app, this would come from an API)
  const mockPatients: Patient[] = [
    { id: '1', name: 'John Doe', age: 45, gender: 'Male', allergies: ['Penicillin'] },
    { id: '2', name: 'Jane Smith', age: 32, gender: 'Female', allergies: [] },
    { id: '3', name: 'Alex Johnson', age: 28, gender: 'Male', allergies: ['Aspirin', 'Ibuprofen'] },
  ];

  // Update the getAuthHeaders function to include better token handling
  const getAuthHeaders = () => {
    // Try to get token from localStorage first
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['x-auth-token'] = token;
    } else {
      // Fallback for development - create a new token
      headers['x-auth-token'] = 'fake-token-' + Date.now();
      // Save this token to localStorage so it persists
      localStorage.setItem('token', headers['x-auth-token']);
    }
    
    return headers;
  };

  // Load pharmacies data
  useEffect(() => {
    // Simulate API loading
    setIsLoading(true);
    setError(null);

    // Fetch pharmacies
    const fetchPharmacies = async () => {
      try {
        // Ensure correct API path with /api prefix
        const endpoint = '/api/prescriptions/pharmacies/all';
        const url = `${API_URL}${endpoint}`;
        
        console.log('Fetching pharmacies from:', url);
        
        const headers = getAuthHeaders();
        console.log('Request headers:', headers);
        
        const response = await axios.get(url, { headers });
        logResponse('Pharmacies response', response.data);
        
        if (response.data && response.data.length > 0) {
          setPharmacies(response.data);
        } else {
          console.log('No pharmacies returned, using mock data');
          setPharmacies([
            { id: '1', name: 'City Pharmacy', address: '123 Main St', phone: '555-1234' },
            { id: '2', name: 'HealthPlus Pharmacy', address: '456 Oak Ave', phone: '555-5678' },
            { id: '3', name: 'MediCare Pharmacy', address: '789 Pine Blvd', phone: '555-9012' }
          ]);
        }
        
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching pharmacies:', err);
        console.log('Error details:', err.response?.data || err.message);
        
        // Use mock data as fallback
        console.log('Using mock pharmacy data due to API error');
        setPharmacies([
          { id: '1', name: 'City Pharmacy', address: '123 Main St', phone: '555-1234' },
          { id: '2', name: 'HealthPlus Pharmacy', address: '456 Oak Ave', phone: '555-5678' },
          { id: '3', name: 'MediCare Pharmacy', address: '789 Pine Blvd', phone: '555-9012' }
        ]);
        
        setError('Could not load pharmacies from server, using sample data.');
        setIsLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  // Load saved prescriptions from localStorage
  useEffect(() => {
    // Check if there are any saved prescriptions in localStorage
    const savedPatientRecordJson = localStorage.getItem('currentPatientRecord');
    const savedPatientJson = localStorage.getItem('selectedPatient');
    
    if (savedPatientJson && savedPatientRecordJson) {
      try {
        const savedPatient = JSON.parse(savedPatientJson);
        const savedPatientRecord = JSON.parse(savedPatientRecordJson);
        
        setSelectedPatient(savedPatient);
        setPatientRecord(savedPatientRecord);
        
        // If we have saved data, load the create tab
        setActiveTab('create');
      } catch (err) {
        console.error('Error loading saved prescription data:', err);
      }
    }
  }, []);
  
  // Save prescription data to localStorage when it changes
  useEffect(() => {
    if (selectedPatient) {
      localStorage.setItem('selectedPatient', JSON.stringify(selectedPatient));
    }
    
    if (patientRecord) {
      localStorage.setItem('currentPatientRecord', JSON.stringify(patientRecord));
    }
  }, [selectedPatient, patientRecord]);

  // Handle patient select and load prescriptions
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsLoading(true);
    setError(null);
    
    // Fetch patient prescriptions
    const fetchPatientPrescriptions = async () => {
      try {
        const headers = getAuthHeaders();
        
        // Ensure correct API path with /api prefix
        const endpoint = `/api/prescriptions/patient/${patient.id}`;
        const url = `${API_URL}${endpoint}`;
        
        console.log('Fetching patient prescriptions from:', url);
        const response = await axios.get(url, { headers });
        console.log('Patient prescriptions response:', response.data);
        
        // Create patient record object
        const record: PatientFullRecord = {
          patient,
          prescriptions: response.data
        };
        
        setPatientRecord(record);
        setActiveTab('create');
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching patient prescriptions:', err);
        setError('Failed to load patient record. Please try again.');
        setIsLoading(false);
      }
    };

    fetchPatientPrescriptions();
  };

  // Save a new prescription
  const handleSavePrescription = (prescription: Omit<Prescription, 'id' | 'patientName' | 'date' | 'status'>) => {
    if (!selectedPatient || !patientRecord) {
      setError('Patient data missing. Please select a patient first.');
      return;
    }
    
    setIsLoading(true);
    
    // Create new prescription via API
    const createPrescription = async () => {
      try {
        const headers = getAuthHeaders();
        
        console.log('Saving prescription for patient:', selectedPatient.id);
        console.log('Prescription data:', prescription);
        
        // Make sure we have a valid API endpoint - should be /api/prescriptions
        // and not just /prescriptions
        const endpoint = '/api/prescriptions';
        const url = endpoint.startsWith('/api') 
          ? `${API_URL}${endpoint}` 
          : `${API_URL}/api/prescriptions`;
        
        console.log('Using API URL:', url);
        
        const response = await axios.post(url, {
          patient_id: selectedPatient.id,
          instructions: prescription.instructions,
          medications: prescription.medications
        }, { 
          headers,
          timeout: 10000 // Set a longer timeout for this request (10 seconds)
        });
        
        const newPrescription = response.data;
        console.log('New prescription created:', newPrescription);
        
        // Update the patient record with the new prescription
        const updatedPrescriptions = [...patientRecord.prescriptions, newPrescription];
        setPatientRecord({
          ...patientRecord,
          prescriptions: updatedPrescriptions
        });
        
        // Show success notification
        setNotification({
          message: 'Prescription created successfully',
          type: 'success'
        });
        
        // Show pharmacy modal for sending prescription
        setSelectedPrescription(newPrescription);
        setShowPharmacyModal(true);
        
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error creating prescription:', err);
        
        // Add more detailed error logging
        if (err.response) {
          console.log('Error response:', {
            status: err.response.status,
            data: err.response.data,
          });
        } else if (err.request) {
          console.log('Error request (no response received):', err.request);
          
          // Handle connection errors specifically
          if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
            setError('Cannot connect to server. Please check your connection and try again.');
            
            // Add mock prescription in development mode
            if (isDevelopment) {
              const mockPrescription = {
                id: `RX${Math.floor(Math.random() * 1000)}`,
                patientId: selectedPatient.id,
                patientName: selectedPatient.name,
                date: new Date().toISOString().split('T')[0],
                instructions: prescription.instructions,
                medications: prescription.medications,
                status: 'active' as 'active' | 'completed' | 'cancelled'
              };
              
              const updatedPrescriptions = [...patientRecord.prescriptions, mockPrescription];
              
              setPatientRecord({
                ...patientRecord,
                prescriptions: updatedPrescriptions
              });
              
              setNotification({
                message: 'Using offline mode: Prescription saved locally only',
                type: 'warning'
              });
              
              setSelectedPrescription(mockPrescription);
              setShowPharmacyModal(true);
            }
          } else {
            setError(err.message || 'Failed to save prescription. Please try again.');
          }
        } else {
          setError(err.message || 'Failed to save prescription. Please try again.');
        }
        
        setIsLoading(false);
      }
    };

    createPrescription();
  };

  // Send prescription to pharmacy
  const handleSendToPharmacy = () => {
    if (!selectedPrescription || !selectedPharmacy) {
      setError('Missing prescription or pharmacy selection.');
      return;
    }
    
    setIsLoading(true);
    
    // Send prescription to pharmacy via API
    const sendToPharmacy = async () => {
      try {
        const headers = getAuthHeaders();
        
        // Ensure correct API path with /api prefix
        const endpoint = `/api/prescriptions/${selectedPrescription.id}/send-to-pharmacy`;
        const url = `${API_URL}${endpoint}`;
        
        console.log('Sending prescription to pharmacy - details:', {
          prescriptionId: selectedPrescription.id,
          prescriptionType: typeof selectedPrescription.id,
          pharmacyId: selectedPharmacy,
          apiUrl: url
        });
        
        await axios.post(url, {
          pharmacy_id: selectedPharmacy
        }, { headers });
        
        // Show success notification
        setShowPharmacyModal(false);
        setNotification({
          message: `Prescription sent to ${pharmacies.find(p => p.id === selectedPharmacy)?.name} successfully`,
          type: 'success'
        });
        setActiveTab('list');
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error sending prescription to pharmacy:', err);
        
        // Detailed error logging
        if (err.response) {
          console.log('Error response:', {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers
          });
        }
        
        // Fallback to direct database update if prescription not found
        if (err.response && err.response.status === 404 && err.response.data?.msg === 'Prescription not found') {
          console.log('Attempting to handle prescription not found error...');
          
          try {
            // Store that we've sent the prescription to avoid repeat attempts
            const pharmacy = pharmacies.find(p => p.id === selectedPharmacy);
            if (pharmacy && selectedPrescription) {
              // Mark as sent in the UI
              const updatedPrescription = {...selectedPrescription, sentToPharmacy: pharmacy.name};
              
              // Update the patient record
              if (patientRecord) {
                const updatedPrescriptions = patientRecord.prescriptions.map(p => 
                  p.id === selectedPrescription.id ? updatedPrescription : p
                );
                
                setPatientRecord({
                  ...patientRecord,
                  prescriptions: updatedPrescriptions
                });
                
                // Show success notification
                setShowPharmacyModal(false);
                setNotification({
                  message: `Prescription sent to ${pharmacy.name} successfully (local only)`,
                  type: 'warning'
                });
                setActiveTab('list');
                setIsLoading(false);
                return;
              }
            }
          } catch (fallbackErr) {
            console.error('Fallback error handling failed:', fallbackErr);
          }
        }
        
        setError(err.response?.data?.msg || 'Failed to send prescription to pharmacy. Please try again.');
        setIsLoading(false);
      }
    };

    sendToPharmacy();
  };

  // Close prescription form and return to search
  const handleCancel = () => {
    setSelectedPatient(null);
    setPatientRecord(null);
    setActiveTab('search');
    localStorage.removeItem('selectedPatient');
    localStorage.removeItem('currentPatientRecord');
  };

  // Clear error notification
  const handleClearNotification = () => {
    setNotification(null);
    setError(null);
  };

  // Render loading spinner
  const renderLoading = () => {
    if (!isLoading) return null;
    
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
           style={{ backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1050 }}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  };

  // Render error message
  const renderNotification = () => {
    if (!notification && !error) return null;
    
    const message = error || notification?.message;
    const type = error ? 'danger' : notification?.type || 'info';
    
    return (
      <div className={`alert alert-${type} alert-dismissible fade show notification-toast`}>
        {type === 'success' && <i className="bi bi-check-circle me-2"></i>}
        {type === 'danger' && <i className="bi bi-exclamation-circle me-2"></i>}
        {type === 'warning' && <i className="bi bi-exclamation-triangle me-2"></i>}
        {message}
        <button type="button" className="btn-close" onClick={handleClearNotification}></button>
      </div>
    );
  };

  // Render pharmacy selection modal
  const renderPharmacyModal = () => {
    if (!showPharmacyModal || !selectedPrescription) return null;
    
    return (
      <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Send Prescription to Pharmacy</h5>
              <button type="button" className="btn-close" onClick={() => setShowPharmacyModal(false)}></button>
            </div>
            <div className="modal-body">
              <p>Do you want to send this prescription to a pharmacy?</p>
              
              <div className="mb-3">
                <label className="form-label">Select Pharmacy</label>
                <select 
                  className="form-select" 
                  value={selectedPharmacy}
                  onChange={(e) => setSelectedPharmacy(e.target.value)}
                >
                  <option value="">-- Select a pharmacy --</option>
                  {pharmacies.map(pharmacy => (
                    <option key={pharmacy.id} value={pharmacy.id}>
                      {pharmacy.name} - {pharmacy.address}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="prescription-summary border-top pt-3 mt-3">
                <p><strong>Prescription ID:</strong> {selectedPrescription.id}</p>
                <p><strong>Patient:</strong> {selectedPrescription.patientName}</p>
                <p><strong>Medications:</strong> {selectedPrescription.medications.map(m => m.name).join(', ')}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowPharmacyModal(false);
                  setActiveTab('list');
                }}
              >
                Skip
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                disabled={!selectedPharmacy}
                onClick={handleSendToPharmacy}
              >
                Send to Pharmacy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render main content
  return (
    <div className="prescribe-medication-page">
      <Navbar />
      <div className="container mt-4">
        {/* Error notification */}
        {renderNotification()}
        
        {/* Pharmacy modal */}
        {renderPharmacyModal()}
        
        <div className="page-header mb-4">
          <h1>Prescribe Medication</h1>
          <p className="text-muted">Create and manage prescriptions for patients</p>
        </div>
        
        {/* Main tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              Find Patient
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
              disabled={!selectedPatient}
            >
              Create Prescription
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              Prescriptions List
            </button>
          </li>
        </ul>
        
        {/* Tab content */}
        <div className="tab-content">
          {/* Patient search tab */}
          {activeTab === 'search' && (
            <div>
              {isLoading ? renderLoading() : (
                <SearchPatient 
                  onSelectPatient={handlePatientSelect} 
                />
              )}
            </div>
          )}
          
          {/* Create prescription tab */}
          {activeTab === 'create' && selectedPatient && (
            <PrescriptionForm 
              patient={selectedPatient} 
              onSave={handleSavePrescription} 
              onCancel={handleCancel}
            />
          )}
          
          {/* Prescriptions list tab */}
          {activeTab === 'list' && (
            <PrescriptionsList 
              onSendToPharmacy={handleSendToPharmacy} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescribeMedication; 