import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Eye, Search, Filter, ArrowLeft, ArrowRight } from 'lucide-react';

interface Order {
  _id: string;
  orderId?: string;
  user: any;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/orders', {
        params: { 
          search: searchTerm, 
          status: statusFilter,
          page: page,
          limit: 10
        }
      });
      // Handle different response structures if necessary
      const data = response.data.data || response.data.orders || [];
      setOrders(data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter, page]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      alert('Error updating order status');
    }
  };

  return (
    <div className="orders-page">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-main)' }}>Order Management</h1>
        <p style={{ color: 'var(--text-muted)' }}>Fulfillment and order tracking</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search Order ID or Customer..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', outline: 'none' }}
          >
            <option value="">All Statuses</option>
            <option value="pending">pending</option>
            <option value="processing">processing</option>
            <option value="shipped">shipped</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders found.</div>
        ) : (
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Order ID</th>
                <th style={{ padding: '1rem' }}>Customer</th>
                <th style={{ padding: '1rem' }}>Amount</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>
                    <Link to={`/orders/${order._id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                      {order.orderId || `#${order._id.slice(-6).toUpperCase()}`}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem' }}>{order.user?.fullName || 'Guest'}</td>
                  <td style={{ padding: '1rem' }}>₹{order.totalAmount.toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className={`badge badge-${
                        order.status === 'delivered' ? 'success' : 
                        order.status === 'cancelled' ? 'danger' : 'warning'
                      }`}
                      style={{ border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}
                    >
                      <option value="pending">pending</option>
                      <option value="processing">processing</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Link to={`/orders/${order._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                      <Eye size={16} /> Details
                    </Link>
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

export default OrdersPage;
