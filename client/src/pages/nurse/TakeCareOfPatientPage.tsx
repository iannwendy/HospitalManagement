import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import '../../assets/appointments.css';

// Interfaces
interface Patient {
  id: string;
  name: string;
  roomNumber: string;
  admissionDate: string;
  diagnosis: string;
  carePlan: {
    medications: Medication[];
    vitalCheckSchedule: string;
    specialInstructions?: string;
  };
  vitals?: VitalSigns;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  scheduledTime: string;
  status: 'Scheduled' | 'Administered' | 'Missed' | 'Delayed';
  lastAdministered?: string;
}

interface VitalSigns {
  temperature: number;
  bloodPressure: string;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  recordedAt: string;
}

// Mock data
const mockPatients: Patient[] = [
  {
    id: 'P001',
    name: 'John Smith',
    roomNumber: '201A',
    admissionDate: '2024-03-10',
    diagnosis: 'Post-operative care',
    carePlan: {
      medications: [
        {
          id: 'M001',
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'Every 6 hours',
          route: 'Oral',
          scheduledTime: '08:00',
          status: 'Scheduled'
        },
        {
          id: 'M002',
          name: 'Amoxicillin',
          dosage: '250mg',
          frequency: 'Every 8 hours',
          route: 'Oral',
          scheduledTime: '10:00',
          status: 'Administered',
          lastAdministered: '2024-03-15 10:00'
        }
      ],
      vitalCheckSchedule: 'Every 4 hours',
      specialInstructions: 'Monitor wound site for signs of infection'
    },
    vitals: {
      temperature: 37.2,
      bloodPressure: '120/80',
      heartRate: 72,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      recordedAt: '2024-03-15 09:00'
    }
  },
  {
    id: 'P002',
    name: 'Mary Johnson',
    roomNumber: '202B',
    admissionDate: '2024-03-12',
    diagnosis: 'Pneumonia',
    carePlan: {
      medications: [
        {
          id: 'M003',
          name: 'Azithromycin',
          dosage: '500mg',
          frequency: 'Daily',
          route: 'Oral',
          scheduledTime: '09:00',
          status: 'Scheduled'
        }
      ],
      vitalCheckSchedule: 'Every 2 hours',
      specialInstructions: 'Oxygen therapy as needed'
    }
  }
];

const TakeCareOfPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const [nurseUser, setNurseUser] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [newVitals, setNewVitals] = useState<Partial<VitalSigns>>({
    temperature: 37,
    bloodPressure: '',
    heartRate: 70,
    respiratoryRate: 16,
    oxygenSaturation: 98
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/nurse/login');
      return;
    }
    const userData = getCurrentUser();
    if (!userData || userData.role !== 'nurse') {
      logout();
      navigate('/nurse/login');
      return;
    }
    setNurseUser(userData);
    setIsAuthenticatedState(true);
  }, [navigate]);

  const handleAdministerMedication = (patientId: string, medicationId: string) => {
    setPatients(prev => prev.map(patient => {
      if (patient.id === patientId) {
        return {
          ...patient,
          carePlan: {
            ...patient.carePlan,
            medications: patient.carePlan.medications.map(med => {
              if (med.id === medicationId) {
                return {
                  ...med,
                  status: 'Administered',
                  lastAdministered: new Date().toISOString()
                };
              }
              return med;
            })
          }
        };
      }
      return patient;
    }));
    setMessage({ type: 'success', text: 'Medication administered successfully' });
  };

  const handleRecordVitals = (patientId: string) => {
    if (!validateVitals(newVitals)) {
      setMessage({ type: 'error', text: 'Please enter valid vital signs' });
      return;
    }

    setPatients(prev => prev.map(patient => {
      if (patient.id === patientId) {
        return {
          ...patient,
          vitals: {
            ...newVitals,
            recordedAt: new Date().toISOString(),
          } as VitalSigns
        };
      }
      return patient;
    }));
    setShowVitalsForm(false);
    setMessage({ type: 'success', text: 'Vital signs recorded successfully' });
  };

  const handleNotifyDoctor = (patientId: string, reason: string) => {
    // In a real application, this would send a notification to the doctor
    console.log(`Notifying doctor about patient ${patientId}: ${reason}`);
    setMessage({ type: 'success', text: 'Doctor has been notified' });
  };

  const handleEscalateEmergency = (patientId: string) => {
    // In a real application, this would trigger emergency protocols
    console.log(`Emergency escalated for patient ${patientId}`);
    setMessage({ type: 'success', text: 'Emergency response team has been notified' });
  };

  const validateVitals = (vitals: Partial<VitalSigns>): boolean => {
    return !!(
      vitals.temperature &&
      vitals.temperature >= 35 && vitals.temperature <= 42 &&
      vitals.bloodPressure &&
      vitals.heartRate &&
      vitals.heartRate >= 40 && vitals.heartRate <= 200 &&
      vitals.respiratoryRate &&
      vitals.respiratoryRate >= 8 && vitals.respiratoryRate <= 40 &&
      vitals.oxygenSaturation &&
      vitals.oxygenSaturation >= 0 && vitals.oxygenSaturation <= 100
    );
  };

  if (!nurseUser || !isAuthenticatedState) {
    return <div className="p-5 text-center">Loading nurse data...</div>;
  }

  return (
    <div className="booking-container">
      <Navbar isDashboard={false} />
      
      <div className="booking-header">
        <div className="container py-4">
          <h1>Patient Care Management</h1>
          <p className="text-white-50">Monitor and manage patient care tasks</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="booking-step-content">
          {message && (
            <div className={`alert alert-${message.type} alert-dismissible fade show mb-4`}>
              {message.text}
              <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
            </div>
          )}

          <div className="row">
            <div className="col-lg-4">
              <div className="form-section mb-4">
                <h3 className="form-step-title">Patients</h3>
                <div className="patient-list">
                  {patients.map(patient => (
                    <div
                      key={patient.id}
                      className={`patient-item ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <h4>{patient.name}</h4>
                      <p className="text-muted mb-1">Room: {patient.roomNumber}</p>
                      <p className="text-muted mb-0">Admitted: {patient.admissionDate}</p>
                      <span className="diagnosis-badge">{patient.diagnosis}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              {selectedPatient ? (
                <div className="form-section">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h3 className="form-step-title">{selectedPatient.name}</h3>
                      <p className="text-muted">Room {selectedPatient.roomNumber}</p>
                    </div>
                    <div className="action-buttons">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => setShowVitalsForm(true)}
                      >
                        Record Vitals
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm me-2"
                        onClick={() => handleNotifyDoctor(selectedPatient.id, 'Routine check required')}
                      >
                        Notify Doctor
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleEscalateEmergency(selectedPatient.id)}
                      >
                        Escalate Emergency
                      </button>
                    </div>
                  </div>

                  {showVitalsForm ? (
                    <div className="vitals-form mb-4">
                      <h4 className="mb-3">Record Vital Signs</h4>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Temperature (°C)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={newVitals.temperature}
                            onChange={e => setNewVitals(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                            step="0.1"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Blood Pressure</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newVitals.bloodPressure}
                            onChange={e => setNewVitals(prev => ({ ...prev, bloodPressure: e.target.value }))}
                            placeholder="120/80"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Heart Rate (bpm)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={newVitals.heartRate}
                            onChange={e => setNewVitals(prev => ({ ...prev, heartRate: parseInt(e.target.value) }))}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Respiratory Rate</label>
                          <input
                            type="number"
                            className="form-control"
                            value={newVitals.respiratoryRate}
                            onChange={e => setNewVitals(prev => ({ ...prev, respiratoryRate: parseInt(e.target.value) }))}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">O2 Saturation (%)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={newVitals.oxygenSaturation}
                            onChange={e => setNewVitals(prev => ({ ...prev, oxygenSaturation: parseInt(e.target.value) }))}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          className="btn btn-primary me-2"
                          onClick={() => handleRecordVitals(selectedPatient.id)}
                        >
                          Save Vitals
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => setShowVitalsForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : selectedPatient.vitals ? (
                    <div className="vitals-display mb-4">
                      <h4 className="mb-3">Latest Vital Signs</h4>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <div className="vital-card">
                            <h6>Temperature</h6>
                            <p className="mb-0">{selectedPatient.vitals.temperature}°C</p>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <div className="vital-card">
                            <h6>Blood Pressure</h6>
                            <p className="mb-0">{selectedPatient.vitals.bloodPressure}</p>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <div className="vital-card">
                            <h6>Heart Rate</h6>
                            <p className="mb-0">{selectedPatient.vitals.heartRate} bpm</p>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <div className="vital-card">
                            <h6>Respiratory Rate</h6>
                            <p className="mb-0">{selectedPatient.vitals.respiratoryRate} /min</p>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <div className="vital-card">
                            <h6>O2 Saturation</h6>
                            <p className="mb-0">{selectedPatient.vitals.oxygenSaturation}%</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted">
                        Recorded at: {new Date(selectedPatient.vitals.recordedAt).toLocaleString()}
                      </p>
                    </div>
                  ) : null}

                  <div className="medications-section">
                    <h4 className="mb-3">Medications</h4>
                    <div className="medication-list">
                      {selectedPatient.carePlan.medications.map(medication => (
                        <div key={medication.id} className={`medication-item ${medication.status.toLowerCase()}`}>
                          <div className="medication-info">
                            <h5>{medication.name}</h5>
                            <p className="mb-1">
                              {medication.dosage} - {medication.route} - {medication.frequency}
                            </p>
                            <p className="text-muted mb-0">
                              Scheduled: {medication.scheduledTime}
                              {medication.lastAdministered && ` | Last given: ${new Date(medication.lastAdministered).toLocaleString()}`}
                            </p>
                          </div>
                          <div className="medication-status">
                            <span className={`status-badge status-${medication.status.toLowerCase()}`}>
                              {medication.status}
                            </span>
                            {medication.status === 'Scheduled' && (
                              <button
                                className="btn btn-primary btn-sm ms-2"
                                onClick={() => handleAdministerMedication(selectedPatient.id, medication.id)}
                              >
                                Administer
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedPatient.carePlan.specialInstructions && (
                    <div className="special-instructions mt-4">
                      <h4 className="mb-3">Special Instructions</h4>
                      <div className="alert alert-info">
                        {selectedPatient.carePlan.specialInstructions}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="form-section">
                  <div className="text-center p-5">
                    <h3 className="text-muted">Select a patient to view details</h3>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .patient-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .patient-item {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
        }

        .patient-item:hover {
          border-color: #3a7ca5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .patient-item.selected {
          border-color: #3a7ca5;
          background-color: rgba(58, 124, 165, 0.05);
        }

        .patient-item h4 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }

        .diagnosis-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          background-color: #e9ecef;
          color: #495057;
          margin-top: 0.5rem;
        }

        .vital-card {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          text-align: center;
        }

        .vital-card h6 {
          font-size: 0.875rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .vital-card p {
          font-size: 1.25rem;
          font-weight: 600;
          color: #3a7ca5;
        }

        .medication-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .medication-item {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .medication-item.administered {
          border-left: 4px solid #28a745;
        }

        .medication-item.scheduled {
          border-left: 4px solid #ffc107;
        }

        .medication-item.missed {
          border-left: 4px solid #dc3545;
        }

        .medication-item.delayed {
          border-left: 4px solid #fd7e14;
        }

        .medication-info h5 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-administered {
          background-color: #d4edda;
          color: #155724;
        }

        .status-scheduled {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-missed {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status-delayed {
          background-color: #fff3cd;
          color: #856404;
        }

        @media (max-width: 768px) {
          .medication-item {
            flex-direction: column;
            gap: 1rem;
          }

          .medication-status {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            align-items: stretch;
          }

          .medication-status .btn {
            width: 100%;
          }

          .action-buttons {
            flex-direction: column;
            gap: 0.5rem;
            width: 100%;
          }

          .action-buttons button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TakeCareOfPatientPage; 