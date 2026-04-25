import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Package, User, MapPin, CreditCard, ChevronRight } from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/admin/orders/${id}`);
        setOrder(response.data.data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      alert('Error updating order status');
    }
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading order details...</div>;
  if (!order) return <div style={{padding: '2rem'}}>Order not found.</div>;

  return (
    <div className="order-details-page">
      <header className="page-header" style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
        <button onClick={() => navigate(-1)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'}}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>
            <Link to="/orders" style={{color: 'inherit'}}>Orders</Link>
            <ChevronRight size={14} />
            <span>Order Details</span>
          </div>
          <h1 style={{fontSize: '1.5rem', fontWeight: '700'}}>Order #{order.orderId || order._id.slice(-6).toUpperCase()}</h1>
        </div>
        <div style={{marginLeft: 'auto'}}>
          <select 
            value={order.status} 
            onChange={(e) => updateStatus(e.target.value)}
            className={`badge badge-${
              order.status === 'Delivered' ? 'success' : 
              order.status === 'Cancelled' ? 'danger' : 'warning'
            }`}
            style={{padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border)', fontSize: '0.875rem', fontWeight: '700', height: 'auto', background: 'white'}}
          >
            <option value="Order Confirmed">Order Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </header>

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem'}}>
        <div className="order-main">
          <section style={{background: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)'}}>
            <h2 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Package size={20} color="var(--primary)" /> Order Items
            </h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {order.items.map((item: any) => (
                <div key={item._id} style={{display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)'}}>
                  <div style={{width: '64px', height: '64px', background: '#f8fafc', borderRadius: '0.5rem', overflow: 'hidden'}}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Package size={20} color="#cbd5e1" /></div>
                    )}
                  </div>
                  <div style={{flex: 1}}>
                    {item.product ? (
                      <Link to={`/products/${item.product?._id || item.product}`} style={{fontWeight: '600', color: 'var(--primary-dark)'}}>
                        {item.name}
                      </Link>
                    ) : (
                      <span style={{fontWeight: '600', color: 'var(--text-main)'}}>{item.name}</span>
                    )}
                    <p style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>Qty: {item.quantity}</p>
                  </div>
                  <div style={{fontWeight: '600'}}>₹{item.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', width: '220px', color: 'var(--text-muted)'}}>
                <span>Subtotal</span>
                <span>₹{(order.subtotal || 0).toLocaleString()}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', width: '220px', color: 'var(--text-muted)'}}>
                <span>Delivery Charge</span>
                <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', width: '220px', fontWeight: '700', fontSize: '1.125rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '2px solid var(--border)'}}>
                <span>Total</span>
                <span style={{color: 'var(--primary)'}}>₹{(order.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </section>

          <section style={{background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: 'var(--shadow-sm)'}}>
            <h2 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <CreditCard size={20} color="var(--primary)" /> Payment Information
            </h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
              <div>
                <p style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>Method</p>
                <p style={{fontWeight: '500'}}>{order.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <p style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>Status</p>
                <span className={`badge badge-${order.paymentStatus === 'Paid' ? 'success' : order.paymentStatus === 'Failed' ? 'danger' : 'warning'}`}>
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>
              {order.razorpayOrderId && (
                <div>
                  <p style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>Razorpay Order ID</p>
                  <p style={{fontFamily: 'monospace', fontSize: '0.8rem'}}>{order.razorpayOrderId}</p>
                </div>
              )}
              {order.razorpayPaymentId && (
                <div>
                  <p style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>Razorpay Payment ID</p>
                  <p style={{fontFamily: 'monospace', fontSize: '0.8rem'}}>{order.razorpayPaymentId}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="order-sidebar">
          <section style={{background: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)'}}>
            <h2 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <User size={20} color="var(--primary)" /> Customer Details
            </h2>
            {order.user ? (
              <div>
                <Link to={`/users/${order.user._id}`} style={{fontWeight: '600', fontSize: '1rem', color: 'var(--primary)', display: 'block', marginBottom: '0.5rem'}}>
                  {order.user.fullName}
                </Link>
                <p style={{fontSize: '0.875rem', marginBottom: '0.25rem'}}>{order.user.email || 'No Email'}</p>
                <p style={{fontSize: '0.875rem'}}>{order.user.mobile || 'No Mobile'}</p>
              </div>
            ) : (
              <p>User details not available</p>
            )}
          </section>

          <section style={{background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: 'var(--shadow-sm)'}}>
            <h2 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <MapPin size={20} color="var(--primary)" /> Shipping Address
            </h2>
            {order.shippingAddress ? (
              <div style={{fontSize: '0.875rem', lineHeight: '1.6'}}>
                <p style={{fontWeight: '600'}}>{order.shippingAddress.fullName}</p>
                <p style={{color: 'var(--text-muted)', marginBottom: '0.5rem'}}>{order.shippingAddress.mobile}</p>
                <p>{order.shippingAddress.house}, {order.shippingAddress.street}</p>
                {order.shippingAddress.landmark && <p style={{fontStyle: 'italic'}}>Landmark: {order.shippingAddress.landmark}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                {order.shippingAddress.alternatePhone && <p style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Alt: {order.shippingAddress.alternatePhone}</p>}
              </div>
            ) : (
              <p>Address not available</p>
            )}
            {order.trackingNumber && (
              <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)'}}>
                 <p style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>Tracking Number</p>
                 <p style={{fontWeight: '600'}}>{order.trackingNumber}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
