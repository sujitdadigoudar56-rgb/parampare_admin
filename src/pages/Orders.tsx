import React, { useEffect, useState } from 'react';
import api from '../api';
import { Eye } from 'lucide-react';

interface Order {
  _id: string;
  user: any;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      alert('Error updating order status');
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="orders-page">
      <header className="page-header">
        <h1>Order Management</h1>
        <p className="text-muted">Fulfillment and order tracking</p>
      </header>

      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>#{order._id.slice(-6).toUpperCase()}</td>
              <td>{order.user?.fullName || 'N/A'}</td>
              <td>₹{order.totalAmount}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>
                <select 
                  value={order.status} 
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className={`badge badge-${
                    order.status === 'delivered' ? 'success' : 
                    order.status === 'cancelled' ? 'danger' : 'warning'
                  }`}
                  style={{border: 'none', appearance: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem'}}
                >
                  <option value="pending">pending</option>
                  <option value="processing">processing</option>
                  <option value="shipped">shipped</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
              <td>
                <button style={{background: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <Eye size={16} /> Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
