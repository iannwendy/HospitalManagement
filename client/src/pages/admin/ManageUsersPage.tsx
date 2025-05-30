import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import UserFormModal from '../../components/users/UserFormModal';
import ConfirmDialog from '../../components/users/ConfirmDialog';
import { User } from '../../types/user';
import '../../assets/appointments.css';

interface Message {
  type: 'success' | 'error';
  text: string;
}

// Mock data for development
const mockUsers: User[] = [
  {
    id: 'USR001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@hospital.com',
    role: 'doctor',
    status: 'active',
    dateJoined: '2024-01-15',
    lastLogin: '2024-03-20',
    phoneNumber: '+1234567890',
    department: 'Cardiology',
    specialization: 'Cardiologist'
  },
  {
    id: 'USR002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@hospital.com',
    role: 'patient',
    status: 'active',
    dateJoined: '2024-02-01',
    lastLogin: '2024-03-19',
    phoneNumber: '+1234567891'
  },
  {
    id: 'USR003',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.j@hospital.com',
    role: 'staff',
    status: 'active',
    dateJoined: '2024-01-20',
    lastLogin: '2024-03-20',
    phoneNumber: '+1234567892',
    department: 'Administration'
  }
];

const ManageUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [message, setMessage] = useState<Message | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleStatusChange = (userId: string, newStatus: User['status']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    setMessage({ type: 'success', text: 'User status updated successfully' });
  };

  const getRoleBadgeClass = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-danger';
      case 'doctor': return 'bg-primary';
      case 'staff': return 'bg-success';
      case 'patient': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const getStatusBadgeClass = (status: User['status']) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'inactive': return 'bg-danger';
      case 'pending': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  const handleAddUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: `USR${String(users.length + 1).padStart(3, '0')}`,
      dateJoined: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0],
      ...userData
    } as User;

    setUsers(prev => [...prev, newUser]);
    setShowAddModal(false);
    setMessage({ type: 'success', text: 'User added successfully' });
  };

  const handleEditUser = (userData: Partial<User>) => {
    if (!selectedUser) return;

    setUsers(prev => prev.map(user => 
      user.id === selectedUser.id ? { ...user, ...userData } : user
    ));
    setSelectedUser(null);
    setMessage({ type: 'success', text: 'User updated successfully' });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
    setSelectedUser(null);
    setShowConfirmDialog(false);
    setMessage({ type: 'success', text: 'User deleted successfully' });
  };

  if (!adminUser) {
    return <div className="p-5 text-center">Loading admin data...</div>;
  }

  return (
    <div className="booking-container">
      <Navbar isDashboard={false} />
      
      <div className="booking-header">
        <div className="container py-4">
          <h1>Manage Users</h1>
          <p className="text-white-50">Manage all system users including doctors, staff, and patients</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="card shadow-sm">
          <div className="card-body">
            {message && (
              <div className={`alert alert-${message.type} alert-dismissible fade show`}>
                {message.text}
                <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
              </div>
            )}

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="staff">Staff</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="col-md-2">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => setShowAddModal(true)}
                >
                  Add User
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Department</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="user-avatar me-2">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <div className="fw-bold">{`${user.firstName} ${user.lastName}`}</div>
                            <small className="text-muted">{user.phoneNumber}</small>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td>{user.department || '-'}</td>
                      <td>
                        <div>{new Date(user.lastLogin).toLocaleDateString()}</div>
                        <small className="text-muted">
                          {new Date(user.lastLogin).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setSelectedUser(user)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowConfirmDialog(true);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-5">
                <h4 className="text-muted">No users found</h4>
                <p className="text-muted">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <UserFormModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        title="Add New User"
      />

      <UserFormModal
        show={!!selectedUser && !showConfirmDialog}
        onHide={() => setSelectedUser(null)}
        onSubmit={handleEditUser}
        user={selectedUser || undefined}
        title="Edit User"
      />

      <ConfirmDialog
        show={showConfirmDialog}
        onHide={() => {
          setShowConfirmDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete user ${selectedUser?.firstName} ${selectedUser?.lastName}?`}
      />

      <style>{`
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #495057;
        }

        .badge {
          font-size: 0.85rem;
          padding: 0.5em 0.8em;
          text-transform: capitalize;
        }

        .table th {
          font-weight: 600;
          background-color: #f8f9fa;
        }

        .btn-group .btn {
          padding: 0.25rem 0.5rem;
        }

        .btn-group .btn:first-child {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        .btn-group .btn:last-child {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        .table-responsive {
          border-radius: 0.5rem;
          box-shadow: 0 0 10px rgba(0,0,0,0.05);
        }

        .table {
          margin-bottom: 0;
        }

        .table td {
          vertical-align: middle;
        }

        @media (max-width: 768px) {
          .btn-group {
            display: flex;
            flex-direction: column;
          }

          .btn-group .btn {
            width: 100%;
            margin-bottom: 0.25rem;
            border-radius: 0.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageUsersPage; 