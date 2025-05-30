import React from 'react';
import '../../../assets/diagnose.css';

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

interface PatientFullRecord {
  patient: Patient;
  vitalSigns: VitalSigns;
  medicalHistory: MedicalHistory[];
  testResults: TestResult[];
  medications: Medication[];
}

interface PatientRecordProps {
  patientRecord: PatientFullRecord;
  onProceed: () => void;
  onOrderTests: () => void;
  orderedTests: Test[];
}

const PatientRecord: React.FC<PatientRecordProps> = ({ patientRecord, onProceed, onOrderTests, orderedTests }) => {
  const { patient, vitalSigns, medicalHistory, testResults, medications } = patientRecord;
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="patient-record">
      <div className="record-header">
        <h2>Patient Record: {patient.name}</h2>
        <span className="patient-id">ID: {patient.id}</span>
      </div>

      <div className="record-section">
        <h3>Patient Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Age:</span>
            <span className="info-value">{patient.age}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Gender:</span>
            <span className="info-value">{patient.gender}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Date of Birth:</span>
            <span className="info-value">{formatDate(patient.dob)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Blood Type:</span>
            <span className="info-value">{patient.bloodType}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Allergies:</span>
            <span className="info-value">
              {patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None reported'}
            </span>
          </div>
        </div>
      </div>

      <div className="record-section">
        <h3>Vital Signs</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Blood Pressure:</span>
            <span className="info-value">{vitalSigns.bloodPressure} mmHg</span>
          </div>
          <div className="info-item">
            <span className="info-label">Heart Rate:</span>
            <span className="info-value">{vitalSigns.heartRate} bpm</span>
          </div>
          <div className="info-item">
            <span className="info-label">Respiratory Rate:</span>
            <span className="info-value">{vitalSigns.respiratoryRate} breaths/min</span>
          </div>
          <div className="info-item">
            <span className="info-label">Temperature:</span>
            <span className="info-value">{vitalSigns.temperature} °F</span>
          </div>
          <div className="info-item">
            <span className="info-label">Oxygen Saturation:</span>
            <span className="info-value">{vitalSigns.oxygenSaturation}%</span>
          </div>
          <div className="info-item">
            <span className="info-label">Height:</span>
            <span className="info-value">{vitalSigns.height} cm</span>
          </div>
          <div className="info-item">
            <span className="info-label">Weight:</span>
            <span className="info-value">{vitalSigns.weight} kg</span>
          </div>
          <div className="info-item">
            <span className="info-label">BMI:</span>
            <span className="info-value">{vitalSigns.bmi}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Recorded:</span>
            <span className="info-value">{new Date(vitalSigns.recordedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="record-section">
        <h3>Medical History</h3>
        {medicalHistory.length > 0 ? (
          <table className="record-table">
            <thead>
              <tr>
                <th>Condition</th>
                <th>Diagnosed</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {medicalHistory.map((history, index) => (
                <tr key={index}>
                  <td>{history.condition}</td>
                  <td>{formatDate(history.diagnosedDate)}</td>
                  <td>
                    <span className={`status-badge status-${history.status.toLowerCase()}`}>
                      {history.status}
                    </span>
                  </td>
                  <td>{history.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No medical history recorded.</p>
        )}
      </div>

      <div className="record-section">
        <h3>Recent Test Results</h3>
        {testResults.length > 0 ? (
          <table className="record-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Date</th>
                <th>Result</th>
                <th>Reference Range</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((test) => (
                <tr key={test.id} className={test.isAbnormal ? 'abnormal-result' : ''}>
                  <td>{test.name}</td>
                  <td>{formatDate(test.date)}</td>
                  <td>
                    {test.result} {test.unit}
                    {test.isAbnormal && <span className="abnormal-flag">!</span>}
                  </td>
                  <td>{test.referenceRange}</td>
                  <td>{test.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No test results available.</p>
        )}
      </div>

      <div className="record-section">
        <h3>Current Medications</h3>
        {medications.length > 0 ? (
          <table className="record-table">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {medications.map((medication, index) => (
                <tr key={index}>
                  <td>{medication.name}</td>
                  <td>{medication.dosage}</td>
                  <td>{medication.frequency}</td>
                  <td>{formatDate(medication.startDate)}</td>
                  <td>{medication.endDate ? formatDate(medication.endDate) : 'Ongoing'}</td>
                  <td>
                    <span className={`status-badge status-${medication.isActive ? 'active' : 'resolved'}`}>
                      {medication.isActive ? 'Active' : 'Discontinued'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No current medications.</p>
        )}
      </div>

      <div className="action-buttons">
        <button 
          type="button" 
          className="secondary-button" 
          onClick={onOrderTests}
        >
          Order Additional Tests
        </button>
        <button className="primary-button" onClick={onProceed}>
          Proceed to Diagnosis
        </button>
      </div>
    </div>
  );
};

export default PatientRecord; 