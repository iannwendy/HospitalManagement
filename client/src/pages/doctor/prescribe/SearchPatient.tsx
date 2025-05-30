import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  allergies: string[];
}

interface SearchPatientProps {
  onSelectPatient: (patient: Patient) => void;
}

const SearchPatient: React.FC<SearchPatientProps> = ({ onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Search patients from the database
  const searchPatients = async () => {
    if (searchTerm.trim().length < 2) {
      setFilteredPatients([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/patients/search?query=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || ''
        }
      });

      if (response.data && Array.isArray(response.data)) {
        setFilteredPatients(response.data);
      } else {
        setFilteredPatients([]);
      }
    } catch (err) {
      console.error('Error searching patients:', err);
      setError('Failed to load patient record. Please try again.');
      setFilteredPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger search when searchTerm changes and has at least 2 characters
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchPatients();
      } else {
        setFilteredPatients([]);
      }
    }, 500); // Add debounce of 500ms

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Handle patient selection
  const handleSelectPatient = (patient: Patient) => {
    try {
      onSelectPatient(patient);
    } catch (err) {
      console.error('Error selecting patient:', err);
      setError('Failed to load patient record. Please try again.');
    }
  };

  return (
    <div className="search-patient-container">
      <div className="row">
        <div className="col-md-8 col-lg-6 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Find Patient</h5>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}
              
              <div className="mb-3">
                <label htmlFor="patientSearch" className="form-label">Search by Patient Name or ID</label>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    id="patientSearch"
                    placeholder="Enter patient name or ID..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={searchPatients}
                  >
                    <i className="bi bi-search"></i>
                  </button>
                </div>
                <small className="form-text text-muted">
                  Enter at least 2 characters to search
                </small>
              </div>
              
              <div className="search-results">
                {isLoading ? (
                  <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Searching patients...</p>
                  </div>
                ) : searchTerm.trim().length < 2 ? (
                  <div className="text-center text-muted my-5">
                    <i className="bi bi-search" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-3">Enter patient name or ID to search</p>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center text-muted my-5">
                    <i className="bi bi-emoji-frown" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-3">No patients found matching "{searchTerm}"</p>
                  </div>
                ) : (
                  <div className="patient-list mt-4">
                    <h6 className="mb-3">Search Results ({filteredPatients.length})</h6>
                    {filteredPatients.map(patient => (
                      <div key={patient.id} className="patient-card card mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{patient.name}</h6>
                              <p className="text-muted small mb-0">
                                ID: {patient.id} | {patient.age} years | {patient.gender}
                              </p>
                              {patient.allergies && patient.allergies.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-danger small">
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    Allergies: {patient.allergies.join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSelectPatient(patient)}
                              disabled={isLoading || !!error}
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPatient; 