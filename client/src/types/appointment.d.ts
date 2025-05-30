// Type definitions for appointment-related interfaces
export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  avatarUrl: string;
  availability: string;
  rating: number;
  department?: string;
}

export interface TimeSlot {
  id: number;
  date: string;
  time: string;
  available: boolean;
}

export interface PatientInfo {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  healthInsurance: string;
}

export interface AppointmentData {
  patientInfo: PatientInfo;
  selectedDoctor: Doctor | null;
  selectedSlot: TimeSlot | null;
  appointmentType: string;
  appointmentReason: string;
  notifications: {
    email: boolean;
    sms: boolean;
  };
}

export interface Department {
  id: number;
  name: string;
  description: string;
  iconClass: string;
} 