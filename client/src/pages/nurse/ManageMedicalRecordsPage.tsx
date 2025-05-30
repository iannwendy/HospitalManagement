import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import '../../assets/appointments.css';

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  dateCreated: string;
  recordType: 'Lab Result' | 'Prescription' | 'Treatment Plan' | 'Progress Note' | 'Diagnosis';
  status: 'Active' | 'Archived' | 'Pending Review';
  doctor: {
    id: string;
    name: string;
    department: string;
  };
  details: {
    description: string;
    attachments?: string[];
    lastUpdated: string;
    updatedBy: string;
  };
}

// Mock data
const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'MR001',
    patientId: 'P001',
    patientName: 'John Smith',
    dateCreated: '2024-03-15',
    recordType: 'Lab Result',
    status: 'Active',
    doctor: {
      id: 'D001',
      name: 'Dr. Sarah Wilson',
      department: 'General Medicine'
    },
    details: {
      description: 'Complete Blood Count (CBC) Results',
      attachments: ['cbc_results.pdf'],
      lastUpdated: '2024-03-15',
      updatedBy: 'Nurse Johnson'
    }
  },
  {
    id: 'MR002',
    patientId: 'P002',
    patientName: 'Mary Johnson',
    dateCreated: '2024-03-18',
    recordType: 'Prescription',
    status: 'Pending Review',
    doctor: {
      id: 'D002',
      name: 'Dr. Michael Brown',
      department: 'Cardiology'
    },
    details: {
      description: 'Heart medication prescription and dosage instructions',
      lastUpdated: '2024-03-18',
      updatedBy: 'Dr. Brown'
    }
  },
  {
    id: 'MR003',
    patientId: 'P003',
    patientName: 'Robert Davis',
    dateCreated: '2024-03-10',
    recordType: 'Treatment Plan',
    status: 'Archived',
    doctor: {
      id: 'D003',
      name: 'Dr. Emily Chen',
      department: 'Surgery'
    },
    details: {
      description: 'Post-operative recovery plan',
      attachments: ['recovery_plan.pdf', 'exercise_instructions.pdf'],
      lastUpdated: '2024-03-17',
      updatedBy: 'Nurse Williams'
    }
  }
];

