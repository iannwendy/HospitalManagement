import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
// import './ManageStaffSchedulePage.css'; // Optional

// Mock Data Interfaces
interface StaffMember {
  id: string;
  name: string;
  role: 'Doctor' | 'Nurse' | 'Receptionist';
  department: string;
}

interface Shift {
  id: string;
  staffId: string;
  staffName?: string; // For display purposes
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:MM (24-hour)
  endTime: string;     // HH:MM (24-hour)
  notes?: string;
}

// Mock Data
const mockStaff: StaffMember[] = [
  { id: 'staff_001', name: 'Dr. Alice Wonderland', role: 'Doctor', department: 'Cardiology' },
  { id: 'staff_002', name: 'Nurse Bob The Builder', role: 'Nurse', department: 'Pediatrics' },
  { id: 'staff_003', name: 'Dr. Carol Danvers', role: 'Doctor', department: 'Oncology' },
  { id: 'staff_004', name: 'Nurse David Copperfield', role: 'Nurse', department: 'Cardiology' },
  { id: 'staff_005', name: 'Receptionist Eve Moneypenny', role: 'Receptionist', department: 'Front Desk' },
];

const mockSchedules: Shift[] = [
  { id: 'shift_001', staffId: 'staff_001', date: '2024-08-05', startTime: '09:00', endTime: '17:00', notes: 'Morning Round' },
  { id: 'shift_002', staffId: 'staff_002', date: '2024-08-05', startTime: '08:00', endTime: '16:00' },
  { id: 'shift_003', staffId: 'staff_004', date: '2024-08-05', startTime: '15:00', endTime: '23:00', notes: 'Evening Shift' },
  { id: 'shift_004', staffId: 'staff_001', date: '2024-08-06', startTime: '09:00', endTime: '13:00', notes: 'OPD Coverage' },
];

const ManageStaffSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>(mockStaff);
  const [schedules, setSchedules] = useState<Shift[]>(mockSchedules);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffShifts, setStaffShifts] = useState<Shift[]>([]);

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<Partial<Shift> | null>(null); // For add/edit
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    const userData = getCurrentUser();
    if (!userData || userData.role !== 'admin') {
      logout();
      navigate('/admin/login');
      return;
    }
    setAdminUser(userData);
  }, [navigate]);

  const handleSelectStaff = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    if (staff) {
      setSelectedStaff(staff);
      setStaffShifts(schedules.filter(sh => sh.staffId === staffId).sort((a,b) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime()));
    } else {
      setSelectedStaff(null);
      setStaffShifts([]);
    }
  };

  const openShiftModal = (shift?: Shift, staffMember?: StaffMember) => {
    if (shift) {
      setCurrentShift(shift);
    } else if (staffMember) {
      setCurrentShift({ staffId: staffMember.id, date: new Date().toISOString().split('T')[0] }); // Default to selected staff and today
    } else {
      setCurrentShift({ date: new Date().toISOString().split('T')[0] }); // Default to today, staff needs to be selected in modal
    }
    setIsShiftModalOpen(true);
  };

  const closeShiftModal = () => {
    setIsShiftModalOpen(false);
    setCurrentShift(null);
  };

  const handleShiftFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setCurrentShift(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const validateShift = (shiftToValidate: Partial<Shift>): boolean => {
    if (!shiftToValidate.staffId || !shiftToValidate.date || !shiftToValidate.startTime || !shiftToValidate.endTime) {
        alert('Staff, Date, Start Time, and End Time are required.');
        return false;
    }
    // Basic conflict check: does this staff member have another shift overlapping this one?
    const newShiftStart = new Date(`${shiftToValidate.date}T${shiftToValidate.startTime}`).getTime();
    const newShiftEnd = new Date(`${shiftToValidate.date}T${shiftToValidate.endTime}`).getTime();

    if (newShiftStart >= newShiftEnd) {
        alert('End time must be after start time.');
        return false;
    }

    const conflictingShift = schedules.find(s => 
        s.staffId === shiftToValidate.staffId &&
        s.id !== shiftToValidate.id && // Exclude the current shift if editing
        s.date === shiftToValidate.date &&
        newShiftStart < new Date(`${s.date}T${s.endTime}`).getTime() &&
        newShiftEnd > new Date(`${s.date}T${s.startTime}`).getTime()
    );

    if (conflictingShift) {
        alert(`Schedule Conflict: This staff member already has a shift from ${conflictingShift.startTime} to ${conflictingShift.endTime} on this date. Please adjust shift.`);
        return false;
    }
    return true;
  };

  const handleSaveShift = () => {
    if (!currentShift) return;

    if (!validateShift(currentShift)) return; // Validate Schedule

    setIsLoading(true);
    const staffMember = staffList.find(s => s.id === currentShift.staffId);

    if (currentShift.id) { // Existing shift
      setSchedules(prev => prev.map(s => s.id === currentShift.id ? { ...s, ...currentShift } as Shift : s));
    } else { // New shift
      const newShiftWithId: Shift = { ...currentShift, id: `shift_${Date.now()}` } as Shift;
      setSchedules(prev => [...prev, newShiftWithId]);
    }

    // Refresh selected staff's shifts if they are being viewed
    if (selectedStaff && selectedStaff.id === currentShift.staffId) {
        setStaffShifts(schedules.filter(sh => sh.staffId === selectedStaff.id).sort((a,b) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime()));
    }
    
    // Simulate Notify Staff
    alert(`Shift for ${staffMember?.name || 'Staff'} on ${currentShift.date} from ${currentShift.startTime} to ${currentShift.endTime} has been ${currentShift.id ? 'updated' : 'added'}. Staff will be notified (simulated).`);
    
    console.log('Simulating saving updated schedule to the system...');
    setIsLoading(false);
    closeShiftModal();
  };

  const handleDeleteShift = (shiftId: string) => {
    if (window.confirm('Are you sure you want to delete this shift?')){
        const shiftToDelete = schedules.find(s => s.id === shiftId);
        setSchedules(prev => prev.filter(s => s.id !== shiftId));
        if (selectedStaff && shiftToDelete && selectedStaff.id === shiftToDelete.staffId) {
            setStaffShifts(prev => prev.filter(s => s.id !== shiftId));
        }
        alert('Shift deleted. Staff will be notified (simulated).');
    }
  };
  
  if (!adminUser) {
    return <div className="p-5 text-center">Loading admin data...</div>;
  }

  return (
    <>
      <Navbar isDashboard={true} />
      <div className="container mt-4">
        <h2 className="mb-4">Manage Staff Schedule</h2>

        <div className="row">
          {/* Staff Selection & Actions */}
          <div className="col-md-4">
            <h4>Select Staff</h4>
            <div className="mb-3">
              <select className="form-select" onChange={(e) => handleSelectStaff(e.target.value)} defaultValue="">
                <option value="" disabled>-- Select a Staff Member --</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.name} ({staff.role} - {staff.department})</option>
                ))}
              </select>
            </div>
            {selectedStaff && (
              <button className="btn btn-primary w-100 mb-3" onClick={() => openShiftModal(undefined, selectedStaff)}>
                Add New Shift for {selectedStaff.name}
              </button>
            )}
             <button className="btn btn-outline-success w-100" onClick={() => alert('All schedule updates confirmed and system refreshed (simulated)!')}>Confirm All Schedule Updates</button>
          </div>

          {/* Staff Schedule Display */}
          <div className="col-md-8">
            {selectedStaff ? (
              <>
                <h4>Schedule for: <span className="text-primary">{selectedStaff.name}</span></h4>
                {staffShifts.length > 0 ? (
                  <ul className="list-group">
                    {staffShifts.map(shift => (
                      <li key={shift.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{shift.date}</strong>: {shift.startTime} - {shift.endTime}
                          {shift.notes && <small className="d-block text-muted">Notes: {shift.notes}</small>}
                        </div>
                        <div>
                          <button className="btn btn-sm btn-outline-warning me-2" onClick={() => openShiftModal(shift)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteShift(shift.id)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="alert alert-info">No shifts scheduled for {selectedStaff.name}.</div>
                )}
              </>
            ) : (
              <div className="alert alert-light text-center">
                <i className="bi bi-calendar3 fs-3 d-block mb-2"></i>
                Please select a staff member to view or manage their schedule.
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Shift Modal */}
        {isShiftModalOpen && currentShift && (
          <div className="modal fade show" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} aria-modal="true" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{currentShift.id ? 'Edit Shift' : 'Add New Shift'}</h5>
                  <button type="button" className="btn-close" onClick={closeShiftModal} disabled={isLoading}></button>
                </div>
                <div className="modal-body">
                  <form>
                    {!currentShift.id && !selectedStaff && (
                         <div className="mb-3">
                            <label htmlFor="staffId" className="form-label">Staff Member</label>
                            <select id="staffId" name="staffId" className="form-select" value={currentShift.staffId || ''} onChange={handleShiftFormChange} disabled={isLoading || !!currentShift.id}>
                                <option value="" disabled>-- Select Staff --</option>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    )}
                     { (currentShift.id || selectedStaff) && currentShift.staffId &&
                        <p><strong>Staff:</strong> {staffList.find(s=>s.id === currentShift.staffId)?.name}</p>
                     }
                    <div className="mb-3">
                      <label htmlFor="date" className="form-label">Date</label>
                      <input type="date" className="form-control" id="date" name="date" value={currentShift.date || ''} onChange={handleShiftFormChange} disabled={isLoading} />
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="startTime" className="form-label">Start Time</label>
                            <input type="time" className="form-control" id="startTime" name="startTime" value={currentShift.startTime || ''} onChange={handleShiftFormChange} disabled={isLoading} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="endTime" className="form-label">End Time</label>
                            <input type="time" className="form-control" id="endTime" name="endTime" value={currentShift.endTime || ''} onChange={handleShiftFormChange} disabled={isLoading} />
                        </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="notes" className="form-label">Notes (Optional)</label>
                      <textarea className="form-control" id="notes" name="notes" rows={2} value={currentShift.notes || ''} onChange={handleShiftFormChange} disabled={isLoading}></textarea>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeShiftModal} disabled={isLoading}>Close</button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveShift} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Shift'}
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

export default ManageStaffSchedulePage; 