import React, { useEffect, useState } from 'react';
import api from '../api';
import { ShoppingCart, ShoppingBag, Users as UsersIcon, IndianRupee } from 'lucide-react';

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

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>Error loading stats.</div>;

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <h1>Dashboard Overview</h1>
        <p className="text-muted">Welcome to the Parampare Admin Portal</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <div className="value">₹{stats.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="stat-icon"><IndianRupee /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Orders</h3>
            <div className="value">{stats.totalOrders}</div>
          </div>
          <div className="stat-icon"><ShoppingCart /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Products</h3>
            <div className="value">{stats.totalProducts}</div>
          </div>
          <div className="stat-icon"><ShoppingBag /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Users</h3>
            <div className="value">{stats.totalUsers}</div>
          </div>
          <div className="stat-icon"><UsersIcon /></div>
        </div>
      </div>

      <section className="recent-orders">
        <h2 style={{marginBottom: '1rem'}}>Recent Orders</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map(order => (
              <tr key={order._id}>
                <td>#{order._id.slice(-6).toUpperCase()}</td>
                <td>{order.user?.fullName || 'N/A'}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>₹{order.totalAmount}</td>
                <td>
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
