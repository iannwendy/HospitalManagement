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

interface AdditionalTestsProps {
  patientRecord: PatientFullRecord;
  availableTests: Test[];
  onOrderTests: (tests: Test[]) => void;
  onCancel: () => void;
  alreadyOrderedTests: Test[];
}

const AdditionalTests: React.FC<AdditionalTestsProps> = ({
  patientRecord,
  availableTests,
  onOrderTests,
  onCancel,
  alreadyOrderedTests = [],
}) => {
  const patient = patientRecord.patient;
  
  // State for selected tests
  const [selectedTests, setSelectedTests] = useState<Test[]>(alreadyOrderedTests);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [notes, setNotes] = useState<string>('');

  // Get unique categories for filter
  const categories = Array.from(new Set(['all', ...availableTests.map(test => test.category)]));

  // Filter tests based on category and search query
  const filteredTests = availableTests.filter(test => {
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Check if a test is selected
  const isTestSelected = (testId: string) => {
    return selectedTests.some(test => test.id === testId);
  };

  // Toggle test selection
  const toggleTestSelection = (test: Test) => {
    if (isTestSelected(test.id)) {
      setSelectedTests(selectedTests.filter(t => t.id !== test.id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  // Submit test order
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // We'd normally include priority and notes in the actual submission
    // For now we'll just pass the selected tests
    onOrderTests(selectedTests);
  };

  return (
    <div className="additional-tests-container">
      <h2>Order Additional Tests for {patient.name}</h2>
      <p className="patient-info">
        {patient.age} years old, {patient.gender} (ID: {patient.id})
      </p>

      <div className="tests-filter-section">
        <div className="filter-row">
          <div className="category-filter">
            <label htmlFor="category-select">Filter by Category:</label>
            <select 
              id="category-select" 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-control"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          <div className="search-filter">
            <label htmlFor="test-search">Search Tests:</label>
            <input
              type="text"
              id="test-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or description..."
              className="form-control"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="tests-order-form">
        <div className="tests-list">
          {filteredTests.length > 0 ? (
            filteredTests.map((test) => (
              <div 
                key={test.id} 
                className={`test-card ${isTestSelected(test.id) ? 'selected' : ''}`}
                onClick={() => toggleTestSelection(test)}
              >
                <div className="test-header">
                  <h3>{test.name}</h3>
                  <span className="test-category">{test.category}</span>
                </div>
                <p className="test-description">{test.description}</p>
                <div className="test-details">
                  <div className="test-detail">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{test.estimatedTime}</span>
                  </div>
                  {test.preparationNeeded && (
                    <div className="test-detail">
                      <span className="detail-label">Prep:</span>
                      <span className="detail-value preparation-badge">Required</span>
                    </div>
                  )}
                </div>
                <div className="test-common-uses">
                  <span className="detail-label">Common Uses:</span>
                  <div className="common-uses-tags">
                    {test.commonlyUsedFor.map((use, index) => (
                      <span key={index} className="use-tag">{use}</span>
                    ))}
                  </div>
                </div>
                {test.preparationNeeded && test.preparationInstructions && (
                  <div className="preparation-instructions">
                    <strong>Preparation Instructions:</strong> {test.preparationInstructions}
                  </div>
                )}
                <div className="test-selection-indicator">
                  <input 
                    type="checkbox" 
                    checked={isTestSelected(test.id)} 
                    onChange={() => {}} // Handled by the parent div's onClick
                    onClick={(e) => e.stopPropagation()} // Prevent double toggling
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="no-tests-message">
              No tests match your search criteria. Try adjusting your filters.
            </div>
          )}
        </div>

        {selectedTests.length > 0 && (
          <div className="selected-tests-summary">
            <h3>Selected Tests ({selectedTests.length})</h3>
            <div className="selected-tests-list">
              {selectedTests.map((test) => (
                <div key={test.id} className="selected-test-item">
                  <span>{test.name}</span>
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => toggleTestSelection(test)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="order-details-section">
          <div className="form-group">
            <label htmlFor="priority-select">Priority:</label>
            <select
              id="priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'routine' | 'urgent' | 'stat')}
              className="form-control"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT (Immediate)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="order-notes">Notes for Laboratory/Radiology:</label>
            <textarea
              id="order-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-control"
              rows={3}
              placeholder="Add any specific instructions for the test..."
            ></textarea>
          </div>
        </div>

        <div className="action-buttons">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="primary-button" 
            disabled={selectedTests.length === 0}
          >
            Order Selected Tests
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdditionalTests; 