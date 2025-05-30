export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient' | 'staff';
  status: 'active' | 'inactive' | 'pending';
  dateJoined: string;
  lastLogin: string;
  phoneNumber: string;
  department?: string;
  specialization?: string;
} 