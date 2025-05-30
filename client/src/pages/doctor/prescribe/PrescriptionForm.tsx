import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  allergies: string[];
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  patientId: string;
  medications: Medication[];
  instructions: string;
}

interface PrescriptionFormProps {
  patient: Patient;
  onSave: (prescription: Prescription) => void;
  onCancel: () => void;
}

// Define drug interaction interface
interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

// Define drug allergy warning interface
interface DrugAllergyWarning {
  drug: string;
  allergy: string;
  description: string;
}

// Mock database of drug interactions (in a real app, this would come from an API)
const DRUG_INTERACTIONS: DrugInteraction[] = [
  { 
    drug1: 'Lisinopril', 
    drug2: 'Potassium supplements', 
    severity: 'severe', 
    description: 'May cause dangerously high potassium levels in the blood'
  },
  { 
    drug1: 'Amoxicillin', 
    drug2: 'Atorvastatin', 
    severity: 'mild', 
    description: 'May slightly reduce the effectiveness of Atorvastatin'
  },
  { 
    drug1: 'Metformin', 
    drug2: 'Prednisone', 
    severity: 'moderate', 
    description: 'May reduce the glucose-lowering effect of Metformin'
  },
  { 
    drug1: 'Lisinopril', 
    drug2: 'Ibuprofen', 
    severity: 'moderate', 
    description: 'May reduce the blood pressure-lowering effect of Lisinopril'
  },
];

// Mock database of drug allergy warnings
const DRUG_ALLERGY_WARNINGS: DrugAllergyWarning[] = [
  {
    drug: 'Amoxicillin',
    allergy: 'Penicillin',
    description: 'Patients with Penicillin allergies may have cross-reactivity with Amoxicillin'
  },
  {
    drug: 'Aspirin',
    allergy: 'Aspirin',
    description: 'Direct allergy contraindication'
  },
  {
    drug: 'Ibuprofen',
    allergy: 'Ibuprofen',
    description: 'Direct allergy contraindication'
  },
];

// Define dosage range interface
interface DosageRange {
  drug: string;
  minDosage: number;
  maxDosage: number;
  unit: string;
}

