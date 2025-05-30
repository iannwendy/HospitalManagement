import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import PatientSearch from './PatientSearch';
import PatientRecord from './PatientRecord';
import DiagnosisForm from './DiagnosisForm';
import AdditionalTests from './AdditionalTests';
import ConsultSpecialist from './ConsultSpecialist';
import '../../../assets/diagnose.css';

// Define interfaces
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  bloodType: string;
  allergies: string[];
}

interface VitalSigns {
  bloodPressure: string;
  heartRate: number;
  respiratoryRate: number;
  temperature: number;
  oxygenSaturation: number;
  height: number;
  weight: number;
  bmi: number;
  recordedAt: string;
}

interface MedicalHistory {
  condition: string;
  diagnosedDate: string;
  status: 'Active' | 'Resolved' | 'Chronic';
  notes: string;
}

interface TestResult {
  id: string;
  name: string;
  category: string;
  date: string;
  result: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  notes: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

interface Diagnosis {
  id: string;
  patientId: string;
  patientName: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  icd10Code: string;
  notes: string;
  recommendedTreatment: string;
  followUp: string;
  date: string;
  doctorId: string;
  doctorName: string;
  status: 'Draft' | 'Confirmed' | 'Updated';
}

interface Test {
  id: string;
  name: string;
  category: string;
  description: string;
  preparationNeeded: boolean;
  preparationInstructions?: string;
  estimatedTime: string;
  commonlyUsedFor: string[];
}

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  department: string;
  availability: string;
  avatar: string;
}

interface PatientFullRecord {
  patient: Patient;
  vitalSigns: VitalSigns;
  medicalHistory: MedicalHistory[];
  testResults: TestResult[];
  medications: Medication[];
  diagnoses: Diagnosis[];
}

