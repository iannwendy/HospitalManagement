import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import '../../assets/appointments.css';

// Mock Data Interfaces
interface BillableService {
  id: string;
  serviceName: string;
  serviceDate: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
}

interface PaymentDetails {
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string; // MM/YY
  cvv: string;
}

// Mock Data
const mockOutstandingBills: BillableService[] = [
  { id: 'bill_001', serviceName: 'Consultation with Dr. Smith', serviceDate: '2024-07-25', amount: 150.00, status: 'Pending' },
  { id: 'bill_002', serviceName: 'Complete Blood Count (CBC)', serviceDate: '2024-07-26', amount: 75.50, status: 'Pending' },
  { id: 'bill_003', serviceName: 'Chest X-Ray', serviceDate: '2024-07-20', amount: 120.00, status: 'Paid' },
  { id: 'bill_004', serviceName: 'Follow-up Consultation', serviceDate: '2024-08-01', amount: 100.00, status: 'Failed' },
];

const ProcessPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [patientUser, setPatientUser] = useState<any>(null);
  const [bills, setBills] = useState<BillableService[]>(mockOutstandingBills);
  const [selectedBill, setSelectedBill] = useState<BillableService | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<Partial<PaymentDetails>>({});
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'validationFailed'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');

  const isCurrentlyProcessing = paymentStatus === 'processing';

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/patient/login');
      return;
    }
    const userData = getCurrentUser();
    if (!userData || userData.role !== 'patient') {
      logout();
      navigate('/patient/login');
      return;
    }
    setPatientUser(userData);
  }, [navigate]);

  const handleSelectBill = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill && (bill.status === 'Pending' || bill.status === 'Failed')) {
      setSelectedBill(bill);
      setPaymentStatus('idle');
      setPaymentMessage('');
      setPaymentDetails({});
    } else if (bill) {
      alert(`This bill for ${bill.serviceName} has a status of ${bill.status} and cannot be paid again.`);
      setSelectedBill(null);
    }
  };

  const handlePaymentInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  const validatePaymentDetails = (details: Partial<PaymentDetails>): boolean => {
    if (!details.cardNumber || !details.cardHolderName || !details.expiryDate || !details.cvv) {
      setPaymentMessage('All card details are required.');
      return false;
    }
    if (!/^\d{16}$/.test(details.cardNumber.replace(/\s/g, ''))) {
      setPaymentMessage('Invalid card number format (must be 16 digits).');
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(details.expiryDate)) {
      setPaymentMessage('Invalid expiry date format (MM/YY).');
      return false;
    }
    if (!/^\d{3,4}$/.test(details.cvv)) {
      setPaymentMessage('Invalid CVV format (3 or 4 digits).');
      return false;
    }
    return true;
  };

  const handleProcessPayment = async () => {
    if (!selectedBill) return;
    if (!validatePaymentDetails(paymentDetails)) {
      setPaymentStatus('validationFailed');
      return;
    }

    setPaymentStatus('processing');
    setPaymentMessage('Processing your payment...');

    await new Promise(resolve => setTimeout(resolve, 2000));

    const isPaymentSuccessful = Math.random() > 0.2;

    if (isPaymentSuccessful) {
      setBills(prevBills => prevBills.map(b => b.id === selectedBill.id ? { ...b, status: 'Paid' } : b));
      setPaymentStatus('success');
      setPaymentMessage(`Payment of $${selectedBill.amount.toFixed(2)} for ${selectedBill.serviceName} successful! A receipt has been sent to your email.`);
      setSelectedBill(null);
      setPaymentDetails({});
    } else {
      setPaymentStatus('error');
      setPaymentMessage('Payment failed. Please check your card details or try a different payment method.');
      setBills(prevBills => prevBills.map(b => b.id === selectedBill.id && b.status === 'Pending' ? { ...b, status: 'Failed' } : b));
    }
  };

  const handleRetryPayment = () => {
    if (selectedBill && selectedBill.status === 'Failed') {
      setPaymentStatus('idle');
      setPaymentMessage('Please re-enter your payment details or try a different card.');
      setPaymentDetails(prev => ({ cardHolderName: prev.cardHolderName }));
    } else {
      alert('No failed payment selected to retry or bill is not in a failed state.');
    }
  };

  const handleRequestRefund = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill && bill.status === 'Paid') {
      if (window.confirm(`Are you sure you want to request a refund for ${bill.serviceName} ($${bill.amount.toFixed(2)})?`)) {
        alert(`Refund request for ${bill.serviceName} submitted. You will be notified once processed.`);
      }
    } else if (bill) {
      alert(`Refund cannot be requested for this bill as its status is ${bill.status}.`);
    } else {
      alert('Bill not found.');
    }
  };

  if (!patientUser) {
    return <div className="p-5 text-center">Loading patient data...</div>;
  }

  return (
    <div className="booking-container">
      <Navbar isDashboard={false} />
      
      <div className="booking-header">
        <div className="container py-4">
          <h1>Process Payment</h1>
          <p className="text-white-50">View and manage your medical bills</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="booking-step-content">
          <div className="row">
            <div className="col-lg-8">
              <div className="form-section mb-4">
                <h3 className="form-step-title">Outstanding Bills</h3>
                {bills.filter(b => b.status === 'Pending' || b.status === 'Failed').length > 0 ? (
                  <div className="bills-list">
                    {bills.map(bill => (
                      (bill.status === 'Pending' || bill.status === 'Failed') && (
                        <div
                          key={bill.id}
                          className={`bill-item ${selectedBill?.id === bill.id ? 'selected' : ''} ${bill.status === 'Failed' ? 'failed' : ''}`}
                          onClick={() => handleSelectBill(bill.id)}
                        >
                          <div className="bill-info">
                            <h4 className="bill-title">{bill.serviceName}</h4>
                            <p className="bill-date">Service Date: {bill.serviceDate}</p>
                            <p className="bill-amount">${bill.amount.toFixed(2)}</p>
                          </div>
                          <div className="bill-status">
                            {bill.status === 'Failed' ? (
                              <span className="status-badge status-failed">Payment Failed</span>
                            ) : (
                              <span className="status-badge status-pending">Pending</span>
                            )}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    You have no outstanding bills to pay.
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3 className="form-step-title">Payment History</h3>
                {bills.filter(b => b.status === 'Paid' || b.status === 'Refunded').length > 0 ? (
                  <div className="bills-list history">
                    {bills.filter(b => b.status === 'Paid' || b.status === 'Refunded').map(bill => (
                      <div key={bill.id} className="bill-item">
                        <div className="bill-info">
                          <h4 className="bill-title">{bill.serviceName}</h4>
                          <p className="bill-date">Service Date: {bill.serviceDate}</p>
                          <p className="bill-amount">${bill.amount.toFixed(2)}</p>
                        </div>
                        <div className="bill-actions">
                          <span className={`status-badge status-${bill.status.toLowerCase()}`}>
                            {bill.status}
                          </span>
                          {bill.status === 'Paid' && (
                            <button
                              className="btn btn-outline-secondary btn-sm ms-2"
                              onClick={() => handleRequestRefund(bill.id)}
                            >
                              Request Refund
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No payment history found.
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-4">
              {selectedBill && (selectedBill.status === 'Pending' || selectedBill.status === 'Failed') && (
                <div className="payment-section">
                  <div className="form-section">
                    <h3 className="form-step-title">Payment Details</h3>
                    <div className="selected-bill-summary mb-4">
                      <h4>{selectedBill.serviceName}</h4>
                      <p className="text-muted mb-2">Service Date: {selectedBill.serviceDate}</p>
                      <p className="amount">Amount to Pay: <strong>${selectedBill.amount.toFixed(2)}</strong></p>
                    </div>

                    {(paymentStatus === 'idle' || paymentStatus === 'validationFailed' || (paymentStatus === 'error' && selectedBill.status === 'Failed')) && !isCurrentlyProcessing && (
                      <form className="payment-form">
                        <div className="mb-3">
                          <label htmlFor="cardHolderName" className="form-label">Cardholder Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="cardHolderName"
                            name="cardHolderName"
                            value={paymentDetails.cardHolderName || ''}
                            onChange={handlePaymentInputChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="cardNumber" className="form-label">Card Number</label>
                          <input
                            type="text"
                            className="form-control"
                            id="cardNumber"
                            name="cardNumber"
                            value={paymentDetails.cardNumber || ''}
                            onChange={handlePaymentInputChange}
                            placeholder="XXXX XXXX XXXX XXXX"
                          />
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                            <input
                              type="text"
                              className="form-control"
                              id="expiryDate"
                              name="expiryDate"
                              value={paymentDetails.expiryDate || ''}
                              onChange={handlePaymentInputChange}
                              placeholder="MM/YY"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="cvv" className="form-label">CVV</label>
                            <input
                              type="text"
                              className="form-control"
                              id="cvv"
                              name="cvv"
                              value={paymentDetails.cvv || ''}
                              onChange={handlePaymentInputChange}
                              placeholder="XXX"
                            />
                          </div>
                        </div>

                        {paymentMessage && (
                          <div className={`alert mt-3 alert-${paymentStatus === 'error' || paymentStatus === 'validationFailed' ? 'danger' : 'info'}`}>
                            {paymentMessage}
                          </div>
                        )}

                        <div className="button-group mt-4">
                          <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={handleProcessPayment}
                            disabled={isCurrentlyProcessing}
                          >
                            {isCurrentlyProcessing ? 'Processing...' : `Pay $${selectedBill.amount.toFixed(2)}`}
                          </button>
                          {selectedBill.status === 'Failed' && !isCurrentlyProcessing && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary w-100 mt-2"
                              onClick={handleRetryPayment}
                            >
                              Try Different Card
                            </button>
                          )}
                        </div>
                      </form>
                    )}

                    {isCurrentlyProcessing && (
                      <div className="text-center p-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Processing...</span>
                        </div>
                        <p className="mt-3">{paymentMessage}</p>
                      </div>
                    )}

                    {paymentStatus === 'success' && (
                      <div className="success-message text-center">
                        <div className="success-icon mb-3">
                          <i className="bi bi-check-circle-fill text-success"></i>
                        </div>
                        <h4>Payment Successful!</h4>
                        <p>{paymentMessage}</p>
                        <Link to="/patient/dashboard" className="btn btn-primary mt-3">
                          Return to Dashboard
                        </Link>
                      </div>
                    )}

                    {paymentStatus === 'error' && selectedBill.status !== 'Failed' && (
                      <div className="error-message text-center">
                        <div className="error-icon mb-3">
                          <i className="bi bi-x-octagon-fill text-danger"></i>
                        </div>
                        <h4>Payment Error</h4>
                        <p>{paymentMessage}</p>
                        <button
                          className="btn btn-primary mt-3"
                          onClick={() => {
                            setSelectedBill(null);
                            setPaymentStatus('idle');
                          }}
                        >
                          Try Another Bill
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bills-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .bill-item {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bill-item:hover {
          border-color: #3a7ca5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .bill-item.selected {
          border-color: #3a7ca5;
          background-color: rgba(58, 124, 165, 0.05);
        }

        .bill-item.failed {
          border-left: 4px solid #dc3545;
        }

        .bill-title {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }

        .bill-date {
          font-size: 0.9rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .bill-amount {
          font-size: 1.2rem;
          font-weight: 600;
          color: #3a7ca5;
          margin-bottom: 0;
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

        .status-failed {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status-paid {
          background-color: #d4edda;
          color: #155724;
        }

        .status-refunded {
          background-color: #cff4fc;
          color: #055160;
        }

        .payment-section {
          position: sticky;
          top: 2rem;
        }

        .selected-bill-summary {
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 8px;
        }

        .selected-bill-summary h4 {
          color: #2c3e50;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .selected-bill-summary .amount {
          font-size: 1.2rem;
          color: #3a7ca5;
        }

        .success-icon i,
        .error-icon i {
          font-size: 3rem;
        }

        .bills-list.history .bill-item {
          cursor: default;
        }

        .bills-list.history .bill-item:hover {
          transform: none;
          border-color: #e0e0e0;
        }

        @media (max-width: 991.98px) {
          .payment-section {
            position: static;
            margin-top: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProcessPaymentPage; 