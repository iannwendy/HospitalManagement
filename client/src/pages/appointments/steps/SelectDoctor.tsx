import React, { useState, useEffect } from 'react';
import { Doctor, Department } from '../../../types/appointment';
import { getDoctors, getDepartments, countDoctorsByDepartment } from '../../../services/doctorService';
import '../../../assets/department.css';

interface SelectDoctorProps {
  selectedDoctor: Doctor | null;
  onUpdateData: (data: { selectedDoctor: Doctor }) => void;
  onNext: () => void;
  onBack: () => void;
}

const SelectDoctor: React.FC<SelectDoctorProps> = ({
  selectedDoctor,
  onUpdateData,
  onNext,
  onBack
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selected, setSelected] = useState<Doctor | null>(selectedDoctor);
  const [filter, setFilter] = useState<string>('');
  const [specialty, setSpecialty] = useState<string>('');
  const [selectionMode, setSelectionMode] = useState<'doctor' | 'department'>('doctor');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load doctors and departments data from the service
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch doctors and departments in parallel
        const [doctorsData, departmentsData] = await Promise.all([
          getDoctors(),
          getDepartments()
        ]);
        
        setDoctors(doctorsData);
        setDepartments(departmentsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load doctors and departments. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Get unique specialties for the filter dropdown
  const specialties = Array.from(new Set(doctors.map(doctor => doctor.specialty)));

  // Filter doctors based on search, specialty, and department
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(filter.toLowerCase());
    const matchesSpecialty = specialty === '' || doctor.specialty === specialty;
    const matchesDepartment = !selectedDepartment || doctor.department === selectedDepartment.name;
    return matchesSearch && matchesSpecialty && matchesDepartment;
  });

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelected(doctor);
  };

  const handleSelectDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setSelectionMode('doctor');
    setSpecialty(department.name);
  };

  const handleContinue = () => {
    if (selected) {
      onUpdateData({ selectedDoctor: selected });
      onNext();
    }
  };

  const handleSwitchMode = (mode: 'doctor' | 'department') => {
    setSelectionMode(mode);
    if (mode === 'doctor') {
      setSelectedDepartment(null);
      setSpecialty('');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading doctors and departments...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="alert alert-danger p-4">
        <h4 className="alert-heading">Error</h4>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="form-step-title">Select a {selectionMode === 'doctor' ? 'Doctor' : 'Department'}</h2>
      <p className="mb-4">
        {selectionMode === 'doctor' 
          ? 'Choose a doctor for your appointment based on specialty and availability.' 
          : 'Choose a department for your medical needs.'}
      </p>

      {/* Mode selection tabs */}
      <div className="selection-tabs mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${selectionMode === 'doctor' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('doctor')}
            >
              <i className="bi bi-person-badge me-2"></i>
              Select by Doctor
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${selectionMode === 'department' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('department')}
            >
              <i className="bi bi-hospital me-2"></i>
              Select by Department
            </button>
          </li>
        </ul>
      </div>

      {selectionMode === 'doctor' ? (
        <>
          <div className="search-filters mb-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search doctors by name..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <select
                  className="form-select"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  <option value="">All Specialties</option>
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="doctors-list">
            {filteredDoctors.length === 0 ? (
              <div className="alert alert-info">
                <h5 className="alert-heading">No Doctors Found</h5>
                <p>No doctors match your current filters. Try adjusting your search criteria or select a different department.</p>
                {selectedDepartment && (
                  <button
                    className="btn btn-outline-primary btn-sm mt-2"
                    onClick={() => {
                      setSelectedDepartment(null);
                      setSpecialty('');
                    }}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Clear Department Filter
                  </button>
                )}
              </div>
            ) : (
              filteredDoctors.map(doctor => (
                <div
                  key={doctor.id}
                  className={`doctor-card ${selected?.id === doctor.id ? 'selected' : ''}`}
                  onClick={() => handleSelectDoctor(doctor)}
                >
                  <div className="doctor-header">
                    <img
                      src={doctor.avatarUrl}
                      alt={doctor.name}
                      className="doctor-avatar"
                    />
                    <div className="doctor-info">
                      <h5 className="doctor-name">{doctor.name}</h5>
                      <p className="doctor-specialty">{doctor.specialty}</p>
                      <div className="doctor-meta">
                        <span className="doctor-experience me-3">
                          <i className="bi bi-briefcase me-1"></i> {doctor.experience}
                        </span>
                        <span className="doctor-rating">
                          <i className="bi bi-star-fill me-1 text-warning"></i> {doctor.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="doctor-availability mt-3">
                    <small className="text-muted">Available on: {doctor.availability}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="departments-grid">
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {departments.map(department => {
              const doctorCount = countDoctorsByDepartment(department.name);
              return (
                <div key={department.id} className="col">
                  <div 
                    className={`card h-100 department-card ${selectedDepartment?.id === department.id ? 'border-primary' : ''}`} 
                    onClick={() => handleSelectDepartment(department)}
                  >
                    <div className="card-body text-center">
                      <div className="department-icon mb-3">
                        <i className={`bi ${department.iconClass} fs-1 text-primary`}></i>
                      </div>
                      <h5 className="card-title">{department.name}</h5>
                      <p className="card-text">{department.description}</p>
                      <div className="mt-3">
                        <span className="badge bg-light text-dark">
                          {doctorCount} {doctorCount === 1 ? 'Doctor' : 'Doctors'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="button-group">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleContinue}
          disabled={!selected}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SelectDoctor; 