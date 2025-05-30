import React, { useState, useEffect } from 'react';
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

interface PatientFullRecord {
  patient: Patient;
  vitalSigns: VitalSigns;
  medicalHistory: MedicalHistory[];
  testResults: TestResult[];
  medications: Medication[];
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

interface DiagnosisFormProps {
  patientRecord: PatientFullRecord;
  diagnosis: Partial<Diagnosis>;
  onSave: (diagnosis: Partial<Diagnosis>) => void;
  onOrderTests: () => void;
  onConsultSpecialist: () => void;
  orderedTests: Test[];
  consultedSpecialists: Specialist[];
}

const DiagnosisForm: React.FC<DiagnosisFormProps> = ({ 
  patientRecord, 
  diagnosis,
  onSave, 
  onOrderTests,
  onConsultSpecialist,
  orderedTests,
  consultedSpecialists
}) => {
  const patient = patientRecord.patient;
  
  // Mock ICD-10 codes (in a real app this would come from a database or API)
  const icd10Options = [
    { code: 'J00', description: 'Acute nasopharyngitis [common cold]' },
    { code: 'J02.9', description: 'Acute pharyngitis, unspecified' },
    { code: 'J03.90', description: 'Acute tonsillitis, unspecified' },
    { code: 'J11.1', description: 'Influenza with other respiratory manifestations' },
    { code: 'J18.9', description: 'Pneumonia, unspecified' },
    { code: 'J45.909', description: 'Unspecified asthma, uncomplicated' },
    { code: 'I10', description: 'Essential (primary) hypertension' },
    { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
    { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis' },
    { code: 'M54.5', description: 'Low back pain' },
    { code: 'R51', description: 'Headache' },
  ];

  // Form state
  const [form, setForm] = useState<Partial<Diagnosis>>({
    patientId: patient.id,
    patientName: patient.name,
    primaryDiagnosis: '',
    secondaryDiagnoses: [''],
    icd10Code: '',
    notes: '',
    recommendedTreatment: '',
    followUp: '',
    date: new Date().toISOString().split('T')[0],
    doctorId: 'D001', // In a real app this would be the logged-in doctor's ID
    doctorName: 'Dr. William Smith', // In a real app this would be the logged-in doctor's name
    status: 'Draft',
  });

  // Filter ICD-10 codes based on search
  const [icd10Search, setIcd10Search] = useState('');
  const [filteredIcd10Options, setFilteredIcd10Options] = useState(icd10Options);

  // Initialize form with existing diagnosis if provided
  useEffect(() => {
    if (diagnosis) {
      setForm(prevForm => ({
        ...prevForm,
        ...diagnosis
      }));
    }
  }, [diagnosis]);

  // Filter ICD-10 codes when search changes
  useEffect(() => {
    const filtered = icd10Options.filter(option => 
      option.code.toLowerCase().includes(icd10Search.toLowerCase()) || 
      option.description.toLowerCase().includes(icd10Search.toLowerCase())
    );
    setFilteredIcd10Options(filtered);
  }, [icd10Search]);

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  // Handle secondary diagnoses
  const handleSecondaryDiagnosisChange = (index: number, value: string) => {
    const updatedSecondaryDiagnoses = [...(form.secondaryDiagnoses || [''])];
    updatedSecondaryDiagnoses[index] = value;
    setForm(prevForm => ({
      ...prevForm,
      secondaryDiagnoses: updatedSecondaryDiagnoses
    }));
  };

  const addSecondaryDiagnosis = () => {
    setForm(prevForm => ({
      ...prevForm,
      secondaryDiagnoses: [...(prevForm.secondaryDiagnoses || ['']), '']
    }));
  };

  const removeSecondaryDiagnosis = (index: number) => {
    const updatedSecondaryDiagnoses = [...(form.secondaryDiagnoses || [''])];
    updatedSecondaryDiagnoses.splice(index, 1);
    setForm(prevForm => ({
      ...prevForm,
      secondaryDiagnoses: updatedSecondaryDiagnoses
    }));
  };

  // Handle ICD-10 code selection
  const handleIcd10Select = (code: string, description: string) => {
    setForm(prevForm => ({
      ...prevForm,
      icd10Code: code,
      primaryDiagnosis: description
    }));
    setIcd10Search('');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty secondary diagnoses
    const filteredSecondaryDiagnoses = form.secondaryDiagnoses?.filter(diag => diag.trim() !== '') || [];
    
    onSave({
      ...form,
      secondaryDiagnoses: filteredSecondaryDiagnoses,
      date: form.date || new Date().toISOString().split('T')[0]
    });
  };

  // Function to handle cancellation
  const handleCancel = () => {
    // Navigate back to dashboard or previous screen
    window.history.back();
  };

  return (
    <div className="diagnosis-form-container">
      <h2>Diagnosis for {patient.name}</h2>
      <p className="patient-info">
        {patient.age} years old, {patient.gender} (ID: {patient.id})
      </p>

      {/* Ordered Tests Summary */}
      {orderedTests.length > 0 && (
        <div className="ordered-tests-summary mb-4">
          <h3>Ordered Tests ({orderedTests.length})</h3>
          <div className="ordered-tests-list">
            {orderedTests.map((test) => (
              <div key={test.id} className="ordered-test-item">
                <span>{test.name} - {test.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consulted Specialists Summary */}
      {consultedSpecialists.length > 0 && (
        <div className="consulted-specialists-summary mb-4">
          <h3>Consulted Specialists ({consultedSpecialists.length})</h3>
          <div className="consulted-specialists-list">
            {consultedSpecialists.map((specialist) => (
              <div key={specialist.id} className="consulted-specialist-item">
                <span>{specialist.name} - {specialist.specialty}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="diagnosis-form">
        <div className="form-section">
          <h3>Primary Diagnosis</h3>
          
          <div className="form-group">
            <label htmlFor="icd10Search">Search ICD-10 Code:</label>
            <input
              type="text"
              id="icd10Search"
              value={icd10Search}
              onChange={(e) => setIcd10Search(e.target.value)}
              placeholder="Search by code or description..."
              className="form-control"
            />
            
            {icd10Search.length > 0 && (
              <div className="icd10-dropdown">
                {filteredIcd10Options.length > 0 ? (
                  filteredIcd10Options.map((option) => (
                    <div 
                      key={option.code} 
                      className="icd10-option"
                      onClick={() => handleIcd10Select(option.code, option.description)}
                    >
                      <strong>{option.code}</strong>: {option.description}
                    </div>
                  ))
                ) : (
                  <div className="icd10-no-results">No matching codes found</div>
                )}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="icd10Code">ICD-10 Code:</label>
            <input
              type="text"
              id="icd10Code"
              name="icd10Code"
              value={form.icd10Code}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="primaryDiagnosis">Diagnosis Description:</label>
            <input
              type="text"
              id="primaryDiagnosis"
              name="primaryDiagnosis"
              value={form.primaryDiagnosis}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Secondary Diagnoses</h3>
          {form.secondaryDiagnoses?.map((diagnosis, index) => (
            <div key={index} className="secondary-diagnosis-row">
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => handleSecondaryDiagnosisChange(index, e.target.value)}
                placeholder="Enter secondary diagnosis"
                className="form-control"
              />
              <button 
                type="button" 
                className="remove-button"
                onClick={() => removeSecondaryDiagnosis(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button 
            type="button" 
            className="add-button"
            onClick={addSecondaryDiagnosis}
          >
            Add Secondary Diagnosis
          </button>
        </div>

        <div className="form-section">
          <h3>Treatment and Follow-up</h3>
          
          <div className="form-group">
            <label htmlFor="recommendedTreatment">Recommended Treatment:</label>
            <textarea
              id="recommendedTreatment"
              name="recommendedTreatment"
              value={form.recommendedTreatment}
              onChange={handleInputChange}
              className="form-control"
              rows={4}
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="followUp">Follow-up Plan:</label>
            <textarea
              id="followUp"
              name="followUp"
              value={form.followUp}
              onChange={handleInputChange}
              className="form-control"
              rows={2}
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Additional Notes:</label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleInputChange}
              className="form-control"
              rows={3}
            ></textarea>
          </div>
        </div>

        <div className="form-section">
          <h3>Finalize</h3>
          
          <div className="form-group">
            <label htmlFor="date">Diagnosis Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={form.date}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="Draft">Draft</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Updated">Updated</option>
            </select>
          </div>
        </div>

        <div className="additional-actions">
          <button 
            type="button" 
            className="secondary-button"
            onClick={onOrderTests}
          >
            Order Additional Tests
          </button>
          <button 
            type="button" 
            className="secondary-button"
            onClick={onConsultSpecialist}
          >
            Consult Specialist
          </button>
        </div>

        <div className="action-buttons">
          <button type="button" className="secondary-button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="primary-button">
            Save Diagnosis
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiagnosisForm; 