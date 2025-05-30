import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import '../../assets/appointments.css';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  reason: string;
  status: 'Scheduled' | 'Rescheduled' | 'Cancelled' | 'Completed';
  doctor: {
    id: string;
    name: string;
    department: string;
  };
  notes?: string;
}

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: 'APT001',
    patientName: 'John Smith',
    patientId: 'P001',
    date: '2024-03-20',
    time: '09:00',
    reason: 'Regular Check-up',
    status: 'Scheduled',
    doctor: {
      id: 'D001',
      name: 'Dr. Sarah Wilson',
      department: 'General Medicine'
    }
  },
  {
    id: 'APT002',
    patientName: 'Mary Johnson',
    patientId: 'P002',
    date: '2024-03-20',
    time: '10:30',
    reason: 'Follow-up Consultation',
    status: 'Rescheduled',
    doctor: {
      id: 'D002',
      name: 'Dr. Michael Brown',
      department: 'Cardiology'
    },
    notes: 'Patient requested rescheduling due to personal emergency'
  },
  {
    id: 'APT003',
    patientName: 'Robert Davis',
    patientId: 'P003',
    date: '2024-03-20',
    time: '14:00',
    reason: 'Post-operative Check',
    status: 'Completed',
    doctor: {
      id: 'D003',
      name: 'Dr. Emily Chen',
      department: 'Surgery'
    },
    notes: 'Recovery progressing well'
  }
];

const ManageAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [nurseUser, setNurseUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleRescheduleAppointment = (appointmentId: string, newDate: string, newTime: string) => {
    setAppointments(prev => prev.map(app => {
      if (app.id === appointmentId) {
        return {
          ...app,
          date: newDate,
          time: newTime,
          status: 'Rescheduled'
        };
      }
      return app;
    }));
    setShowRescheduleModal(false);
    setMessage({ type: 'success', text: 'Appointment rescheduled successfully' });
  };

  const handleCancelAppointment = (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments(prev => prev.map(app => {
        if (app.id === appointmentId) {
          return {
            ...app,
            status: 'Cancelled'
          };
        }
        return app;
      }));
      setMessage({ type: 'success', text: 'Appointment cancelled successfully' });
    }
  };

  const handleMarkAsCompleted = (appointmentId: string) => {
    setAppointments(prev => prev.map(app => {
      if (app.id === appointmentId) {
        return {
          ...app,
          status: 'Completed'
        };
      }
      return app;
    }));
    setMessage({ type: 'success', text: 'Appointment marked as completed' });
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || app.date === dateFilter;
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  if (!nurseUser) {
    return <div className="p-5 text-center">Loading nurse data...</div>;
  }

  return (
    <div className="booking-container">
      <Navbar isDashboard={false} />
      
      <div className="booking-header">
        <div className="container py-4">
          <h1>Manage Appointments</h1>
          <p className="text-white-50">View and manage patient appointments</p>
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
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by patient or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="appointments-list">
            {filteredAppointments.map(appointment => (
              <div 
                key={appointment.id} 
                className={`appointment-item ${appointment.status.toLowerCase()} ${selectedAppointment?.id === appointment.id ? 'selected' : ''}`}
                onClick={() => handleSelectAppointment(appointment)}
              >
                <div className="appointment-header">
                  <div className="patient-info">
                    <h4>{appointment.patientName}</h4>
                    <p className="text-muted mb-0">ID: {appointment.patientId}</p>
                  </div>
                  <div className="appointment-time">
                    <h5>{appointment.date}</h5>
                    <p className="text-muted mb-0">{appointment.time}</p>
                  </div>
                  <div className="appointment-status">
                    <span className={`status-badge status-${appointment.status.toLowerCase()}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>

                <div className="appointment-details">
                  <div className="doctor-info">
                    <h6>Doctor</h6>
                    <p className="mb-0">{appointment.doctor.name}</p>
                    <p className="text-muted mb-0">{appointment.doctor.department}</p>
                  </div>
                  <div className="reason-info">
                    <h6>Reason</h6>
                    <p className="mb-0">{appointment.reason}</p>
                  </div>
                  {appointment.notes && (
                    <div className="notes-info">
                      <h6>Notes</h6>
                      <p className="mb-0">{appointment.notes}</p>
                    </div>
                  )}
                </div>

                <div className="appointment-actions">
                  {appointment.status === 'Scheduled' && (
                    <>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setShowRescheduleModal(true)}
                      >
                        Reschedule
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleMarkAsCompleted(appointment.id)}
                      >
                        Mark as Completed
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {appointment.status === 'Rescheduled' && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleMarkAsCompleted(appointment.id)}
                      >
                        Mark as Completed
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {filteredAppointments.length === 0 && (
              <div className="text-center p-5">
                <h3 className="text-muted">No appointments found</h3>
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

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }

        .appointment-item {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
        }

        .appointment-item:hover {
          border-color: #3a7ca5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .appointment-item.selected {
          border-color: #3a7ca5;
          background-color: rgba(58, 124, 165, 0.05);
        }

        .appointment-item.scheduled {
          border-left: 4px solid #ffc107;
        }

        .appointment-item.rescheduled {
          border-left: 4px solid #fd7e14;
        }

        .appointment-item.completed {
          border-left: 4px solid #28a745;
        }

        .appointment-item.cancelled {
          border-left: 4px solid #dc3545;
        }

        .appointment-header {
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

        .appointment-time h5 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
          color: #2c3e50;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-scheduled {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-rescheduled {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-completed {
          background-color: #d4edda;
          color: #155724;
        }

        .status-cancelled {
          background-color: #f8d7da;
          color: #721c24;
        }

        .appointment-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          padding: 1rem 0;
          border-top: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
        }

        .appointment-details h6 {
          font-size: 0.875rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .appointment-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .appointment-header {
            flex-direction: column;
            gap: 1rem;
          }

          .appointment-time {
            text-align: left;
          }

          .appointment-details {
            grid-template-columns: 1fr;
          }

          .appointment-actions {
            flex-direction: column;
          }

          .appointment-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageAppointmentsPage; 