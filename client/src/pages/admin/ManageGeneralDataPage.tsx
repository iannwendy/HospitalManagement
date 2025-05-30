import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import '../../assets/appointments.css';

interface Department {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  headDoctor: {
    id: string;
    name: string;
  };
  staffCount: number;
  lastUpdated: string;
}

interface Service {
  id: string;
  name: string;
  department: string;
  description: string;
  cost: number;
  duration: string;
  status: 'Available' | 'Unavailable' | 'Limited';
  lastUpdated: string;
}

interface Equipment {
  id: string;
  name: string;
  department: string;
  status: 'Operational' | 'Under Maintenance' | 'Out of Service';
  lastMaintenance: string;
  nextMaintenance: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

type DepartmentStatus = Department['status'];
type ServiceStatus = Service['status'];
type EquipmentStatus = Equipment['status'];

// Mock data
const mockDepartments: Department[] = [
  {
    id: 'DEP001',
    name: 'Cardiology',
    description: 'Specialized in heart and cardiovascular diseases',
    status: 'Active',
    headDoctor: {
      id: 'D001',
      name: 'Dr. Michael Brown'
    },
    staffCount: 15,
    lastUpdated: '2024-03-15'
  },
  {
    id: 'DEP002',
    name: 'Pediatrics',
    description: 'Child healthcare and development',
    status: 'Active',
    headDoctor: {
      id: 'D005',
      name: 'Dr. Sarah Wilson'
    },
    staffCount: 12,
    lastUpdated: '2024-03-16'
  }
];

const mockServices: Service[] = [
  {
    id: 'SRV001',
    name: 'Cardiac Consultation',
    department: 'Cardiology',
    description: 'Initial heart health assessment and consultation',
    cost: 150.00,
    duration: '45 minutes',
    status: 'Available',
    lastUpdated: '2024-03-15'
  },
  {
    id: 'SRV002',
    name: 'Pediatric Check-up',
    department: 'Pediatrics',
    description: 'Regular child health check-up and vaccination',
    cost: 100.00,
    duration: '30 minutes',
    status: 'Available',
    lastUpdated: '2024-03-16'
  }
];

const mockEquipment: Equipment[] = [
  {
    id: 'EQP001',
    name: 'ECG Machine',
    department: 'Cardiology',
    status: 'Operational',
    lastMaintenance: '2024-02-15',
    nextMaintenance: '2024-05-15',
    condition: 'Excellent'
  },
  {
    id: 'EQP002',
    name: 'Pediatric Ventilator',
    department: 'Pediatrics',
    status: 'Under Maintenance',
    lastMaintenance: '2024-03-10',
    nextMaintenance: '2024-03-20',
    condition: 'Good'
  }
];

type FilteredDataType = Department | Service | Equipment;

const ManageGeneralDataPage: React.FC = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'departments' | 'services' | 'equipment'>('departments');
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [message, setMessage] = useState<Message | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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

  const handleStatusUpdate = (type: 'department' | 'service' | 'equipment', id: string, newStatus: DepartmentStatus | ServiceStatus | EquipmentStatus) => {
    switch (type) {
      case 'department':
        setDepartments(prev => prev.map(dept => 
          dept.id === id ? { ...dept, status: newStatus as DepartmentStatus } : dept
        ));
        break;
      case 'service':
        setServices(prev => prev.map(service => 
          service.id === id ? { ...service, status: newStatus as ServiceStatus } : service
        ));
        break;
      case 'equipment':
        setEquipment(prev => prev.map(equip => 
          equip.id === id ? { ...equip, status: newStatus as EquipmentStatus } : equip
        ));
        break;
    }
    setMessage({ type: 'success', text: 'Status updated successfully' });
  };

  const filteredData = (): FilteredDataType[] => {
    const searchLower = searchTerm.toLowerCase();
    switch (activeTab) {
      case 'departments':
        return departments.filter(dept => 
          (filterStatus === 'all' || dept.status.toLowerCase() === filterStatus) &&
          (dept.name.toLowerCase().includes(searchLower) || 
           dept.description.toLowerCase().includes(searchLower) ||
           dept.headDoctor.name.toLowerCase().includes(searchLower))
        );
      case 'services':
        return services.filter(service => 
          (filterStatus === 'all' || service.status.toLowerCase() === filterStatus) &&
          (service.name.toLowerCase().includes(searchLower) || 
           service.department.toLowerCase().includes(searchLower) ||
           service.description.toLowerCase().includes(searchLower))
        );
      case 'equipment':
        return equipment.filter(equip => 
          (filterStatus === 'all' || equip.status.toLowerCase() === filterStatus) &&
          (equip.name.toLowerCase().includes(searchLower) || 
           equip.department.toLowerCase().includes(searchLower))
        );
      default:
        return [];
    }
  };

