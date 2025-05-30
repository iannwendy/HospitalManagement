import React, { useState } from 'react';
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

interface ConsultRequest {
  specialistId: string;
  patientId: string;
  question: string;
  priority: 'routine' | 'urgent' | 'emergency';
  attachments?: string[];
  requestedBy: {
    id: string;
    name: string;
  };
}

interface ConsultSpecialistProps {
  patientRecord: PatientFullRecord;
  diagnosis: Partial<Diagnosis>;
  specialists: Specialist[];
  onConsult: (specialist: Specialist, question: string) => void;
  onCancel: () => void;
}

const ConsultSpecialist: React.FC<ConsultSpecialistProps> = ({
  patientRecord,
  diagnosis,
  specialists,
  onConsult,
  onCancel
}) => {
  const patient = patientRecord.patient;
  
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [consultQuestion, setConsultQuestion] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'emergency'>('routine');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [attachmentInput, setAttachmentInput] = useState('');

  // Pre-populate consultation question if we have a diagnosis
  React.useEffect(() => {
    if (diagnosis && diagnosis.primaryDiagnosis) {
      setConsultQuestion(`I am treating a patient with a tentative diagnosis of ${diagnosis.primaryDiagnosis} (ICD-10: ${diagnosis.icd10Code || 'pending'}). I would appreciate your expertise regarding this case.`);
    }
  }, [diagnosis]);

  // Get unique specialties for filtering
  const specialties = Array.from(
    new Set(['all', ...specialists.map(specialist => specialist.specialty)])
  );

  // Filter specialists by specialty
  const filteredSpecialists = specialists.filter(
    specialist => specialtyFilter === 'all' || specialist.specialty === specialtyFilter
  );

  // Handle specialist selection
  const handleSpecialistSelect = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSpecialist && consultQuestion.trim()) {
      onConsult(selectedSpecialist, consultQuestion);
    }
  };

  // Handle adding an attachment
  const handleAddAttachment = () => {
    if (attachmentInput.trim()) {
      setAttachments([...attachments, attachmentInput.trim()]);
      setAttachmentInput('');
      setShowAttachmentInput(false);
    }
  };

  // Handle removing an attachment
  const handleRemoveAttachment = (index: number) => {
    const updatedAttachments = [...attachments];
    updatedAttachments.splice(index, 1);
    setAttachments(updatedAttachments);
  };

  return (
    <div className="consult-specialist-container">
      <h2>Consult a Specialist for {patient.name}</h2>
      <p className="patient-info">
        {patient.age} years old, {patient.gender} (ID: {patient.id})
      </p>

      <div className="specialty-filter">
        <label htmlFor="specialty-select">Filter by Specialty:</label>
        <select
          id="specialty-select"
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="form-control"
        >
          {specialties.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty === 'all' ? 'All Specialties' : specialty}
            </option>
          ))}
        </select>
      </div>

      <div className="specialists-grid">
        {filteredSpecialists.map((specialist) => (
          <div
            key={specialist.id}
            className={`specialist-card ${selectedSpecialist?.id === specialist.id ? 'selected' : ''}`}
            onClick={() => handleSpecialistSelect(specialist)}
          >
            <div className="specialist-avatar">
              <img src={specialist.avatar} alt={`Dr. ${specialist.name}`} />
            </div>
            <div className="specialist-info">
              <h3>{specialist.name}</h3>
              <div className="specialist-details">
                <p className="specialist-specialty">{specialist.specialty}</p>
                <p className="specialist-department">{specialist.department}</p>
                <p className="specialist-availability">
                  <span className="availability-label">Available:</span> {specialist.availability}
                </p>
              </div>
            </div>
            <div className="selection-indicator">
              <input
                type="radio"
                name="specialist"
                checked={selectedSpecialist?.id === specialist.id}
                onChange={() => {}}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        ))}
      </div>

      {selectedSpecialist && (
        <form onSubmit={handleSubmit} className="consult-form">
          <h3>Consultation Request</h3>
          <p className="selected-specialist">
            Selected Specialist: <strong>{selectedSpecialist.name}</strong> ({selectedSpecialist.specialty})
          </p>

          <div className="form-group">
            <label htmlFor="consultation-question">Consultation Question:</label>
            <textarea
              id="consultation-question"
              value={consultQuestion}
              onChange={(e) => setConsultQuestion(e.target.value)}
              className="form-control"
              rows={4}
              placeholder="Describe your question or concern for the specialist..."
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="priority-select">Priority:</label>
            <select
              id="priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'routine' | 'urgent' | 'emergency')}
              className="form-control"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent (Within 24 hours)</option>
              <option value="emergency">Emergency (ASAP)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Attachments:</label>
            <div className="attachments-container">
              {attachments.length > 0 ? (
                <div className="attachments-list">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="attachment-item">
                      <span>{attachment}</span>
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-attachments">No attachments added</p>
              )}

              {showAttachmentInput ? (
                <div className="attachment-input-group">
                  <input
                    type="text"
                    value={attachmentInput}
                    onChange={(e) => setAttachmentInput(e.target.value)}
                    placeholder="Enter attachment name or path"
                    className="form-control"
                  />
                  <button
                    type="button"
                    className="add-button"
                    onClick={handleAddAttachment}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowAttachmentInput(false);
                      setAttachmentInput('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="add-attachment-button"
                  onClick={() => setShowAttachmentInput(true)}
                >
                  Add Attachment
                </button>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button type="button" className="secondary-button" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={!selectedSpecialist || !consultQuestion.trim()}
            >
              Send Consultation Request
            </button>
          </div>
        </form>
      )}

      {!selectedSpecialist && (
        <div className="no-specialist-selected">
          <p>Please select a specialist to continue with the consultation request.</p>
          <div className="action-buttons">
            <button type="button" className="secondary-button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultSpecialist;