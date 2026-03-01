import React from 'react';
import { X, User as UserIcon, Mail, Phone, Shield, Calendar, Activity } from 'lucide-react';

interface UserDetailModalProps {
  user: any;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>User Profile</h2>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '2rem', fontWeight: 700 }}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{user.fullName}</h3>
            <span className={`badge badge-${user.role === 'ADMIN' ? 'warning' : 'success'}`} style={{ marginTop: '0.5rem' }}>
              {user.role}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '0.5rem', borderRadius: '0.5rem' }}><Mail size={18} /></div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</p>
                <p style={{ fontWeight: 500 }}>{user.email || 'Not provided'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#ecfdf5', color: '#10b981', padding: '0.5rem', borderRadius: '0.5rem' }}><Phone size={18} /></div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Phone Number</p>
                <p style={{ fontWeight: 500 }}>{user.mobile || 'Not provided'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#fff7ed', color: '#f97316', padding: '0.5rem', borderRadius: '0.5rem' }}><Calendar size={18} /></div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Joined On</p>
                <p style={{ fontWeight: 500 }}>{new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: user.isActive ? '#ecfdf5' : '#fef2f2', color: user.isActive ? '#10b981' : '#ef4444', padding: '0.5rem', borderRadius: '0.5rem' }}><Activity size={18} /></div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Account Status</p>
                <p style={{ fontWeight: 500, color: user.isActive ? '#10b981' : '#ef4444' }}>{user.isActive ? 'Active / Allowed' : 'Blocked / Disabled'}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.625rem 1.5rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