  // Type guard functions
  const isDepartment = (item: FilteredDataType): item is Department => {
    return 'headDoctor' in item;
  };

  const isService = (item: FilteredDataType): item is Service => {
    return 'cost' in item;
  };

  const isEquipment = (item: FilteredDataType): item is Equipment => {
    return 'condition' in item;
  };

  if (!adminUser) {
    return <div className="p-5 text-center">Loading admin data...</div>;
  }

  return (
    <div className="booking-container">
      <Navbar isDashboard={false} />
      
      <div className="booking-header">
        <div className="container py-4">
          <h1>Manage General Data</h1>
          <p className="text-white-50">Manage hospital departments, services, and equipment</p>
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

          <div className="tabs-container mb-4">
            <div className="nav nav-tabs">
              <button 
                className={`nav-link ${activeTab === 'departments' ? 'active' : ''}`}
                onClick={() => setActiveTab('departments')}
              >
                Departments
              </button>
              <button 
                className={`nav-link ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                Services
              </button>
              <button 
                className={`nav-link ${activeTab === 'equipment' ? 'active' : ''}`}
                onClick={() => setActiveTab('equipment')}
              >
                Equipment
              </button>
            </div>
          </div>

          <div className="filters mb-4">
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
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
                  {activeTab === 'departments' && (
                    <>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </>
                  )}
                  {activeTab === 'services' && (
                    <>
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                      <option value="limited">Limited</option>
                    </>
                  )}
                  {activeTab === 'equipment' && (
                    <>
                      <option value="operational">Operational</option>
                      <option value="under maintenance">Under Maintenance</option>
                      <option value="out of service">Out of Service</option>
                    </>
                  )}
                </select>
              </div>
              <div className="col-md-3">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => setShowAddModal(true)}
                >
                  Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
                </button>
              </div>
            </div>
          </div>

          <div className="data-list">
            {activeTab === 'departments' && filteredData().filter(isDepartment).map((dept) => (
              <div key={dept.id} className={`data-item ${dept.status.toLowerCase()}`}>
                <div className="data-header">
                  <div className="main-info">
                    <h4>{dept.name}</h4>
                    <p className="text-muted mb-0">ID: {dept.id}</p>
                  </div>
                  <div className={`status-badge status-${dept.status.toLowerCase()}`}>
                    {dept.status}
                  </div>
                </div>

                <div className="data-details">
                  <div className="description-info">
                    <h6>Description</h6>
                    <p className="mb-0">{dept.description}</p>
                  </div>
                  <div className="head-doctor-info">
                    <h6>Head Doctor</h6>
                    <p className="mb-0">{dept.headDoctor.name}</p>
                    <p className="text-muted mb-0">Staff Count: {dept.staffCount}</p>
                  </div>
                  <div className="update-info">
                    <h6>Last Updated</h6>
                    <p className="mb-0">{dept.lastUpdated}</p>
                  </div>
                </div>

                <div className="data-actions">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleStatusUpdate('department', dept.id, dept.status === 'Active' ? 'Inactive' : 'Active')}
                  >
                    Toggle Status
                  </button>
                  <button className="btn btn-outline-secondary btn-sm">
                    Edit Details
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'services' && filteredData().filter(isService).map((service) => (
              <div key={service.id} className={`data-item ${service.status.toLowerCase()}`}>
                <div className="data-header">
                  <div className="main-info">
                    <h4>{service.name}</h4>
                    <p className="text-muted mb-0">Department: {service.department}</p>
                  </div>
                  <div className={`status-badge status-${service.status.toLowerCase()}`}>
                    {service.status}
                  </div>
                </div>

                <div className="data-details">
                  <div className="description-info">
                    <h6>Description</h6>
                    <p className="mb-0">{service.description}</p>
                  </div>
                  <div className="service-info">
                    <h6>Details</h6>
                    <p className="mb-0">Cost: ${service.cost}</p>
                    <p className="mb-0">Duration: {service.duration}</p>
                  </div>
                  <div className="update-info">
                    <h6>Last Updated</h6>
                    <p className="mb-0">{service.lastUpdated}</p>
                  </div>
                </div>

                <div className="data-actions">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleStatusUpdate('service', service.id, 
                      service.status === 'Available' ? 'Unavailable' : 
                      service.status === 'Unavailable' ? 'Limited' : 'Available'
                    )}
                  >
                    Change Status
                  </button>
                  <button className="btn btn-outline-secondary btn-sm">
                    Edit Details
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'equipment' && filteredData().filter(isEquipment).map((equip) => (
              <div key={equip.id} className={`data-item ${equip.status.toLowerCase().replace(' ', '-')}`}>
                <div className="data-header">
                  <div className="main-info">
                    <h4>{equip.name}</h4>
                    <p className="text-muted mb-0">Department: {equip.department}</p>
                  </div>
                  <div className={`status-badge status-${equip.status.toLowerCase().replace(' ', '-')}`}>
                    {equip.status}
                  </div>
                </div>

                <div className="data-details">
                  <div className="maintenance-info">
                    <h6>Maintenance Schedule</h6>
                    <p className="mb-0">Last: {equip.lastMaintenance}</p>
                    <p className="mb-0">Next: {equip.nextMaintenance}</p>
                  </div>
                  <div className="condition-info">
                    <h6>Condition</h6>
                    <p className={`mb-0 condition-${equip.condition.toLowerCase()}`}>
                      {equip.condition}
                    </p>
                  </div>
                </div>

                <div className="data-actions">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleStatusUpdate('equipment', equip.id,
                      equip.status === 'Operational' ? 'Under Maintenance' :
                      equip.status === 'Under Maintenance' ? 'Out of Service' : 'Operational'
                    )}
                  >
                    Change Status
                  </button>
                  <button className="btn btn-outline-secondary btn-sm">
                    Schedule Maintenance
                  </button>
                </div>
              </div>
            ))}

            {filteredData().length === 0 && (
              <div className="text-center p-5">
                <h3 className="text-muted">No {activeTab} found</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .tabs-container {
          background: white;
          border-radius: 8px 8px 0 0;
          padding: 1rem 1rem 0;
        }

        .nav-tabs {
          border-bottom: none;
        }

        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          padding: 1rem 2rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .nav-tabs .nav-link:hover {
          color: #3a7ca5;
        }

        .nav-tabs .nav-link.active {
          color: #3a7ca5;
          border-bottom: 2px solid #3a7ca5;
        }

        .filters {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .data-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }

        .data-item {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
        }

        .data-item:hover {
          border-color: #3a7ca5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .data-item.active,
        .data-item.available,
        .data-item.operational {
          border-left: 4px solid #28a745;
        }

        .data-item.inactive,
        .data-item.unavailable,
        .data-item.out-of-service {
          border-left: 4px solid #dc3545;
        }

        .data-item.limited,
        .data-item.under-maintenance {
          border-left: 4px solid #ffc107;
        }

        .data-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .main-info h4 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
          color: #2c3e50;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-active,
        .status-available,
        .status-operational {
          background-color: #d4edda;
          color: #155724;
        }

        .status-inactive,
        .status-unavailable,
        .status-out-of-service {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status-limited,
        .status-under-maintenance {
          background-color: #fff3cd;
          color: #856404;
        }

        .data-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          padding: 1rem 0;
          border-top: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
        }

        .data-details h6 {
          font-size: 0.875rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .condition-excellent {
          color: #28a745;
        }

        .condition-good {
          color: #17a2b8;
        }

        .condition-fair {
          color: #ffc107;
        }

        .condition-poor {
          color: #dc3545;
        }

        .data-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .nav-tabs .nav-link {
            padding: 0.75rem 1rem;
          }

          .data-header {
            flex-direction: column;
            gap: 1rem;
          }

          .data-details {
            grid-template-columns: 1fr;
          }

          .data-actions {
            flex-direction: column;
          }

          .data-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageGeneralDataPage; 