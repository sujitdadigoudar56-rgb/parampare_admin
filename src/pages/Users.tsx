import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { User, Eye, UserX, UserCheck, Search, Filter, ArrowLeft, ArrowRight } from 'lucide-react';

interface UserData {
  _id: string;
  fullName: string;
  email?: string;
  mobile?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // 'active' or 'blocked'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users', {
        params: {
          search: searchTerm,
          role: roleFilter,
          status: statusFilter,
          page: page,
          limit: 10
        }
      });
      const data = response.data.data || [];
      setUsers(data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, roleFilter, statusFilter, page]);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, {
        isActive: !currentStatus
      });
      fetchUsers();
    } catch (error) {
      alert('Error updating user status');
    }
  };

  return (
    <div className="users-page">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-main)' }}>User Management</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage customer accounts and admin access</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} color="var(--text-muted)" />
            <select 
              value={roleFilter} 
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', outline: 'none' }}
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', outline: 'none' }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</div>
        ) : (
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>User</th>
                <th style={{ padding: '1rem' }}>Contact</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <Link to={`/users/${u._id}`} style={{ fontWeight: '600', color: 'var(--text-main)', textDecoration: 'none' }}>
                          {u.fullName}
                        </Link>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {u._id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ fontSize: '0.875rem' }}>{u.email || 'N/A'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.mobile || 'No Mobile'}</p>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${u.role === 'ADMIN' ? 'warning' : 'primary'}`} style={{ fontSize: '0.75rem' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${u.isActive ? 'success' : 'danger'}`}>
                      {u.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/users/${u._id}`} className="btn-icon" title="View Details" style={{ color: 'var(--primary)' }}>
                        <Eye size={18} />
                      </Link>
                      <button 
                        onClick={() => toggleUserStatus(u._id, u.isActive)}
                        className="btn-icon" 
                        title={u.isActive ? "Block User" : "Unblock User"}
                        style={{ color: u.isActive ? 'var(--danger)' : 'var(--success)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {u.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={page === 1}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
        >
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontWeight: '600' }}>Page {page} of {totalPages}</span>
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
          disabled={page === totalPages}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default UsersPage;
