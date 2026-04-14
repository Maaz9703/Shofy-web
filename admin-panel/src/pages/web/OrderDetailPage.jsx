import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const statusColor = (s) => (s === 'Delivered' ? 'var(--success)' : s === 'Cancelled' ? 'var(--error)' : 'var(--primary)');

export default function OrderDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true });
            return;
        }
        if (!id) return;
        api.get('/orders').then((r) => {
            const list = r.data.data || [];
            const found = list.find((o) => o._id === id);
            setOrder(found || null);
        }).catch(() => setOrder(null)).finally(() => setLoading(false));
    }, [id, user, navigate]);

    if (!user) return null;

    if (loading || !order) {
        return (
            <div className="container" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                {loading ? 'Loading...' : 'Order not found.'}
                <div style={{ marginTop: 16 }}><Link to="/orders">Back to orders</Link></div>
            </div>
        );
    }

    const addr = order.shippingAddress || {};

    return (
        <div className="container" style={{ padding: '32px 0 60px' }}>
            <Link to="/orders" style={{ display: 'inline-block', marginBottom: 24, color: 'var(--primary)' }}>← Back to orders</Link>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <h1>Order #{String(order._id).slice(-8).toUpperCase()}</h1>
                <span style={{ background: statusColor(order.status), color: '#fff', padding: '6px 14px', borderRadius: 8 }}>{order.status}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Placed on {new Date(order.createdAt).toLocaleString()}</p>

            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12 }}>Items</h3>
                {(order.items || []).map((item) => (
                    <div key={item._id || item.product?._id} style={{ display: 'flex', flexDirection: 'column', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.product?.title || 'Product'} × {item.quantity}</span>
                            <span>PKR {Number(item.price || item.product?.price || 0) * (item.quantity || 0)}</span>
                        </div>
                        {item.color && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Color:</span>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, border: '1px solid var(--border)' }} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{item.color}</span>
                            </div>
                        )}
                        {item.note && (
                            <div style={{ marginTop: 4, padding: '4px 8px', background: 'var(--background)', borderRadius: 4, borderLeft: '3px solid var(--primary)', fontSize: '0.7rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Note: </span>
                                <span style={{ color: 'var(--text)' }}>{item.note}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12 }}>Shipping address</h3>
                <p>{addr.fullName}</p>
                <p style={{ color: 'var(--text-muted)' }}>{addr.address}, {addr.city}, {addr.state} {addr.zipCode}</p>
                <p style={{ color: 'var(--text-muted)' }}>{addr.phone}</p>
            </div>

            <div className="card" style={{ padding: 24, maxWidth: 320 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Subtotal</span><span>PKR {Number(order.subTotal || order.total || 0).toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Total</span><span>PKR {Number(order.total || 0).toFixed(2)}</span></div>
            </div>
        </div>
    );
}
