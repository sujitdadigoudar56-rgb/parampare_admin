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
              order.status === 'delivered' ? 'success' : 
              order.status === 'cancelled' ? 'danger' : 'warning'
            }`}
            style={{padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem', fontWeight: '600'}}
          >
            <option value="pending">pending</option>
            <option value="processing">processing</option>
            <option value="shipped">shipped</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
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
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Package size={20} color="#cbd5e1" /></div>
                    )}
                  </div>
                  <div style={{flex: 1}}>
                    <Link to={`/products/${item.product?._id}`} style={{fontWeight: '600', color: 'var(--primary-dark)'}}>
                      {item.product?.name || 'Deleted Product'}
                    </Link>
                    <p style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>Qty: {item.quantity}</p>
                  </div>
                  <div style={{fontWeight: '600'}}>₹{item.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', width: '200px', color: 'var(--text-muted)'}}>
                <span>Subtotal</span>
                <span>₹{order.totalAmount.toLocaleString()}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', width: '200px', fontWeight: '700', fontSize: '1.125rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '2px solid var(--border)'}}>
                <span>Total</span>
                <span style={{color: 'var(--primary)'}}>₹{order.totalAmount.toLocaleString()}</span>
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
                <p style={{fontWeight: '500'}}>{order.paymentInfo?.method || 'N/A'}</p>
              </div>
              <div>
                <p style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>Status</p>
                <span className={`badge badge-${order.paymentInfo?.status === 'completed' ? 'success' : 'warning'}`}>
                  {order.paymentInfo?.status || 'pending'}
                </span>
              </div>
              {order.paymentInfo?.transactionId && (
                <div style={{gridColumn: '1 / span 2'}}>
                  <p style={{fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>Transaction ID</p>
                  <p style={{fontFamily: 'monospace'}}>{order.paymentInfo.transactionId}</p>
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
                <p style={{fontWeight: '500'}}>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            ) : (
              <p>Address not available</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
