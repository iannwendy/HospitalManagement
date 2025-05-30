import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
// import './PerformTestPage.css'; // Optional

// Mock Data Interfaces
interface Patient {
  id: string;
  name: string;
  dob: string;
  // Add other relevant patient details from medical records if needed
}

interface DiagnosticTest {
  id: string;
  name: string;
  description: string;
  requiresFacility: boolean;
  type: string; // e.g., 'Blood Test', 'Imaging', 'Biopsy'
}

interface PatientTestOrder {
  id: string;
  patientId: string;
  testId: string;
  testName?: string;
  orderDate: string;
  status: 'Ordered' | 'Scheduled' | 'Performed' | 'Results Recorded' | 'Reviewed & Closed';
  scheduledDate?: string;
  results?: TestResult;
}

interface TestResult {
  resultDate: string;
  summary: string;
  details?: string; // Could be path to a file or more structured data
  isCritical?: boolean;
  recordedByDoctorId: string;
}

// Mock Data
const mockPatients: Patient[] = [
  { id: 'pat_001', name: 'Nguyen Van A', dob: '1985-03-15' },
  { id: 'pat_002', name: 'Tran Thi B', dob: '1992-07-22' },
  { id: 'pat_003', name: 'Le Van C', dob: '1978-11-05' },
];

const mockTestCatalog: DiagnosticTest[] = [
  { id: 'test_001', name: 'Complete Blood Count (CBC)', description: 'Measures various components of blood.', requiresFacility: false, type: 'Blood Test' },
  { id: 'test_002', name: 'Chest X-Ray', description: 'Imaging test of the chest.', requiresFacility: true, type: 'Imaging' },
  { id: 'test_003', name: 'MRI Brain', description: 'Detailed imaging of the brain.', requiresFacility: true, type: 'Imaging' },
  { id: 'test_004', name: 'Urinalysis', description: 'Analyzes urine sample.', requiresFacility: false, type: 'Lab Test' },
  { id: 'test_005', name: 'Biopsy Sample Analysis', description: 'Microscopic examination of tissue sample.', requiresFacility: true, type: 'Pathology' },
];

const mockPatientTestOrders: PatientTestOrder[] = [
  {
    id: 'pto_001', patientId: 'pat_001', testId: 'test_001', testName: 'Complete Blood Count (CBC)', orderDate: '2024-07-20', status: 'Reviewed & Closed', 
    results: { resultDate: '2024-07-21', summary: 'All values within normal range.', recordedByDoctorId: 'doc_currentUser' } 
  }
];

const PerformTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [doctorUser, setDoctorUser] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [testCatalog, setTestCatalog] = useState<DiagnosticTest[]>(mockTestCatalog);
  const [patientTestOrders, setPatientTestOrders] = useState<PatientTestOrder[]>(mockPatientTestOrders);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTestForOrder, setSelectedTestForOrder] = useState<DiagnosticTest | null>(null);
  const [currentPatientOrders, setCurrentPatientOrders] = useState<PatientTestOrder[]>([]);
  
  const [isRecordResultModalOpen, setIsRecordResultModalOpen] = useState(false);
  const [targetOrderForResults, setTargetOrderForResults] = useState<PatientTestOrder | null>(null);
  const [resultForm, setResultForm] = useState<Partial<TestResult>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient || null);
    if (patient) {
      setCurrentPatientOrders(patientTestOrders.filter(pto => pto.patientId === patient.id).sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime() ));
      // Simulate Access Patient Record & Display Patient Medical History (Step 1 & 2 from flow)
      console.log(`Accessed record for patient: ${patient.name}`);
    } else {
      setCurrentPatientOrders([]);
    }
    setSelectedTestForOrder(null); // Reset test selection
  };

  const handleOrderTest = () => {
    if (!selectedPatient || !selectedTestForOrder) {
      alert('Please select a patient and a test to order.');
      return;
    }

    // Simulate Doctor identifies the test need (Step 3 from flow)
    console.log(`Doctor identified need for test: ${selectedTestForOrder.name} for patient ${selectedPatient.name}`);

    // Simulate Check Facility Availability (Part of Step 4.1 from flow)
    if (selectedTestForOrder.requiresFacility) {
      const isFacilityAvailable = Math.random() > 0.2; // Simulate 80% availability
      if (!isFacilityAvailable) {
        alert(`Facility for ${selectedTestForOrder.name} is currently unavailable. Please try scheduling it or choose another test.`);
        console.log('System notifies facility unavailable, suggests scheduling (Schedule Test - extended use case)');
        return;
      }
      alert(`Facility for ${selectedTestForOrder.name} is available. Test can be scheduled/performed.`);
    }

    const newOrder: PatientTestOrder = {
      id: `pto_${Date.now()}`,
      patientId: selectedPatient.id,
      testId: selectedTestForOrder.id,
      testName: selectedTestForOrder.name,
      orderDate: new Date().toISOString().split('T')[0],
      status: selectedTestForOrder.requiresFacility ? 'Scheduled' : 'Performed', // If no facility, assume performed or ready for results
      scheduledDate: selectedTestForOrder.requiresFacility ? new Date(Date.now() + 86400000).toISOString().split('T')[0] : undefined // Simulate scheduling for next day
    };
    setPatientTestOrders(prev => [...prev, newOrder]);
    setCurrentPatientOrders(prev => [newOrder, ...prev].sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
    alert(`Test '${selectedTestForOrder.name}' ordered for ${selectedPatient.name}. Status: ${newOrder.status}`);
    setSelectedTestForOrder(null); // Reset test selection after ordering
  };

  const openRecordResultModal = (order: PatientTestOrder) => {
    // Simulate Doctor records the test results (Step 5 from flow)
    if (order.status === 'Reviewed & Closed') {
        alert('Results for this test have already been recorded and reviewed.');
        return;
    }
    setTargetOrderForResults(order);
    setResultForm({ resultDate: new Date().toISOString().split('T')[0], recordedByDoctorId: doctorUser?.id || 'doc_unknown' });
    setIsRecordResultModalOpen(true);
  };

  const closeRecordResultModal = () => {
    setIsRecordResultModalOpen(false);
    setTargetOrderForResults(null);
    setResultForm({});
  };

  const handleResultFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    // @ts-ignore for checked property
    const val = type === 'checkbox' ? event.target.checked : value;
    setResultForm(prev => ({ ...(prev || {}), [name]: val }));
  };

  const handleSaveResults = () => {
    if (!targetOrderForResults || !resultForm.summary) {
      alert('Result summary is required.');
      return;
    }
    setIsLoading(true);
    // Simulate Save Results in Patient Record (Step 5.1 from flow)
    const updatedOrder: PatientTestOrder = { 
        ...targetOrderForResults, 
        results: resultForm as TestResult, 
        status: 'Results Recorded' 
    };
    setPatientTestOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setCurrentPatientOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    
    // Simulate Notify Patient of Result Availability (Step 7.1 from flow)
    alert(`Results for ${targetOrderForResults.testName} recorded. Patient ${selectedPatient?.name} will be notified (simulated).`);
    console.log('Notifying patient of result availability...');

    if(resultForm.isCritical) {
        alert('CRITICAL RESULT! Please review immediately and take necessary actions.');
    }

    setIsLoading(false);
    closeRecordResultModal();
  };

  const handleReviewAndConfirm = (order: PatientTestOrder) => {
    // Simulate Doctor reviews the results if needed (Step 6 from flow)
    // Simulate Display detailed results for analysis (Step 6.1 from flow)
    if (!order.results) {
        alert('No results recorded for this test yet.');
        return;
    }
    if (window.confirm(`Review results for ${order.testName}:\nSummary: ${order.results.summary}\nDetails: ${order.results.details || 'N/A'}\n\nConfirm test completion and close this order?`)) {
        const confirmedOrder: PatientTestOrder = { ...order, status: 'Reviewed & Closed' };
        setPatientTestOrders(prev => prev.map(o => o.id === confirmedOrder.id ? confirmedOrder : o));
        setCurrentPatientOrders(prev => prev.map(o => o.id === confirmedOrder.id ? confirmedOrder : o));
        alert(`Test order for ${order.testName} confirmed and closed.`);
    }
  };

  if (!doctorUser) {
    return <div className="p-5 text-center">Loading doctor data...</div>;
  }

  return (
    <>
      <Navbar isDashboard={true} />
      <div className="container mt-4">
        <h2 className="mb-4">Perform Diagnostic Test</h2>
        <div className="row">
          {/* Patient Selection */}
          <div className="col-md-4">
            <h4>1. Select Patient</h4>
            <select className="form-select mb-3" onChange={(e) => handlePatientSelect(e.target.value)} defaultValue="">
              <option value="" disabled>-- Choose a Patient --</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} (DOB: {p.dob})</option>)}
            </select>

            {selectedPatient && (
              <>
                <h4>2. Order New Test for {selectedPatient.name}</h4>
                <div className="mb-3">
                    <label htmlFor="testSelect" className="form-label">Select Test from Catalog:</label>
                    <select 
                        id="testSelect" 
                        className="form-select" 
                        value={selectedTestForOrder?.id || ''} 
                        onChange={(e) => setSelectedTestForOrder(testCatalog.find(t => t.id === e.target.value) || null)}
                    >
                        <option value="" disabled>-- Choose a Test --</option>
                        {testCatalog.map(test => (
                            <option key={test.id} value={test.id}>{test.name} ({test.type})</option>
                        ))}
                    </select>
                </div>
                {selectedTestForOrder && (
                    <div className="alert alert-info p-2 mb-2"><small>Selected: {selectedTestForOrder.name}. Requires Facility: {selectedTestForOrder.requiresFacility ? 'Yes' : 'No'}</small></div>
                )}
                <button className="btn btn-primary w-100" onClick={handleOrderTest} disabled={!selectedTestForOrder || isLoading}>
                    Order Test / Check Facility
                </button>
              </>
            )}
          </div>

          {/* Test Orders & Results Display */}
          <div className="col-md-8">
            {selectedPatient ? (
              <>
                <h4>3. Manage Tests & Results for {selectedPatient.name}</h4>
                {currentPatientOrders.length > 0 ? (
                  <div className="list-group">
                    {currentPatientOrders.map(order => (
                      <div key={order.id} className="list-group-item mb-2 shadow-sm">
                        <div className="d-flex w-100 justify-content-between">
                          <h5 className="mb-1">{order.testName}</h5>
                          <small>Ordered: {order.orderDate}</small>
                        </div>
                        <p className="mb-1"><span className={`badge bg-${order.status === 'Reviewed & Closed' ? 'success' : order.status === 'Results Recorded' ? 'info' : 'warning'}`}>{order.status}</span></p>
                        {order.scheduledDate && <p className="mb-1"><small>Scheduled: {order.scheduledDate}</small></p>}
                        {order.results && (
                          <div className="mt-2 p-2 bg-light rounded border">
                            <h6>Results (Recorded: {order.results.resultDate}):</h6>
                            <p className="mb-1"><strong>Summary:</strong> {order.results.summary}</p>
                            {order.results.details && <p className="mb-1"><small>Details: {order.results.details}</small></p>}
                            {order.results.isCritical && <p className="mb-1 text-danger fw-bold"><i className="bi bi-exclamation-triangle-fill"></i> CRITICAL RESULT</p>}
                          </div>
                        )}
                        <div className="mt-2 text-end">
                          {order.status !== 'Reviewed & Closed' && order.status !== 'Results Recorded' && (
                             <button className="btn btn-sm btn-success me-2" onClick={() => openRecordResultModal(order)} disabled={isLoading}>
                                <i className="bi bi-card-list"></i> Record Results
                            </button>
                          )}
                          {order.status === 'Results Recorded' && (
                            <button className="btn btn-sm btn-info me-2" onClick={() => handleReviewAndConfirm(order)} disabled={isLoading}>
                                <i className="bi bi-check2-circle"></i> Review & Confirm Test
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-light"><i className="bi bi-info-circle"></i> No tests ordered for {selectedPatient.name} yet, or all tests are completed.</div>
                )}
              </>
            ) : (
              <div className="alert alert-info text-center"><i className="bi bi-person-lines-fill fs-3 d-block mb-2"></i>Please select a patient to view their test history or perform a new test.</div>
            )}
          </div>
        </div>

        {/* Record Result Modal */}
        {isRecordResultModalOpen && targetOrderForResults && (
          <div className="modal fade show" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} aria-modal="true" role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Record Results for: {targetOrderForResults.testName} (Patient: {selectedPatient?.name})</h5>
                  <button type="button" className="btn-close" onClick={closeRecordResultModal} disabled={isLoading}></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                        <label htmlFor="resultDate" className="form-label">Result Date</label>
                        <input type="date" className="form-control" id="resultDate" name="resultDate" value={resultForm.resultDate || ''} onChange={handleResultFormChange} disabled={isLoading} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="summary" className="form-label">Result Summary <span className="text-danger">*</span></label>
                        <textarea className="form-control" id="summary" name="summary" rows={3} value={resultForm.summary || ''} onChange={handleResultFormChange} disabled={isLoading} placeholder="Enter a concise summary of the test results..."></textarea>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="details" className="form-label">Detailed Findings (Optional)</label>
                        <textarea className="form-control" id="details" name="details" rows={5} value={resultForm.details || ''} onChange={handleResultFormChange} disabled={isLoading} placeholder="Enter detailed findings, notes, or link to report file..."></textarea>
                    </div>
                    <div className="form-check mb-3">
                        <input className="form-check-input" type="checkbox" id="isCritical" name="isCritical" checked={resultForm.isCritical || false} onChange={handleResultFormChange} disabled={isLoading} />
                        <label className="form-check-label text-danger fw-bold" htmlFor="isCritical">
                            Mark as CRITICAL RESULT
                        </label>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeRecordResultModal} disabled={isLoading}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveResults} disabled={isLoading}>
                    {isLoading ? 'Saving Results...' : 'Save Results'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PerformTestPage; 