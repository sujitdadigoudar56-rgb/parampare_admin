import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ShoppingCart, ShoppingBag, Users as UsersIcon, IndianRupee, ArrowRight } from 'lucide-react';

interface Stats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: any[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{padding: '2rem'}}>Loading dashboard...</div>;
  if (!stats) return <div style={{padding: '2rem'}}>Error loading stats.</div>;

  return (
    <div className="dashboard-page">
      <header className="page-header" style={{marginBottom: '2rem'}}>
        <h1 style={{fontSize: '1.875rem', fontWeight: '700'}}>Dashboard Overview</h1>
        <p style={{color: 'var(--text-muted)'}}>Welcome to the Parampare Admin Portal</p>
      </header>

      <div className="stats-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem'}}>
        <div className="stat-card" style={{background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div className="stat-info">
            <h3 style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>Total Revenue</h3>
            <div className="value" style={{fontSize: '1.5rem', fontWeight: '700'}}>₹{stats.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="stat-icon" style={{background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)'}}><IndianRupee /></div>
        </div>
        <Link to="/orders" style={{textDecoration: 'none', color: 'inherit'}}>
          <div className="stat-card" style={{background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div className="stat-info">
              <h3 style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>Total Orders</h3>
              <div className="value" style={{fontSize: '1.5rem', fontWeight: '700'}}>{stats.totalOrders}</div>
            </div>
            <div className="stat-icon" style={{background: '#e0f2fe', padding: '0.75rem', borderRadius: '0.75rem', color: '#0ea5e9'}}><ShoppingCart /></div>
          </div>
        </Link>
        <Link to="/products" style={{textDecoration: 'none', color: 'inherit'}}>
          <div className="stat-card" style={{background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div className="stat-info">
              <h3 style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>Products</h3>
              <div className="value" style={{fontSize: '1.5rem', fontWeight: '700'}}>{stats.totalProducts}</div>
            </div>
            <div className="stat-icon" style={{background: '#fef3c7', padding: '0.75rem', borderRadius: '0.75rem', color: '#f59e0b'}}><ShoppingBag /></div>
          </div>
        </Link>
        <Link to="/users" style={{textDecoration: 'none', color: 'inherit'}}>
          <div className="stat-card" style={{background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div className="stat-info">
              <h3 style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>Users</h3>
              <div className="value" style={{fontSize: '1.5rem', fontWeight: '700'}}>{stats.totalUsers}</div>
            </div>
            <div className="stat-icon" style={{background: '#fce7f3', padding: '0.75rem', borderRadius: '0.75rem', color: '#ec4899'}}><UsersIcon /></div>
          </div>
        </Link>
      </div>

      <section className="recent-orders" style={{background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
          <h2 style={{fontSize: '1.25rem', fontWeight: '700'}}>Recent Orders</h2>
          <Link to="/orders" style={{fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none'}}>View All</Link>
        </div>
        <table className="data-table" style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)'}}>
              <th style={{padding: '1rem'}}>Order ID</th>
              <th style={{padding: '1rem'}}>Customer</th>
              <th style={{padding: '1rem'}}>Date</th>
              <th style={{padding: '1rem'}}>Amount</th>
              <th style={{padding: '1rem'}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map(order => (
              <tr key={order._id} style={{borderBottom: '1px solid var(--border)'}}>
                <td style={{padding: '1rem', fontWeight: '600'}}>
                  <Link to={`/orders/${order._id}`} style={{color: 'var(--primary)', textDecoration: 'none'}}>
                    {order.orderId || `#${order._id.slice(-6).toUpperCase()}`}
                  </Link>
                </td>
                <td style={{padding: '1rem'}}>{order.user?.fullName || 'Guest'}</td>
                <td style={{padding: '1rem'}}>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td style={{padding: '1rem'}}>₹{order.totalAmount.toLocaleString()}</td>
                <td style={{padding: '1rem'}}>
                  <span className={`badge badge-${
                    order.status === 'delivered' ? 'success' : 
                    order.status === 'cancelled' ? 'danger' : 'warning'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashboard;
