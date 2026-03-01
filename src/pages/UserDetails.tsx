import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, User as UserIcon, Mail, Phone, Calendar, Shield, MapPin, ChevronRight, UserX, UserCheck } from 'lucide-react';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/admin/users/${id}`);
        setUser(response.data.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const toggleStatus = async () => {
    try {
      await api.patch(`/admin/users/${id}/status`, {
        isActive: !user.isActive
      });
      setUser({ ...user, isActive: !user.isActive });
    } catch (error) {
      alert('Error updating user status');
    }
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading user details...</div>;
  if (!user) return <div style={{padding: '2rem'}}>User not found.</div>;

  return (
    <div className="user-details-page">
      <header className="page-header" style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
        <button onClick={() => navigate(-1)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'}}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>
            <Link to="/users" style={{color: 'inherit'}}>Users</Link>
            <ChevronRight size={14} />
            <span>User Details</span>
          </div>
          <h1 style={{fontSize: '1.5rem', fontWeight: '700'}}>{user.fullName}</h1>
        </div>
        <div style={{marginLeft: 'auto'}}>
          <button 
            onClick={toggleStatus}
            className={`btn-${user.isActive ? 'danger' : 'success'}`}
            style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '600'}}
          >
            {user.isActive ? <><UserX size={18} /> Block User</> : <><UserCheck size={18} /> Unblock User</>}
          </button>
        </div>
      </header>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem'}}>
        <div className="user-profile-sidebar">
          <section style={{background: 'white', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem'}}>
            <div style={{
              width: '96px', height: '96px', background: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
            }}>
              <UserIcon size={48} />
            </div>
            <h2 style={{fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem'}}>{user.fullName}</h2>
            <span className={`badge badge-${user.role === 'ADMIN' ? 'warning' : 'primary'}`} style={{fontSize: '0.75rem'}}>
              {user.role}
            </span>
            <div style={{marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem'}}>
                <Mail size={16} color="var(--text-muted)" />
                <span style={{wordBreak: 'break-all'}}>{user.email || 'N/A'}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem'}}>
                <Phone size={16} color="var(--text-muted)" />
                <span>{user.mobile || 'N/A'}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem'}}>
                <Calendar size={16} color="var(--text-muted)" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem'}}>
                <Shield size={16} color={user.isActive ? 'var(--success)' : 'var(--danger)'} />
                <span style={{fontWeight: '600', color: user.isActive ? 'var(--success)' : 'var(--danger)'}}>
                  {user.isActive ? 'Account Active' : 'Account Blocked'}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="user-main-content">
          <section style={{background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem'}}>
            <h2 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <MapPin size={20} color="var(--primary)" /> Address Information
            </h2>
            <p style={{color: 'var(--text-muted)', textAlign: 'center', padding: '2rem'}}>
              Address history feature coming soon.
            </p>
          </section>

          <section style={{background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: 'var(--shadow-sm)'}}>
            <h2 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <ChevronRight size={20} color="var(--primary)" /> Order History
            </h2>
             <p style={{color: 'var(--text-muted)', textAlign: 'center', padding: '2rem'}}>
              List of user's past orders will appear here.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
