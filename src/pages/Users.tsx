import React, { useEffect, useState } from 'react';
import api from '../api';
import { UserCheck, UserX } from 'lucide-react';

interface User {
  _id: string;
  fullName: string;
  email?: string;
  mobile?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, {
        isActive: !currentStatus
      });
      fetchUsers(); // Refresh list
    } catch (error) {
      alert('Error updating user status');
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="users-page">
      <header className="page-header">
        <h1>User Management</h1>
        <p className="text-muted">Manage system users and their access</p>
      </header>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email/Mobile</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.fullName}</td>
              <td>{user.email || user.mobile}</td>
              <td><span className="badge badge-warning">{user.role}</span></td>
              <td>
                <span className={`badge badge-${user.isActive ? 'success' : 'danger'}`}>
                  {user.isActive ? 'Active' : 'Blocked'}
                </span>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <button 
                  onClick={() => toggleStatus(user._id, user.isActive)}
                  style={{
                    background: 'none', 
                    color: user.isActive ? 'var(--danger)' : 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  {user.isActive ? <><UserX size={16} /> Block</> : <><UserCheck size={16} /> Unblock</>}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;