// Main component
const DiagnoseDisease: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'search' | 'record' | 'diagnose' | 'tests' | 'consult'>('search');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientRecord, setPatientRecord] = useState<PatientFullRecord | null>(null);
  const [diagnosis, setDiagnosis] = useState<Partial<Diagnosis> | null>(null);
  const [orderedTests, setOrderedTests] = useState<Test[]>([]);
  const [consultedSpecialists, setConsultedSpecialists] = useState<Specialist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'warning' | 'danger'} | null>(null);

  // Mock patients data (in a real app, this would come from an API)
  const mockPatients: Patient[] = [
    { 
      id: 'P001', 
      name: 'John Doe', 
      age: 45, 
      gender: 'Male', 
      dob: '1978-05-12',
      bloodType: 'A+',
      allergies: ['Penicillin'] 
    },
    { 
      id: 'P002', 
      name: 'Jane Smith', 
      age: 32, 
      gender: 'Female', 
      dob: '1991-08-23',
      bloodType: 'O-',
      allergies: [] 
    },
    { 
      id: 'P003', 
      name: 'Alex Johnson', 
      age: 28, 
      gender: 'Male', 
      dob: '1995-02-15',
      bloodType: 'B+',
      allergies: ['Aspirin', 'Ibuprofen'] 
    },
  ];

  // Mock test data
  const mockTests: Test[] = [
    {
      id: 'T001',
      name: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      description: 'Measures various components of the blood including red and white blood cells, platelets, and hemoglobin.',
      preparationNeeded: false,
      estimatedTime: '1 day',
      commonlyUsedFor: ['Anemia', 'Infection', 'Blood disorders']
    },
    {
      id: 'T002',
      name: 'Comprehensive Metabolic Panel (CMP)',
      category: 'Chemistry',
      description: 'Measures kidney function, liver function, electrolyte and fluid balance, and blood sugar levels.',
      preparationNeeded: true,
      preparationInstructions: 'Fast for 8-12 hours before the test.',
      estimatedTime: '1 day',
      commonlyUsedFor: ['Kidney disease', 'Liver disease', 'Diabetes']
    },
    {
      id: 'T003',
      name: 'Chest X-ray',
      category: 'Radiology',
      description: 'Imaging test that creates pictures of the structures inside your chest.',
      preparationNeeded: false,
      estimatedTime: 'Same day',
      commonlyUsedFor: ['Pneumonia', 'Heart failure', 'Lung cancer']
    },
    {
      id: 'T004',
      name: 'Electrocardiogram (ECG)',
      category: 'Cardiology',
      description: 'Records the electrical activity of the heart.',
      preparationNeeded: false,
      estimatedTime: 'Same day',
      commonlyUsedFor: ['Heart attack', 'Arrhythmia', 'Heart disease']
    }
  ];

  // Mock specialists data
  const mockSpecialists: Specialist[] = [
    {
      id: 'S001',
      name: 'Dr. Sarah Chen',
      specialty: 'Cardiology',
      department: 'Heart Center',
      availability: 'Mon, Wed, Fri',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 'S002',
      name: 'Dr. Michael Rodriguez',
      specialty: 'Neurology',
      department: 'Neuroscience Center',
      availability: 'Tue, Thu',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'S003',
      name: 'Dr. Emily Johnson',
      specialty: 'Pulmonology',
      department: 'Respiratory Medicine',
      availability: 'Mon, Tue, Thu',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
    }
  ];

  // Select a patient and load their record
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsLoading(true);
    setError(null);

    // In a real app, this would be an API call to get the patient's record
    setTimeout(() => {
      try {
        // Simulate fetching patient record
        // This would be an API call in a real application
        const mockVitalSigns: VitalSigns = {
          bloodPressure: '120/80',
          heartRate: 72,
          respiratoryRate: 16,
          temperature: 98.6,
          oxygenSaturation: 98,
          height: 175,
          weight: 70,
          bmi: 22.9,
          recordedAt: new Date().toISOString()
        };

        const mockMedicalHistory: MedicalHistory[] = [
          {
            condition: 'Hypertension',
            diagnosedDate: '2020-03-15',
            status: 'Active',
            notes: 'Controlled with medication'
          },
          {
            condition: 'Appendicitis',
            diagnosedDate: '2015-07-22',
            status: 'Resolved',
            notes: 'Appendectomy performed on 2015-07-23'
          }
        ];

        const mockTestResults: TestResult[] = [
          {
            id: 'TR001',
            name: 'Hemoglobin',
            category: 'Hematology',
            date: '2023-09-28',
            result: '14.5',
            unit: 'g/dL',
            referenceRange: '13.5-17.5',
            isAbnormal: false,
            notes: ''
          },
          {
            id: 'TR002',
            name: 'White Blood Cell Count',
            category: 'Hematology',
            date: '2023-09-28',
            result: '11.5',
            unit: 'K/uL',
            referenceRange: '4.5-11.0',
            isAbnormal: true,
            notes: 'Slightly elevated, may indicate infection'
          },
          {
            id: 'TR003',
            name: 'Blood Glucose (Fasting)',
            category: 'Chemistry',
            date: '2023-09-28',
            result: '95',
            unit: 'mg/dL',
            referenceRange: '70-100',
            isAbnormal: false,
            notes: ''
          }
        ];

        const mockMedications: Medication[] = [
          {
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            startDate: '2020-03-20',
            isActive: true
          },
          {
            name: 'Aspirin',
            dosage: '81mg',
            frequency: 'Once daily',
            startDate: '2020-03-20',
            isActive: true
          }
        ];

        // Initialize with empty diagnoses array
        const mockDiagnoses: Diagnosis[] = [];

        // Set the patient record
        const patientRecord: PatientFullRecord = {
          patient,
          vitalSigns: mockVitalSigns,
          medicalHistory: mockMedicalHistory,
          testResults: mockTestResults,
          medications: mockMedications,
          diagnoses: mockDiagnoses
        };

        setPatientRecord(patientRecord);
        
        // Initialize a new diagnosis
        setDiagnosis({
          patientId: patient.id,
          patientName: patient.name,
          primaryDiagnosis: '',
          secondaryDiagnoses: [],
          icd10Code: '',
          notes: '',
          recommendedTreatment: '',
          followUp: '',
          doctorId: 'D001', // In a real app, this would be the logged-in doctor's ID
          doctorName: 'Dr. User', // In a real app, this would be the logged-in doctor's name
          status: 'Draft'
        });

        setActiveTab('record');
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load patient record. Please try again.');
        setIsLoading(false);
      }
    }, 1000);
  };

  // Save diagnosis
  const handleSaveDiagnosis = (diagnosisData: Partial<Diagnosis>) => {
    setIsLoading(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      try {
        // Update diagnosis with the new data
        const updatedDiagnosis: Diagnosis = {
          ...diagnosisData,
          id: `DG${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          date: new Date().toISOString().split('T')[0],
          status: 'Confirmed',
          patientId: selectedPatient?.id || '',
          patientName: selectedPatient?.name || '',
          doctorId: 'D001',
          doctorName: 'Dr. User',
          secondaryDiagnoses: diagnosisData.secondaryDiagnoses || [],
        } as Diagnosis;

        setDiagnosis(updatedDiagnosis);
        
        // Update the patient record with the new diagnosis
        if (patientRecord) {
          // Create a new array with existing diagnoses plus the new one
          const updatedDiagnoses = patientRecord.diagnoses ? 
            [...patientRecord.diagnoses, updatedDiagnosis] : 
            [updatedDiagnosis];
          
          // Update the patient record
          setPatientRecord({
            ...patientRecord,
            diagnoses: updatedDiagnoses
          });
        }
        
        // Show success notification
        setNotification({
          message: 'Diagnosis saved successfully',
          type: 'success'
        });
        
        setIsLoading(false);
        
        // Instead of immediately navigating away, let's stay on the page 
        // and let the user see their saved diagnosis
        setTimeout(() => {
          // Show a new notification that diagnosis is saved and can be viewed
          setNotification({
            message: 'Diagnosis has been saved to patient record',
            type: 'success'
          });
          
          // Navigate to patient record to show the saved diagnosis
          setActiveTab('record');
        }, 2000);
      } catch (err) {
        setError('Failed to save diagnosis. Please try again.');
        setIsLoading(false);
      }
    }, 1000);
  };

  // Order additional tests
  const handleOrderTests = (tests: Test[]) => {
    setIsLoading(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      try {
        setOrderedTests([...orderedTests, ...tests]);
        
        setNotification({
          message: `${tests.length} test(s) ordered successfully`,
          type: 'success'
        });
        
        setIsLoading(false);
        setActiveTab('diagnose');
      } catch (err) {
        setError('Failed to order tests. Please try again.');
        setIsLoading(false);
      }
    }, 800);
  };

  // Consult a specialist
  const handleConsultSpecialist = (specialist: Specialist, question: string) => {
    setIsLoading(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      try {
        // Add to consulted specialists
        if (!consultedSpecialists.some(s => s.id === specialist.id)) {
          setConsultedSpecialists([...consultedSpecialists, specialist]);
        }
        
        setNotification({
          message: `Consultation request sent to ${specialist.name}`,
          type: 'success'
        });
        
        setIsLoading(false);
        setActiveTab('diagnose');
      } catch (err) {
        setError('Failed to send consultation request. Please try again.');
        setIsLoading(false);
      }
    }, 800);
  };

  // Cancel and return to dashboard
  const handleCancel = () => {
    navigate('/doctor/dashboard');
  };

  // Clear notification
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

  // Render notification
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

  return (
    <div className="diagnose-container">
      {renderLoading()}
      {renderNotification()}
      
      <Navbar isDashboard={true} />
      
      <div className="diagnose-header">
        <div className="container py-4">
          <h1 className="text-white">Diagnose A Disease</h1>
          <p className="text-white-50">Evaluate symptoms and test results to diagnose patient conditions</p>
        </div>
      </div>
      
      <div className="container py-4">
        <div className="diagnose-tabs">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'search' ? 'active' : ''}`} 
                onClick={() => setActiveTab('search')}
              >
                <i className="bi bi-search me-2"></i>Find Patient
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'record' ? 'active' : ''}`}
                disabled={!selectedPatient}
                onClick={() => selectedPatient && setActiveTab('record')}
              >
                <i className="bi bi-file-earmark-medical me-2"></i>Patient Record
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'diagnose' ? 'active' : ''}`}
                disabled={!patientRecord}
                onClick={() => patientRecord && setActiveTab('diagnose')}
              >
                <i className="bi bi-clipboard2-pulse me-2"></i>Diagnose
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'tests' ? 'active' : ''}`}
                disabled={!patientRecord}
                onClick={() => patientRecord && setActiveTab('tests')}
              >
                <i className="bi bi-activity me-2"></i>Order Tests
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'consult' ? 'active' : ''}`}
                disabled={!patientRecord}
                onClick={() => patientRecord && setActiveTab('consult')}
              >
                <i className="bi bi-people me-2"></i>Consult Specialist
              </button>
            </li>
          </ul>
        </div>
        
        <div className="tab-content mt-4">
          {activeTab === 'search' && (
            <PatientSearch 
              onSelectPatient={handlePatientSelect}
            />
          )}
          
          {activeTab === 'record' && patientRecord && (
            <PatientRecord 
              patientRecord={patientRecord}
              onProceed={() => setActiveTab('diagnose')}
              onOrderTests={() => setActiveTab('tests')}
              orderedTests={orderedTests}
            />
          )}
          
          {activeTab === 'diagnose' && patientRecord && diagnosis && (
            <DiagnosisForm
              patientRecord={patientRecord}
              diagnosis={diagnosis}
              onSave={handleSaveDiagnosis}
              onOrderTests={() => setActiveTab('tests')}
              onConsultSpecialist={() => setActiveTab('consult')}
              orderedTests={orderedTests}
              consultedSpecialists={consultedSpecialists}
            />
          )}
          
          {activeTab === 'tests' && patientRecord && (
            <AdditionalTests
              patientRecord={patientRecord}
              availableTests={mockTests}
              alreadyOrderedTests={orderedTests}
              onOrderTests={handleOrderTests}
              onCancel={() => setActiveTab('diagnose')}
            />
          )}
          
          {activeTab === 'consult' && patientRecord && diagnosis && (
            <ConsultSpecialist
              patientRecord={patientRecord}
              diagnosis={diagnosis}
              specialists={mockSpecialists}
              onConsult={handleConsultSpecialist}
              onCancel={() => setActiveTab('diagnose')}
            />
          )}
        </div>
      </div>
      
      <div className="container mt-4 mb-4">
        <button 
          className="btn btn-outline-primary"
          onClick={handleCancel}
        >
          <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default DiagnoseDisease; 