const ManageMedicalRecordsPage: React.FC = () => {
  const navigate = useNavigate();
  const [nurseUser, setNurseUser] = useState<any>(null);
  const [records, setRecords] = useState<MedicalRecord[]>(mockMedicalRecords);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
  }, [navigate]);

  const handleSelectRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
  };

  const handleUpdateStatus = (recordId: string, newStatus: 'Active' | 'Archived' | 'Pending Review') => {
    setRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        return {
          ...record,
          status: newStatus,
          details: {
            ...record.details,
            lastUpdated: new Date().toISOString().split('T')[0],
            updatedBy: nurseUser.name
          }
        };
      }
      return record;
    }));
    setMessage({ type: 'success', text: 'Record status updated successfully' });
  };

  const handleAddAttachment = (recordId: string, attachment: string) => {
    setRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        return {
          ...record,
          details: {
            ...record.details,
            attachments: [...(record.details.attachments || []), attachment],
            lastUpdated: new Date().toISOString().split('T')[0],
            updatedBy: nurseUser.name
          }
        };
      }
      return record;
    }));
    setMessage({ type: 'success', text: 'Attachment added successfully' });
  };

  const filteredRecords = records.filter(record => {
    const matchesType = filterType === 'all' || record.recordType.toLowerCase() === filterType.toLowerCase();
    const matchesStatus = filterStatus === 'all' || record.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || record.dateCreated === dateFilter;
    
    return matchesType && matchesStatus && matchesSearch && matchesDate;
  });

  if (!nurseUser) {
    return <div className="p-5 text-center">Loading nurse data...</div>;
  }

  return (
    <div className="booking-container">
      <Navbar isDashboard={false} />
      
      <div className="booking-header">
        <div className="container py-4">
          <h1>Manage Medical Records</h1>
          <p className="text-white-50">View and manage patient medical records</p>
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

          <div className="filters mb-4">
            <div className="row g-3">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by patient or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="lab result">Lab Results</option>
                  <option value="prescription">Prescriptions</option>
                  <option value="treatment plan">Treatment Plans</option>
                  <option value="progress note">Progress Notes</option>
                  <option value="diagnosis">Diagnoses</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="pending review">Pending Review</option>
                </select>
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => setShowAddModal(true)}
                >
                  Add New Record
                </button>
              </div>
            </div>
          </div>

          <div className="records-list">
            {filteredRecords.map(record => (
              <div 
                key={record.id} 
                className={`record-item ${record.status.toLowerCase().replace(' ', '-')} ${selectedRecord?.id === record.id ? 'selected' : ''}`}
                onClick={() => handleSelectRecord(record)}
              >
                <div className="record-header">
                  <div className="patient-info">
                    <h4>{record.patientName}</h4>
                    <p className="text-muted mb-0">ID: {record.patientId}</p>
                  </div>
                  <div className="record-type">
                    <span className="type-badge">
                      {record.recordType}
                    </span>
                  </div>
                  <div className="record-status">
                    <span className={`status-badge status-${record.status.toLowerCase().replace(' ', '-')}`}>
                      {record.status}
                    </span>
                  </div>
                </div>

                <div className="record-details">
                  <div className="doctor-info">
                    <h6>Doctor</h6>
                    <p className="mb-0">{record.doctor.name}</p>
                    <p className="text-muted mb-0">{record.doctor.department}</p>
                  </div>
                  <div className="description-info">
                    <h6>Description</h6>
                    <p className="mb-0">{record.details.description}</p>
                  </div>
                  <div className="update-info">
                    <h6>Last Update</h6>
                    <p className="mb-0">{record.details.lastUpdated}</p>
                    <p className="text-muted mb-0">by {record.details.updatedBy}</p>
                  </div>
                </div>

                {record.details.attachments && record.details.attachments.length > 0 && (
                  <div className="attachments-section">
                    <h6>Attachments</h6>
                    <div className="attachment-list">
                      {record.details.attachments.map((attachment, index) => (
                        <div key={index} className="attachment-item">
                          <i className="bi bi-file-earmark-text"></i>
                          <span>{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="record-actions">
                  {record.status !== 'Archived' && (
                    <>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleAddAttachment(record.id, 'new_attachment.pdf')}
                      >
                        Add Attachment
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleUpdateStatus(record.id, 'Active')}
                        disabled={record.status === 'Active'}
                      >
                        Mark as Active
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleUpdateStatus(record.id, 'Pending Review')}
                        disabled={record.status === 'Pending Review'}
                      >
                        Mark for Review
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleUpdateStatus(record.id, 'Archived')}
                      >
                        Archive
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {filteredRecords.length === 0 && (
              <div className="text-center p-5">
                <h3 className="text-muted">No medical records found</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .filters {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .records-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }

        .record-item {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
        }

        .record-item:hover {
          border-color: #3a7ca5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .record-item.selected {
          border-color: #3a7ca5;
          background-color: rgba(58, 124, 165, 0.05);
        }

        .record-item.active {
          border-left: 4px solid #28a745;
        }

        .record-item.pending-review {
          border-left: 4px solid #ffc107;
        }

        .record-item.archived {
          border-left: 4px solid #6c757d;
        }

        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .patient-info h4 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
          color: #2c3e50;
        }

        .type-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          background-color: #e3f2fd;
          color: #0d47a1;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-active {
          background-color: #d4edda;
          color: #155724;
        }

        .status-pending-review {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-archived {
          background-color: #e2e3e5;
          color: #383d41;
        }

        .record-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          padding: 1rem 0;
          border-top: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
        }

        .record-details h6 {
          font-size: 0.875rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .attachments-section {
          padding: 1rem 0;
        }

        .attachment-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .attachment-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .record-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .record-header {
            flex-direction: column;
            gap: 1rem;
          }

          .record-details {
            grid-template-columns: 1fr;
          }

          .record-actions {
            flex-direction: column;
          }

          .record-actions button {
            width: 100%;
          }

          .attachment-list {
            flex-direction: column;
          }

          .attachment-item {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageMedicalRecordsPage; 