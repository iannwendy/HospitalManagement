import React, { useState, useEffect } from 'react';
import { Doctor, TimeSlot } from '../../../types/appointment';

interface Appointment {
  selectedDoctor: Doctor | null;
  selectedSlot: TimeSlot | null;
  appointmentType: string;
  appointmentReason: string;
  notifications: {
    email: boolean;
    sms: boolean;
  };
}

interface ViewAvailableSlotsProps {
  selectedDoctor: Doctor | null;
  selectedSlot: TimeSlot | null;
  onUpdateData: (data: Partial<Appointment>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ViewAvailableSlots: React.FC<ViewAvailableSlotsProps> = ({
  selectedDoctor,
  selectedSlot,
  onUpdateData,
  onNext,
  onBack
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(selectedSlot);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [appointmentReason, setAppointmentReason] = useState<string>('');
  const [showNotificationOptions, setShowNotificationOptions] = useState<boolean>(false);
  const [notifyEmail, setNotifyEmail] = useState<boolean>(true);
  const [notifySMS, setNotifySMS] = useState<boolean>(false);
  const [errors, setErrors] = useState({ appointmentType: '', appointmentReason: '', slotError: '' });

  // Generate dates for the next 7 days
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Get day name (Monday, Tuesday, etc.)
  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Get day and month (e.g., "24 Jul")
  const getDayMonth = (date: Date): string => {
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };

  // Generate time slots for the selected date
  useEffect(() => {
    if (!selectedDate) return;

    // Normally you would fetch available slots from the server based on the doctor and date
    // This is a simulated version
    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' });
    
    // Check if doctor is available on this day
    if (selectedDoctor && selectedDoctor.availability.includes(dayOfWeek)) {
      const slots: TimeSlot[] = [];
      // Generate slots from 9 AM to 4 PM
      for (let hour = 9; hour <= 16; hour++) {
        // Skip lunch hour
        if (hour === 12) continue;
        
        // Fix formatting for hours
        let displayHour = hour;
        let period = 'AM';
        
        if (hour >= 12) {
          period = 'PM';
          if (hour > 12) {
            displayHour = hour - 12;
          }
        }
        
        const timeString = `${displayHour}:00 ${period}`;
        
        // Randomly mark some slots as unavailable
        const available = Math.random() > 0.3;
        
        slots.push({
          id: hour - 8, // Unique ID for the slot
          date: selectedDate,
          time: timeString,
          available: available
        });
      }
      
      // Simulate the case where all slots might be booked
      const allSlotsBooked = Math.random() > 0.9; // 10% chance all slots are booked
      if (allSlotsBooked) {
        slots.forEach(slot => {
          slot.available = false;
        });
      }
      
      setTimeSlots(slots);
    } else {
      // Doctor not available on this day
      setTimeSlots([]);
    }
  }, [selectedDate, selectedDoctor]);

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  // Handle time slot selection
  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    
    // Simulate a rare case where slot becomes unavailable right as user selects it
    // (simulating concurrent booking by another user)
    const slotJustTaken = Math.random() > 0.95; // 5% chance slot was just taken
    
    if (slotJustTaken) {
      // Mark the slot as unavailable
      setTimeSlots(prevSlots => 
        prevSlots.map(s => 
          s.id === slot.id ? { ...s, available: false } : s
        )
      );
      
      // Show error message
      setErrors({
        ...errors,
        slotError: 'This slot was just booked by another patient. Please select a different time.'
      });
      
      return;
    }
    
    // Clear any slot errors
    if (errors.slotError) {
      setErrors({
        ...errors,
        slotError: ''
      });
    }
    
    setSelectedTime(slot);
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors = { 
      appointmentType: '', 
      appointmentReason: '',
      slotError: errors.slotError || '' 
    };
    let isValid = true;
    
    if (!appointmentType) {
      newErrors.appointmentType = 'Please select an appointment type';
      isValid = false;
    }
    
    if (!appointmentReason.trim()) {
      newErrors.appointmentReason = 'Please provide a reason for your appointment';
      isValid = false;
    }
    
    if (newErrors.slotError) {
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Find alternative date suggestions
  const getAlternativeDates = (): string[] => {
    // Find the next 3 available days after the currently selected date
    const alternatives: string[] = [];
    const currentDateObj = selectedDate ? new Date(selectedDate) : new Date();
    
    for (let i = 1; i <= 14 && alternatives.length < 3; i++) {
      const nextDate = new Date(currentDateObj);
      nextDate.setDate(nextDate.getDate() + i);
      
      const dayName = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
      if (selectedDoctor && selectedDoctor.availability.includes(dayName)) {
        alternatives.push(formatDate(nextDate));
      }
    }
    
    return alternatives;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedTime || !validateForm()) return;
    
    onUpdateData({
      selectedSlot: selectedTime,
      appointmentType,
      appointmentReason,
      notifications: { email: notifyEmail, sms: notifySMS }
    });
    
    onNext();
  };

  return (
    <div>
      <h2 className="form-step-title">Choose an Appointment Time</h2>
      
      {selectedDoctor ? (
        <>
          <div className="doctor-summary mb-4">
            <div className="doctor-header">
              <img
                src={selectedDoctor.avatarUrl}
                alt={selectedDoctor.name}
                className="doctor-avatar"
                style={{ width: '60px', height: '60px' }}
              />
              <div className="doctor-info">
                <h5 className="doctor-name">{selectedDoctor.name}</h5>
                <p className="doctor-specialty mb-0">{selectedDoctor.specialty}</p>
              </div>
            </div>
          </div>
          
          <div className="date-selection mb-4">
            <h5 className="mb-3">Select Date</h5>
            <div className="date-scroller">
              <div className="row g-2">
                {nextDays.map((date) => {
                  const dateStr = formatDate(date);
                  const isAvailable = selectedDoctor.availability.includes(getDayName(date));
                  const isSelected = dateStr === selectedDate;
                  
                  return (
                    <div key={dateStr} className="col" style={{ minWidth: '100px' }}>
                      <div
                        className={`date-card text-center p-2 rounded ${isSelected ? 'bg-primary text-white' : ''} ${!isAvailable ? 'bg-light text-muted opacity-50' : ''}`}
                        onClick={() => isAvailable && handleDateSelect(dateStr)}
                        style={{ cursor: isAvailable ? 'pointer' : 'not-allowed' }}
                      >
                        <div className="day-name">{getDayName(date)}</div>
                        <div className="day-date fw-bold">{getDayMonth(date)}</div>
                        {!isAvailable && <small className="d-block mt-1">Unavailable</small>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {selectedDate && (
            <>
              <div className="time-selection mb-4">
                <h5 className="mb-3">Select Time</h5>
                {errors.slotError && (
                  <div className="alert alert-warning mb-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {errors.slotError}
                  </div>
                )}
                
                {timeSlots.length === 0 ? (
                  <div className="alert alert-info">
                    <h5 className="alert-heading">No Available Slots</h5>
                    <p>There are no available slots for this date with Dr. {selectedDoctor.name}.</p>
                    <hr />
                    <p className="mb-0">Here are some alternatives you can try:</p>
                    <ul className="mt-2">
                      <li>Select a different date from the calendar above</li>
                      <li>Go back and select a different doctor</li>
                      {getAlternativeDates().length > 0 && (
                        <li>
                          Try one of these dates when the doctor is available:
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {getAlternativeDates().map(date => (
                              <button 
                                key={date} 
                                className="btn btn-outline-primary btn-sm" 
                                onClick={() => handleDateSelect(date)}
                              >
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </button>
                            ))}
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <>
                    <div className="time-slots-grid">
                      {timeSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`time-slot ${selectedTime?.id === slot.id ? 'selected' : ''} ${!slot.available ? 'unavailable' : ''}`}
                          onClick={() => handleSlotSelect(slot)}
                        >
                          {slot.time}
                        </div>
                      ))}
                    </div>
                    
                    {timeSlots.every(slot => !slot.available) && (
                      <div className="alert alert-info mt-3">
                        <h5 className="alert-heading">All slots are booked</h5>
                        <p>All appointments with Dr. {selectedDoctor.name} on this date have been booked.</p>
                        <p className="mb-0">Please select a different date or doctor.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="appointment-details mb-4">
                <h5 className="mb-3">Appointment Details</h5>
                <div className="form-group mb-3">
                  <label htmlFor="appointmentType" className="form-label">Appointment Type</label>
                  <select
                    id="appointmentType"
                    className={`form-select ${errors.appointmentType ? 'is-invalid' : ''}`}
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  >
                    <option value="">Select appointment type</option>
                    <option value="New Patient">New Patient</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                  {errors.appointmentType && (
                    <div className="invalid-feedback">{errors.appointmentType}</div>
                  )}
                </div>
                
                <div className="form-group mb-3">
                  <label htmlFor="appointmentReason" className="form-label">Reason for Visit</label>
                  <textarea
                    id="appointmentReason"
                    className={`form-control ${errors.appointmentReason ? 'is-invalid' : ''}`}
                    rows={3}
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    placeholder="Briefly describe your symptoms or reason for the appointment"
                  ></textarea>
                  {errors.appointmentReason && (
                    <div className="invalid-feedback">{errors.appointmentReason}</div>
                  )}
                </div>
              </div>
              
              <div className="notification-settings mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">Notification Preferences</h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-link"
                    onClick={() => setShowNotificationOptions(!showNotificationOptions)}
                  >
                    {showNotificationOptions ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {showNotificationOptions && (
                  <div className="card p-3">
                    <div className="notification-option">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="notifyEmail"
                          checked={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="notifyEmail">
                          <div>Email Notifications</div>
                          <div className="notification-description">Receive appointment confirmations and reminders via email</div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="notification-option mt-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="notifySMS"
                          checked={notifySMS}
                          onChange={(e) => setNotifySMS(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="notifySMS">
                          <div>SMS Notifications</div>
                          <div className="notification-description">Receive appointment confirmations and reminders via text message</div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="alert alert-warning">
          <h5 className="alert-heading">Doctor Not Selected</h5>
          <p>Please go back and select a doctor first.</p>
          <button 
            className="btn btn-outline-primary"
            onClick={onBack}
          >
            Back to Doctor Selection
          </button>
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
          onClick={handleSubmit}
          disabled={!selectedTime || !appointmentType || !appointmentReason}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default ViewAvailableSlots; 