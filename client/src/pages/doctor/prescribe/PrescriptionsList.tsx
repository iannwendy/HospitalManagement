import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config/api';

// API base URL - use central configuration
const API_URL = API_CONFIG.BASE_URL;

// Development mode flag
const isDevelopment = false; // Force to always use real API

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medications: Medication[];
  instructions: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface PrescriptionsListProps {
  prescriptions?: Prescription[];
  onSendToPharmacy?: (prescription: Prescription) => void;
}

const PrescriptionsList: React.FC<PrescriptionsListProps> = ({ 
  prescriptions: propPrescriptions,
  onSendToPharmacy 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'patient'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load all prescriptions if none are provided
  useEffect(() => {
    if (propPrescriptions && propPrescriptions.length > 0) {
      setPrescriptions(propPrescriptions);
    } else {
      fetchAllPrescriptions();
    }
  }, [propPrescriptions]);
  
  // Fetch all prescriptions from API
  const fetchAllPrescriptions = async () => {
    setIsLoading(true);
    try {
      // Get auth token
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['x-auth-token'] = token;
      }
      
      // Ensure correct API path with /api prefix
      const endpoint = '/api/prescriptions';
      const url = `${API_URL}${endpoint}`;
      
      console.log('Fetching prescriptions from:', url);
      const response = await axios.get(url, { headers });
      console.log('Prescriptions response:', response.data);
      setPrescriptions(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Failed to load prescriptions. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Filter prescriptions based on search term and filter status
  const filteredPrescriptions = prescriptions.filter(prescription => {
    // Handle potentially undefined values
    const patientName = prescription.patientName || 'Unknown Patient';
    const prescriptionId = prescription.id || '';
    
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescriptionId.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      filterStatus === 'all' || 
      prescription.status === filterStatus;
      
    return matchesSearch && matchesStatus;
  });
  
  // Sort filtered prescriptions
  const sortedPrescriptions = [...filteredPrescriptions].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      const nameA = a.patientName.toLowerCase();
      const nameB = b.patientName.toLowerCase();
      return sortDirection === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }
  });
  
  // Toggle expanded state for a prescription
  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };
  
  // Toggle sort direction
  const handleSort = (field: 'date' | 'patient') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: Prescription['status']) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'completed': return 'bg-secondary';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };
  
  // Update prescription status
  const handleStatusUpdate = async (id: string, newStatus: 'active' | 'completed' | 'cancelled') => {
    try {
      // Get auth token
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['x-auth-token'] = token;
      } else {
        // Fallback for development
        headers['x-auth-token'] = 'fake-token-' + Date.now();
      }
      
      // Ensure correct API path with /api prefix
      const endpoint = `/api/prescriptions/${id}/status`;
      const url = `${API_URL}${endpoint}`;
      
      console.log('Updating prescription status at:', url);
      await axios.put(url, {
        status: newStatus
      }, { headers });
      
      // Update local state
      setPrescriptions(prescriptions.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));
    } catch (err) {
      console.error('Error updating prescription status:', err);
      setError('Failed to update prescription status. Please try again.');
    }
  };
  
  // Demo mode - show mock data if there's an error in development
  useEffect(() => {
    if (isDevelopment && error && prescriptions.length === 0) {
      // Add some mock prescriptions for development
      setPrescriptions([
        {
          id: 'RX001',
          patientId: 'P001',
          patientName: 'John Doe',
          medications: [
            { id: 'M001', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' }
          ],
          instructions: 'Take with water in the morning',
          date: '2023-10-15',
          status: 'active'
        },
        {
          id: 'RX002',
          patientId: 'P002',
          patientName: 'Jane Smith',
          medications: [
            { id: 'M002', name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' }
          ],
          instructions: 'Take with food. Complete the full course.',
          date: '2023-10-10',
          status: 'completed'
        }
      ]);
      setError(null);
    }
  }, [error, isDevelopment, prescriptions.length]);
  
  // Add function to handle send to pharmacy
  const handleSendToPharmacy = (prescription: Prescription) => {
    if (onSendToPharmacy) {
      onSendToPharmacy(prescription);
    } else {
      console.warn('onSendToPharmacy handler not provided');
    }
  };
  
  // Print prescription function
  const printPrescription = (prescription: Prescription) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website to print prescriptions');
      return;
    }
    
    // Format medications list
    const medicationsList = prescription.medications.map(med => 
      `<tr>
        <td>${med.name}</td>
        <td>${med.dosage}</td>
        <td>${med.frequency}</td>
        <td>${med.duration}</td>
      </tr>`
    ).join('');

    // Create content for the print window with styling
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription #${prescription.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
          .prescription-info { margin-bottom: 20px; }
          .prescription-info p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          table, th, td { border: 1px solid #ddd; }
          th, td { padding: 10px; text-align: left; }
          th { background-color: #f2f2f2; }
          .instructions { padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; }
          .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; }
          @media print {
            .no-print { display: none; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Advanced Healthcare Hospital</h1>
          <p>123 Hospital Street, City, State 12345 | Tel: (123) 456-7890</p>
        </div>
        
        <div class="prescription-info">
          <h2>Prescription #${prescription.id}</h2>
          <p><strong>Patient:</strong> ${prescription.patientName}</p>
          <p><strong>Date:</strong> ${formatDate(prescription.date)}</p>
          <p><strong>Status:</strong> ${prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}</p>
        </div>
        
        <h3>Medications</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${medicationsList}
          </tbody>
        </table>
        
        <h3>Instructions</h3>
        <div class="instructions">
          ${prescription.instructions || 'No special instructions.'}
        </div>
        
        <div class="footer">
          <p>This prescription was generated electronically.</p>
          <p>Doctor's signature: ____________________________</p>
        </div>
        
        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print();" style="padding: 10px 20px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Print Prescription
          </button>
          <button onclick="window.close();" style="padding: 10px 20px; background: #f44242; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `;
    
    // Write content to the new window
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Focus the new window
    printWindow.focus();
  };
  
  // Loading spinner
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
    <div className="prescriptions-list-container">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Prescriptions</h5>
        </div>
        <div className="card-body">
          <div className="filters mb-4">
            <div className="row align-items-end">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="form-label">Search</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search by patient name or prescription ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3 mb-3 mb-md-0">
                <label className="form-label">Status</label>
                <select 
                  className="form-select" 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Sort By</label>
                <div className="d-flex">
                  <button 
                    className={`btn btn-outline-primary flex-grow-1 ${sortBy === 'date' ? 'active' : ''}`}
                    onClick={() => handleSort('date')}
                  >
                    Date {sortBy === 'date' && (
                      <i className={`ms-1 bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                    )}
                  </button>
                  <button 
                    className={`btn btn-outline-primary flex-grow-1 ms-2 ${sortBy === 'patient' ? 'active' : ''}`}
                    onClick={() => handleSort('patient')}
                  >
                    Name {sortBy === 'patient' && (
                      <i className={`ms-1 bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {sortedPrescriptions.length === 0 ? (
            <div className="text-center text-muted my-5">
              <i className="bi bi-file-earmark-medical" style={{ fontSize: '3rem' }}></i>
              <p className="mt-3">No prescriptions found matching your criteria</p>
            </div>
          ) : (
            <div className="prescriptions-table">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Patient</th>
                      <th>Medications</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPrescriptions.map(prescription => (
                      <React.Fragment key={prescription.id}>
                        <tr>
                          <td>{prescription.id}</td>
                          <td>{formatDate(prescription.date)}</td>
                          <td>{prescription.patientName}</td>
                          <td>{prescription.medications.length} medication(s)</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(prescription.status)}`}>
                              {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => toggleExpand(prescription.id)}
                              >
                                <i className={`bi bi-chevron-${expandedId === prescription.id ? 'up' : 'down'}`}></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => printPrescription(prescription)}
                                title="Print Prescription"
                              >
                                <i className="bi bi-printer"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedId === prescription.id && (
                          <tr>
                            <td colSpan={6} className="p-0">
                              <div className="prescription-details bg-light p-3">
                                <div className="row mb-3">
                                  <div className="col-md-6">
                                    <p className="mb-1"><strong>Patient ID:</strong> {prescription.patientId}</p>
                                    <p className="mb-1"><strong>Prescription Date:</strong> {formatDate(prescription.date)}</p>
                                  </div>
                                  <div className="col-md-6">
                                    <p className="mb-1"><strong>Status:</strong> {prescription.status}</p>
                                  </div>
                                </div>
                                
                                <h6 className="mb-3">Medications</h6>
                                <div className="table-responsive">
                                  <table className="table table-sm table-bordered mb-3">
                                    <thead className="table-light">
                                      <tr>
                                        <th>Name</th>
                                        <th>Dosage</th>
                                        <th>Frequency</th>
                                        <th>Duration</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {prescription.medications.map(medication => (
                                        <tr key={medication.id}>
                                          <td>{medication.name}</td>
                                          <td>{medication.dosage}</td>
                                          <td>{medication.frequency}</td>
                                          <td>{medication.duration}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                
                                {prescription.instructions && (
                                  <div>
                                    <h6 className="mb-2">Instructions</h6>
                                    <p className="mb-0 p-2 border rounded bg-white">{prescription.instructions}</p>
                                  </div>
                                )}
                                
                                <div className="d-flex mt-3">
                                  {prescription.status === 'active' && (
                                    <>
                                      <button 
                                        className="btn btn-success me-2"
                                        onClick={() => onSendToPharmacy && onSendToPharmacy(prescription)}
                                      >
                                        <i className="bi bi-prescription2 me-1"></i>
                                        Send to Pharmacy
                                      </button>
                                      <button 
                                        className="btn btn-outline-secondary me-2"
                                        onClick={() => handleStatusUpdate(prescription.id, 'completed')}
                                      >
                                        Mark as Completed
                                      </button>
                                      <button 
                                        className="btn btn-outline-danger"
                                        onClick={() => handleStatusUpdate(prescription.id, 'cancelled')}
                                      >
                                        Cancel Prescription
                                      </button>
                                    </>
                                  )}
                                  {prescription.status === 'cancelled' && (
                                    <button 
                                      className="btn btn-outline-success"
                                      onClick={() => handleStatusUpdate(prescription.id, 'active')}
                                    >
                                      Reactivate Prescription
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionsList; 