// Mock database of dosage ranges
const DOSAGE_RANGES: DosageRange[] = [
  { drug: 'Lisinopril', minDosage: 5, maxDosage: 40, unit: 'mg' },
  { drug: 'Amoxicillin', minDosage: 250, maxDosage: 1000, unit: 'mg' },
  { drug: 'Atorvastatin', minDosage: 10, maxDosage: 80, unit: 'mg' },
  { drug: 'Metformin', minDosage: 500, maxDosage: 2500, unit: 'mg' },
  { drug: 'Prednisone', minDosage: 1, maxDosage: 60, unit: 'mg' },
];

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  patient,
  onSave,
  onCancel
}) => {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: `med-${Date.now()}`,
      name: '',
      dosage: '',
      frequency: '',
      duration: ''
    }
  ]);
  const [instructions, setInstructions] = useState('');
  const [warnings, setWarnings] = useState<{
    interactions: DrugInteraction[],
    allergies: DrugAllergyWarning[],
    dosage: string[]
  }>({
    interactions: [],
    allergies: [],
    dosage: []
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [commonMedications, setCommonMedications] = useState<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch drug interactions and common medications from API
  useEffect(() => {
    setIsLoading(true);
    
    // Using mock data for now, in a real app these would be API calls
    // These could be moved to actual API endpoints in the future
    
    // Common medications
    const commonMeds = [
      { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: '30 days' },
      { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', duration: '30 days' },
      { name: 'Prednisone', dosage: '5mg', frequency: 'Once daily', duration: '5 days' }
    ];
    
    setCommonMedications(commonMeds);
    setIsLoading(false);
  }, []);
  
  // Add a new medication to the prescription
  const handleAddMedication = () => {
    setMedications([
      ...medications,
      {
        id: `med-${Date.now()}`,
        name: '',
        dosage: '',
        frequency: '',
        duration: ''
      }
    ]);
  };
  
  // Remove a medication from the prescription
  const handleRemoveMedication = (id: string) => {
    if (medications.length <= 1) return;
    setMedications(medications.filter(med => med.id !== id));
  };
  
  // Update a medication field
  const handleMedicationChange = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med => {
      if (med.id === id) {
        return { ...med, [field]: value };
      }
      return med;
    }));
  };
  
  // Prefill medication fields with a common medication
  const handleSelectCommonMedication = (index: number, commonMed: typeof commonMedications[0]) => {
    setMedications(medications.map((med, i) => {
      if (i === index) {
        return {
          ...med,
          name: commonMed.name,
          dosage: commonMed.dosage,
          frequency: commonMed.frequency,
          duration: commonMed.duration
        };
      }
      return med;
    }));
  };

  // Validate medications whenever they change
  useEffect(() => {
    validatePrescription();
  }, [medications, instructions]);

  // Validate the prescription for completeness
  const validatePrescription = () => {
    // Check if all medications have required fields
    const allMedicationsValid = medications.every(med => 
      med.name.trim() !== '' && 
      med.dosage.trim() !== '' && 
      med.frequency.trim() !== '' && 
      med.duration.trim() !== ''
    );
    
    // Basic validation: ensure at least one medication and all required fields
    setIsFormValid(medications.length > 0 && allMedicationsValid);
    
    // In a real application, also check for drug interactions here
    checkDrugInteractions();
  };
  
  // Check for drug interactions, allergies, etc.
  const checkDrugInteractions = async () => {
    // For demo purposes, we'll simulate some warnings based on patient allergies
    // In a real app, this would be an API call to a drug interaction service
    
    const newWarnings = {
      interactions: [] as DrugInteraction[],
      allergies: [] as DrugAllergyWarning[],
      dosage: [] as string[]
    };
    
    // Check for allergy warnings
    for (const medication of medications) {
      if (!medication.name) continue;
      
      // Check if patient has allergies to this medication
      for (const allergy of patient.allergies) {
        if (medication.name.toLowerCase().includes(allergy.toLowerCase())) {
          newWarnings.allergies.push({
            drug: medication.name,
            allergy: allergy,
            description: `Patient has an allergy to ${allergy}, which may cross-react with ${medication.name}`
          });
        }
      }
    }
    
    // Check for drug interactions between medications
    if (medications.length > 1) {
      for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
          const med1 = medications[i].name;
          const med2 = medications[j].name;
          
          if (!med1 || !med2) continue;
          
          // Example interaction - in a real app, this would be checked against a database
          if ((med1.toLowerCase().includes('lisinopril') && med2.toLowerCase().includes('ibuprofen')) ||
              (med2.toLowerCase().includes('lisinopril') && med1.toLowerCase().includes('ibuprofen'))) {
            newWarnings.interactions.push({
              drug1: med1,
              drug2: med2,
              severity: 'moderate',
              description: 'NSAIDs like Ibuprofen may reduce the blood pressure-lowering effect of Lisinopril'
            });
          }
        }
      }
    }
    
    setWarnings(newWarnings);
  };

  // Submit the prescription
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      return;
    }
    
    // Create prescription object
    const prescription: Prescription = {
      patientId: patient.id,
      medications: medications,
      instructions: instructions
    };
    
    // Call the onSave function passed from parent
    onSave(prescription);
  };
  
  // Get severity class for warning badges
  const getSeverityClass = (severity: DrugInteraction['severity']) => {
    switch (severity) {
      case 'mild': return 'bg-warning text-dark';
      case 'moderate': return 'bg-warning';
      case 'severe': return 'bg-danger';
      default: return 'bg-warning';
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="prescription-form-container">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Create Prescription</h5>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <div className="patient-info mb-4">
            <div className="d-flex align-items-center">
              <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                {patient.name.charAt(0)}
              </div>
              <div>
                <h5 className="mb-1">{patient.name}</h5>
                <p className="text-muted small mb-0">
                  ID: {patient.id} | {patient.age} years | {patient.gender}
                </p>
                {patient.allergies.length > 0 && (
                  <div className="mt-1">
                    <span className="text-danger small">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Allergies: {patient.allergies.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="medications-container">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Medications</h5>
                <button 
                  type="button" 
                  className="btn btn-sm btn-primary"
                  onClick={handleAddMedication}
                >
                  <i className="bi bi-plus-circle me-1"></i>Add Medication
                </button>
              </div>
              
              {warnings.interactions.length > 0 && (
                <div className="alert alert-warning mb-3">
                  <h6 className="mb-2"><i className="bi bi-exclamation-triangle me-2"></i>Potential Drug Interactions</h6>
                  <ul className="mb-0 ps-3">
                    {warnings.interactions.map((interaction, index) => (
                      <li key={index}>
                        <span className={`badge ${getSeverityClass(interaction.severity)} me-2`}>
                          {interaction.severity.toUpperCase()}
                        </span>
                        <strong>{interaction.drug1}</strong> + <strong>{interaction.drug2}</strong>: {interaction.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {warnings.allergies.length > 0 && (
                <div className="alert alert-danger mb-3">
                  <h6 className="mb-2"><i className="bi bi-exclamation-triangle me-2"></i>Allergy Warnings</h6>
                  <ul className="mb-0 ps-3">
                    {warnings.allergies.map((warning, index) => (
                      <li key={index}>
                        <strong>{warning.drug}</strong>: {warning.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {medications.map((medication, index) => (
                <div key={medication.id} className="medication-item card mb-3">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Medication #{index + 1}</h6>
                    {medications.length > 1 && (
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveMedication(medication.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Medication Name</label>
                        <div className="input-group">
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Enter medication name" 
                            value={medication.name}
                            onChange={(e) => handleMedicationChange(medication.id, 'name', e.target.value)}
                            required
                          />
                          <button 
                            className="btn btn-outline-secondary dropdown-toggle" 
                            type="button" 
                            data-bs-toggle="dropdown"
                          >
                            Common
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            {commonMedications.map((commonMed, i) => (
                              <li key={i}>
                                <button 
                                  className="dropdown-item" 
                                  type="button"
                                  onClick={() => handleSelectCommonMedication(index, commonMed)}
                                >
                                  {commonMed.name} ({commonMed.dosage})
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Dosage</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. 500mg" 
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(medication.id, 'dosage', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Frequency</label>
                        <select 
                          className="form-select"
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(medication.id, 'frequency', e.target.value)}
                          required
                        >
                          <option value="">Select frequency</option>
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Four times daily">Four times daily</option>
                          <option value="Every 4 hours">Every 4 hours</option>
                          <option value="Every 6 hours">Every 6 hours</option>
                          <option value="Every 8 hours">Every 8 hours</option>
                          <option value="Every 12 hours">Every 12 hours</option>
                          <option value="As needed">As needed</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Duration</label>
                        <select 
                          className="form-select"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(medication.id, 'duration', e.target.value)}
                          required
                        >
                          <option value="">Select duration</option>
                          <option value="3 days">3 days</option>
                          <option value="5 days">5 days</option>
                          <option value="7 days">7 days</option>
                          <option value="10 days">10 days</option>
                          <option value="14 days">14 days</option>
                          <option value="30 days">30 days</option>
                          <option value="60 days">60 days</option>
                          <option value="90 days">90 days</option>
                          <option value="Until finished">Until finished</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mb-4">
              <label className="form-label">Special Instructions</label>
              <textarea 
                className="form-control" 
                rows={3}
                placeholder="Enter any special instructions for taking the medications..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              ></textarea>
            </div>
            
            <div className="d-flex justify-content-end">
              <button 
                type="button" 
                className="btn btn-outline-secondary me-2"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!isFormValid}
              >
                Save Prescription
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm; 