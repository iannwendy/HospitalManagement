import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import '../../assets/appointments.css';

// Interfaces
interface ServiceCharge {
  id: string;
  patientName: string;
  patientId: string;
  serviceName: string;
  serviceDate: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Refunded';
  paymentDate?: string;
  insuranceClaim?: {
    status: 'Not Submitted' | 'Pending' | 'Approved' | 'Rejected';
    claimNumber?: string;
    submissionDate?: string;
    responseDate?: string;
  };
}

// Mock data
const mockServiceCharges: ServiceCharge[] = [
  {
    id: 'charge_001',
    patientName: 'John Doe',
    patientId: 'P001',
    serviceName: 'Initial Consultation',
    serviceDate: '2024-03-15',
    amount: 150.00,
    status: 'Pending',
    insuranceClaim: {
      status: 'Not Submitted'
    }
  },
  {
    id: 'charge_002',
    patientName: 'Jane Smith',
    patientId: 'P002',
    serviceName: 'Follow-up Consultation',
    serviceDate: '2024-03-14',
    amount: 100.00,
    status: 'Paid',
    paymentDate: '2024-03-14',
    insuranceClaim: {
      status: 'Approved',
      claimNumber: 'INS123456',
      submissionDate: '2024-03-14',
      responseDate: '2024-03-15'
    }
  },
  {
    id: 'charge_003',
    patientName: 'Alice Johnson',
    patientId: 'P003',
    serviceName: 'Emergency Consultation',
    serviceDate: '2024-03-13',
    amount: 200.00,
    status: 'Overdue',
    insuranceClaim: {
      status: 'Rejected',
      claimNumber: 'INS789012',
      submissionDate: '2024-03-13',
      responseDate: '2024-03-14'
    }
  },
  {
    id: 'charge_004',
    patientName: 'Bob Wilson',
    patientId: 'P004',
    serviceName: 'Prescription Renewal',
    serviceDate: '2024-03-12',
    amount: 75.00,
    status: 'Refunded',
    paymentDate: '2024-03-12',
    insuranceClaim: {
      status: 'Pending',
      claimNumber: 'INS345678',
      submissionDate: '2024-03-12'
    }
  }
];

const DoctorPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [doctorUser, setDoctorUser] = useState<any>(null);
  const [serviceCharges, setServiceCharges] = useState<ServiceCharge[]>(mockServiceCharges);
  const [selectedCharge, setSelectedCharge] = useState<ServiceCharge | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/doctor/login');
      return;
    }
    const userData = getCurrentUser();
    if (!userData || userData.role !== 'doctor') {
      logout();
      navigate('/doctor/login');
      return;
    }
    setDoctorUser(userData);
  }, [navigate]);

  const handleSubmitClaim = (chargeId: string) => {
    setServiceCharges(prev => prev.map(charge => {
      if (charge.id === chargeId) {
        return {
          ...charge,
          insuranceClaim: {
            status: 'Pending',
            claimNumber: `INS${Math.random().toString().slice(2, 8)}`,
            submissionDate: new Date().toISOString().split('T')[0]
          }
        };
      }
      return charge;
    }));
  };

  const handleMarkAsPaid = (chargeId: string) => {
    setServiceCharges(prev => prev.map(charge => {
      if (charge.id === chargeId) {
        return {
          ...charge,
          status: 'Paid',
          paymentDate: new Date().toISOString().split('T')[0]
        };
      }
      return charge;
    }));
  };

  const handleInitiateRefund = (chargeId: string) => {
    if (window.confirm('Are you sure you want to initiate a refund for this charge?')) {
      setServiceCharges(prev => prev.map(charge => {
        if (charge.id === chargeId) {
          return {
            ...charge,
            status: 'Refunded'
          };
        }
        return charge;
      }));
    }
  };

  const filteredCharges = serviceCharges.filter(charge => {
    const matchesStatus = filterStatus === 'all' || charge.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = charge.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         charge.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const chargeDate = new Date(charge.serviceDate);
    const isInDateRange = (!dateRange.start || chargeDate >= new Date(dateRange.start)) &&
                         (!dateRange.end || chargeDate <= new Date(dateRange.end));
    
    return matchesStatus && matchesSearch && isInDateRange;
  });

  const totalRevenue = filteredCharges
    .filter(charge => charge.status === 'Paid')
    .reduce((sum, charge) => sum + charge.amount, 0);

  const pendingAmount = filteredCharges
    .filter(charge => charge.status === 'Pending' || charge.status === 'Overdue')
    .reduce((sum, charge) => sum + charge.amount, 0);

  if (!doctorUser) {
    return <div className="p-5 text-center">Loading doctor data...</div>;
  }

  return (
    <div className="booking-container">
      <Navbar isDashboard={false} />
      
      <div className="booking-header">
        <div className="container py-4">
          <h1>Payment Management</h1>
          <p className="text-white-50">Manage patient payments and insurance claims</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="booking-step-content">
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="stats-card">
                <h3>Total Revenue</h3>
                <p className="amount">${totalRevenue.toFixed(2)}</p>
                <p className="text-muted">From paid services</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stats-card">
                <h3>Pending Amount</h3>
                <p className="amount">${pendingAmount.toFixed(2)}</p>
                <p className="text-muted">From pending/overdue payments</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stats-card">
                <h3>Total Charges</h3>
                <p className="amount">{filteredCharges.length}</p>
                <p className="text-muted">Number of service charges</p>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="filters mb-4">
              <div className="row g-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by patient or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <input
                    type="date"
                    className="form-control"
                    placeholder="Start Date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="date"
                    className="form-control"
                    placeholder="End Date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="charges-list">
              {filteredCharges.map(charge => (
                <div key={charge.id} className={`charge-item ${charge.status.toLowerCase()}`}>
                  <div className="charge-info">
                    <div className="patient-info">
                      <h4>{charge.patientName}</h4>
                      <p className="text-muted">Patient ID: {charge.patientId}</p>
                    </div>
                    <div className="service-info">
                      <h5>{charge.serviceName}</h5>
                      <p className="text-muted">Service Date: {charge.serviceDate}</p>
                    </div>
                    <div className="amount-info">
                      <h5>${charge.amount.toFixed(2)}</h5>
                      <span className={`status-badge status-${charge.status.toLowerCase()}`}>
                        {charge.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="charge-details">
                    <div className="insurance-info">
                      <h6>Insurance Claim</h6>
                      <div className="claim-status">
                        <span className={`claim-badge claim-${charge.insuranceClaim?.status.toLowerCase().replace(' ', '-') || 'not-submitted'}`}>
                          {charge.insuranceClaim?.status || 'Not Submitted'}
                        </span>
                        {charge.insuranceClaim?.claimNumber && (
                          <p className="text-muted mb-0">
                            Claim #{charge.insuranceClaim.claimNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="action-buttons">
                      {charge.status === 'Pending' && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleMarkAsPaid(charge.id)}
                          >
                            Mark as Paid
                          </button>
                          {(!charge.insuranceClaim || charge.insuranceClaim.status === 'Not Submitted') && (
                            <button
                              className="btn btn-outline-primary btn-sm ms-2"
                              onClick={() => handleSubmitClaim(charge.id)}
                            >
                              Submit Insurance Claim
                            </button>
                          )}
                        </>
                      )}
                      {charge.status === 'Paid' && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleInitiateRefund(charge.id)}
                        >
                          Initiate Refund
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .stats-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stats-card h3 {
          font-size: 1rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .stats-card .amount {
          font-size: 2rem;
          font-weight: 600;
          color: #3a7ca5;
          margin-bottom: 0.5rem;
        }

        .filters {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .charges-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .charge-item {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .charge-item.overdue {
          border-left: 4px solid #dc3545;
        }

        .charge-item.paid {
          border-left: 4px solid #28a745;
        }

        .charge-item.pending {
          border-left: 4px solid #ffc107;
        }

        .charge-item.refunded {
          border-left: 4px solid #17a2b8;
        }

        .charge-info {
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

        .service-info h5 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
          color: #2c3e50;
        }

        .amount-info {
          text-align: right;
        }

        .amount-info h5 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #3a7ca5;
          margin-bottom: 0.5rem;
        }

        .charge-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-paid {
          background-color: #d4edda;
          color: #155724;
        }

        .status-overdue {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status-refunded {
          background-color: #cff4fc;
          color: #055160;
        }

        .claim-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .claim-not-submitted {
          background-color: #e9ecef;
          color: #495057;
        }

        .claim-pending {
          background-color: #fff3cd;
          color: #856404;
        }

        .claim-approved {
          background-color: #d4edda;
          color: #155724;
        }

        .claim-rejected {
          background-color: #f8d7da;
          color: #721c24;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .charge-info {
            flex-direction: column;
            gap: 1rem;
          }

          .amount-info {
            text-align: left;
          }

          .charge-details {
            flex-direction: column;
            gap: 1rem;
          }

          .action-buttons {
            width: 100%;
            flex-direction: column;
          }

          .action-buttons button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default DoctorPaymentPage; 