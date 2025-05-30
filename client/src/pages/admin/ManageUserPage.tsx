import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, logout } from '../../utils/auth';
import Navbar from '../../components/Navbar';
// import './ManageUserPage.css'; // Optional

type UserRole = 'Patient' | 'Nurse' | 'Doctor' | 'Admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string; // e.g., for Doctors, Nurses
  specialty?: string;  // e.g., for Doctors
  isActive: boolean;
  // Add other fields as necessary: phone, address, dateOfBirth for patients, etc.
}

const mockUsers: User[] = [
  { id: 'user_001', name: 'Dr. Alice Wonderland', email: 'alice@hospital.com', role: 'Doctor', department: 'Cardiology', specialty: 'Cardiologist', isActive: true },
  { id: 'user_002', name: 'Nurse Bob The Builder', email: 'bob@hospital.com', role: 'Nurse', department: 'Pediatrics', isActive: true },
  { id: 'user_003', name: 'Admin Eve Adams', email: 'eve@hospital.com', role: 'Admin', isActive: true },
  { id: 'user_004', name: 'Patient Charlie Brown', email: 'charlie@example.com', role: 'Patient', isActive: true },
  { id: 'user_005', name: 'Dr. Carol Danvers', email: 'carol@hospital.com', role: 'Doctor', department: 'Oncology', specialty: 'Oncologist', isActive: false },
  { id: 'user_006', name: 'Nurse David Copperfield', email: 'david@hospital.com', role: 'Nurse', department: 'Cardiology', isActive: true },
  { id: 'user_007', name: 'Patient Diana Prince', email: 'diana@example.com', role: 'Patient', isActive: false },
];

const userRoles: UserRole[] = ['Patient', 'Nurse', 'Doctor', 'Admin'];

const ManageUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<UserRole | 'All'>('All');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUserForm, setCurrentUserForm] = useState<Partial<User> | null>(null); // For add/edit
  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    if (selectedRoleFilter === 'All') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.role === selectedRoleFilter));
    }
  }, [selectedRoleFilter, users]);

  const openUserModal = (user?: User) => {
    if (user) {
      setCurrentUserForm(user);
      setIsEditing(true);
    } else {
      setCurrentUserForm({ isActive: true, role: 'Patient' }); // Default for new user
      setIsEditing(false);
    }
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setCurrentUserForm(null);
  };

  const handleUserFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const isCheckbox = type === 'checkbox';
    // @ts-ignore for checked property
    const val = isCheckbox ? event.target.checked : value;
    setCurrentUserForm(prev => prev ? ({ ...prev, [name]: val }) : null);
  };
  
  const validateUserData = (userData: Partial<User>): boolean => {
    if (!userData.name || !userData.email || !userData.role) {
        alert('Name, Email, and Role are required fields.');
        return false;
    }
    // Simulate checking for email uniqueness (except for the current user if editing)
    const emailExists = users.some(u => u.email === userData.email && u.id !== userData.id);
    if (emailExists) {
        alert('This email address is already in use. Please use a different email.');
        return false;
    }
    return true;
  };

  const handleSaveUser = () => {
    if (!currentUserForm) return;

    if (!validateUserData(currentUserForm)) return; // Validate User Data

    setIsLoading(true);

    if (isEditing && currentUserForm.id) {
      // Update existing user
      setUsers(prevUsers => prevUsers.map(u => u.id === currentUserForm.id ? { ...u, ...currentUserForm } as User : u));
      alert(`User ${currentUserForm.name} updated successfully.`);
    } else {
      // Add new user
      const newUser: User = {
        ...currentUserForm,
        id: `user_${Date.now()}`,
        isActive: currentUserForm.isActive === undefined ? true : currentUserForm.isActive,
      } as User;
      setUsers(prevUsers => [...prevUsers, newUser]);
      alert(`User ${newUser.name} created successfully.`);
    }
    
    // Simulate Notify User
    console.log(`Simulating notification to ${currentUserForm.email} about account changes.`);

    setIsLoading(false);
    closeUserModal();
  };

  const toggleUserActivation = (userId: string) => {
    const userToToggle = users.find(u => u.id === userId);
    if (!userToToggle) return;

    if (window.confirm(`Are you sure you want to ${userToToggle.isActive ? 'deactivate' : 'activate'} user ${userToToggle.name}?`)) {
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
        alert(`User ${userToToggle.name} has been ${userToToggle.isActive ? 'deactivated' : 'activated'}.`);
        // Simulate Deactivate User system step (logging, etc.)
        console.log(`Simulating system action for user ${userToToggle.isActive ? 'deactivation' : 'activation'}: ${userId}`);
    }
  };
  
  const handleResetPassword = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && window.confirm(`Are you sure you want to reset the password for ${user.name}? A new temporary password will be sent to their email.`)) {
        alert(`Password reset for ${user.name}. A temporary password has been sent to ${user.email} (simulated).`);
        console.log(`Simulating password reset and notification for user ID: ${userId}`);
    }
  }

  if (!adminUser) {
    return <div className="p-5 text-center">Loading admin data...</div>;
  }

  return (
    <>
      <Navbar isDashboard={true} />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Manage User Accounts</h2>
            <button className="btn btn-primary" onClick={() => openUserModal()}>Add New User</button>
        </div>
        
        <div className="mb-3">
            <label htmlFor="roleFilter" className="form-label">Filter by Role:</label>
            <select id="roleFilter" className="form-select w-auto" value={selectedRoleFilter} onChange={(e) => setSelectedRoleFilter(e.target.value as UserRole | 'All')}>
                <option value="All">All Users</option>
                {userRoles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
        </div>

        <table className="table table-striped table-hover table-responsive-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className={!user.isActive ? 'table-secondary' : ''}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`badge bg-${user.isActive ? 'success' : 'danger'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openUserModal(user)} title="Edit User">
                    <i className="bi bi-pencil-square"></i> Edit
                  </button>
                  <button 
                    className={`btn btn-sm me-2 ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    onClick={() => toggleUserActivation(user.id)}
                    title={user.isActive ? 'Deactivate User' : 'Activate User'}
                  >
                    {user.isActive ? <><i className="bi bi-person-x-fill"></i> Deactivate</> : <><i className="bi bi-person-check-fill"></i> Activate</>}
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleResetPassword(user.id)} title="Reset Password">
                    <i className="bi bi-key-fill"></i> Reset PW
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
                <tr><td colSpan={5} className="text-center">No users found for the selected filter.</td></tr>
            )}
          </tbody>
        </table>

        {/* Add/Edit User Modal */}
        {isUserModalOpen && currentUserForm && (
          <div className="modal fade show" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} aria-modal="true" role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{isEditing ? 'Edit User' : 'Add New User'}</h5>
                  <button type="button" className="btn-close" onClick={closeUserModal} disabled={isLoading}></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="name" className="form-label">Full Name</label>
                            <input type="text" className="form-control" id="name" name="name" value={currentUserForm.name || ''} onChange={handleUserFormChange} disabled={isLoading} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input type="email" className="form-control" id="email" name="email" value={currentUserForm.email || ''} onChange={handleUserFormChange} disabled={isLoading} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="role" className="form-label">Role</label>
                            <select id="role" name="role" className="form-select" value={currentUserForm.role || ''} onChange={handleUserFormChange} disabled={isLoading}>
                                {userRoles.map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                        {(currentUserForm.role === 'Doctor' || currentUserForm.role === 'Nurse') && (
                            <div className="col-md-6 mb-3">
                                <label htmlFor="department" className="form-label">Department</label>
                                <input type="text" className="form-control" id="department" name="department" value={currentUserForm.department || ''} onChange={handleUserFormChange} disabled={isLoading} />
                            </div>
                        )}
                    </div>
                    {currentUserForm.role === 'Doctor' && (
                        <div className="mb-3">
                            <label htmlFor="specialty" className="form-label">Specialty</label>
                            <input type="text" className="form-control" id="specialty" name="specialty" value={currentUserForm.specialty || ''} onChange={handleUserFormChange} disabled={isLoading} />
                        </div>
                    )}
                    {!isEditing && (
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Temporary Password</label>
                            <input type="password" className="form-control" id="password" name="password" placeholder="Will be auto-generated if left blank" onChange={handleUserFormChange} disabled={isLoading} />
                            <small className="form-text text-muted">User will be prompted to change this on first login.</small>
                        </div>
                    )}
                    <div className="form-check mb-3">
                        <input className="form-check-input" type="checkbox" id="isActive" name="isActive" checked={currentUserForm.isActive === undefined ? true : currentUserForm.isActive} onChange={handleUserFormChange} disabled={isLoading} />
                        <label className="form-check-label" htmlFor="isActive">
                            User account is Active
                        </label>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeUserModal} disabled={isLoading}>Close</button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveUser} disabled={isLoading}>
                    {isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create User')}
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

export default ManageUserPage; 