import React from 'react';
import { X, Package, Truck, CreditCard, User } from 'lucide-react';

interface OrderDetailModalProps {
  order: any;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Order Details</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Order #{order._id.toUpperCase()}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Customer Info */}
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} /> Customer Information
            </h3>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
              <p style={{ fontWeight: 600 }}>{order.user?.fullName || 'N/A'}</p>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{order.user?.email || 'No email'}</p>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{order.user?.mobile || 'No mobile'}</p>
            </div>
          </section>

          {/* Items */}
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={16} /> Order Items
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.items.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: idx < order.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <img src={item.image} alt={item.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500 }}>{item.name}</p>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <p style={{ fontWeight: 600 }}>₹{item.quantity * item.price}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Shipping & Payment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <section>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={16} /> Shipping Address
              </h3>
              <div style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                {order.shippingAddress ? (
                  <>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  </>
                ) : <p>N/A</p>}
              </div>
            </section>
            <section>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={16} /> Payment Information
              </h3>
              <div style={{ fontSize: '0.875rem', color: '#334155' }}>
                <p><strong>Method:</strong> {order.paymentMethod}</p>
                <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{order.paymentStatus || 'Pending'}</span></p>
              </div>
            </section>
          </div>

          {/* Summary */}
          <section style={{ borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#64748b' }}>
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#64748b' }}>
                  <span>Delivery Charge</span>
                  <span>{order.deliveryCharge === 0 ? 'Free' : `₹${order.deliveryCharge}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontWeight: 700, fontSize: '1.1rem' }}>
                  <span>Total Amount</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
