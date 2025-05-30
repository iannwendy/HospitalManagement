import { Doctor, Department } from '../types/appointment';

// This simulates a database of real doctors
const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Nguyễn Thị Minh',
    specialty: 'Cardiology',
    experience: '15 years',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    availability: 'Mon, Wed, Fri',
    rating: 4.8,
    department: 'Cardiology'
  },
  {
    id: 2,
    name: 'Dr. Trần Văn Đức',
    specialty: 'Cardiology',
    experience: '18 years',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    availability: 'Tue, Wed, Thu',
    rating: 4.7,
    department: 'Cardiology'
  },
  {
    id: 3,
    name: 'Dr. Lê Hoàng Long',
    specialty: 'Neurology',
    experience: '12 years',
    avatarUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
    availability: 'Tue, Thu',
    rating: 4.7,
    department: 'Neurology'
  },
  {
    id: 4,
    name: 'Dr. Phạm Thu Hà',
    specialty: 'Pediatrics',
    experience: '8 years',
    avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
    availability: 'Mon, Tue, Thu',
    rating: 4.9,
    department: 'Pediatrics'
  },
  {
    id: 5,
    name: 'Dr. Vũ Quang Minh',
    specialty: 'Pediatrics',
    experience: '14 years',
    avatarUrl: 'https://randomuser.me/api/portraits/men/55.jpg',
    availability: 'Mon, Wed, Fri',
    rating: 4.6,
    department: 'Pediatrics'
  },
  {
    id: 6,
    name: 'Dr. Đặng Thị Lan',
    specialty: 'Orthopedics',
    experience: '20 years',
    avatarUrl: 'https://randomuser.me/api/portraits/women/26.jpg',
    availability: 'Wed, Fri',
    rating: 4.6,
    department: 'Orthopedics'
  },
  {
    id: 7,
    name: 'Dr. Hoàng Minh Tuấn',
    specialty: 'Dermatology',
    experience: '10 years',
    avatarUrl: 'https://randomuser.me/api/portraits/men/25.jpg',
    availability: 'Mon, Thu, Fri',
    rating: 4.5,
    department: 'Dermatology'
  }
];

// Departments with appropriate icons
const mockDepartments: Department[] = [
  {
    id: 1,
    name: 'Cardiology',
    description: 'Heart and cardiovascular system specialists',
    iconClass: 'bi-heart-pulse'
  },
  {
    id: 2,
    name: 'Neurology',
    description: 'Brain, spine and nervous system specialists',
    iconClass: 'bi-activity'
  },
  {
    id: 3,
    name: 'Pediatrics',
    description: 'Child and adolescent health specialists',
    iconClass: 'bi-emoji-smile'
  },
  {
    id: 4,
    name: 'Orthopedics',
    description: 'Bone, joint and muscle specialists',
    iconClass: 'bi-bandaid'
  },
  {
    id: 5,
    name: 'Dermatology',
    description: 'Skin, hair and nail specialists',
    iconClass: 'bi-eye'
  }
];

// Function to simulate getting doctors from the database
export const getDoctors = async (): Promise<Doctor[]> => {
  // This simulates an API call delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDoctors), 800);
  });
};

// Function to simulate getting departments from the database
export const getDepartments = async (): Promise<Department[]> => {
  // This simulates an API call delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockDepartments), 600);
  });
};

// Function to count doctors by department
export const countDoctorsByDepartment = (departmentName: string): number => {
  return mockDoctors.filter(doctor => doctor.department === departmentName).length;
};

// In the future, you would replace these functions with actual API calls
// Example:
// export const getDoctors = async (): Promise<Doctor[]> => {
//   const response = await fetch('/api/doctors');
//   if (!response.ok) {
//     throw new Error('Failed to fetch doctors');
//   }
//   return response.json();
// }; 