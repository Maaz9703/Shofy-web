import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [adminPanelName, setAdminPanelName] = useState('');
  const [webAppName, setWebAppName] = useState('');
  const [mobileAppName, setMobileAppName] = useState('');
  const [promoBannerText, setPromoBannerText] = useState('');
  const [showPromoBanner, setShowPromoBanner] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [disableReviews, setDisableReviews] = useState(false);
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [notifications, setNotifications] = useState({ newOrder: true, lowStock: true, dailyReport: false });

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'features', label: 'Features', icon: '🚀' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  const loadSettings = async () => {
    try {
      const res = await api.get('/settings');
      const s = res.data.data || {};
      setStoreName(s.storeName || 'Shofy');
      setStoreDescription(s.storeDescription || 'Your trusted e-commerce platform');
      setAdminPanelName(s.adminPanelName || 'Shofy Admin');
      setWebAppName(s.webAppName || 'Shofy Web');
      setMobileAppName(s.mobileAppName || 'Shofy Mobile');
      setPromoBannerText(s.promoBannerText || 'Welcome to our store!');
      setShowPromoBanner(Boolean(s.showPromoBanner));
      setMaintenanceMode(Boolean(s.maintenanceMode));
      setDisableReviews(Boolean(s.disableReviews));
      setEnableEmailNotifications(Boolean(s.enableEmailNotifications));
      setNotifications({
        newOrder: Boolean(s.notifications?.newOrder),
        lowStock: Boolean(s.notifications?.lowStock),
        dailyReport: Boolean(s.notifications?.dailyReport),
      });
    } catch (err) {
      // ignore silently, or show toast
      console.error('Failed to load settings', err?.message || err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Settings</h1>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar */}
        <aside style={{ width: 200, flexShrink: 0 }}>
          <div style={{ background: '#1e293b', borderRadius: 12, padding: 8 }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  marginBottom: 4,
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {activeTab === 'general' && (
            <div style={{ background: '#1e293b', padding: 24, borderRadius: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>General Settings</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Admin Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    style={{ ...inputStyle, background: '#0f172a', opacity: 0.6 }}
                  />
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    Email cannot be changed from admin panel
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Store Name</label>
                  <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Store Description</label>
                  <textarea rows={4} value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Admin Panel Name</label>
                    <input type="text" value={adminPanelName} onChange={(e) => setAdminPanelName(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Web App Name</label>
                    <input type="text" value={webAppName} onChange={(e) => setWebAppName(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Mobile App Name</label>
                    <input type="text" value={mobileAppName} onChange={(e) => setMobileAppName(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={enableEmailNotifications} onChange={(e) => setEnableEmailNotifications(e.target.checked)} style={{ width: 'auto', margin: 0 }} />
                    Enable email notifications
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button onClick={async () => {
                    try {
                      const payload = {
                        storeName,
                        storeDescription,
                        adminPanelName,
                        webAppName,
                        mobileAppName,
                        promoBannerText,
                        showPromoBanner,
                        maintenanceMode,
                        disableReviews,
                        enableEmailNotifications,
                        notifications,
                      };
                      await api.put('/settings', payload);
                      toast.success('Settings saved');
                    } catch (err) {
                      toast.error(err.response?.data?.message || 'Failed to save settings');
                    }
                  }} style={primaryButtonStyle}>Save Changes</button>
                  <button onClick={() => loadSettings()} style={{ ...primaryButtonStyle, background: '#475569' }}>Reload</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div style={{ background: '#1e293b', padding: 24, borderRadius: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>App Features</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ padding: 16, background: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Promo Banner</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Show a promotional banner at the top of the web/mobile app</div>
                    </div>
                    <input type="checkbox" checked={showPromoBanner} onChange={(e) => setShowPromoBanner(e.target.checked)} />
                  </div>
                  {showPromoBanner && (
                    <input
                      type="text"
                      placeholder="Promo banner text..."
                      value={promoBannerText}
                      onChange={(e) => setPromoBannerText(e.target.value)}
                      style={inputStyle}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: maintenanceMode ? '#450a0a' : '#0f172a', borderRadius: 8, border: '1px solid #ef4444' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: maintenanceMode ? '#fca5a5' : '#fff' }}>Maintenance Mode</div>
                    <div style={{ fontSize: 12, color: maintenanceMode ? '#f87171' : '#64748b' }}>Restrict access to the apps while performing updates</div>
                  </div>
                  <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Disable Reviews</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Temporarily hide product reviews and ratings</div>
                  </div>
                  <input type="checkbox" checked={disableReviews} onChange={(e) => setDisableReviews(e.target.checked)} />
                </div>

                <button
                  onClick={async () => {
                    try {
                      const payload = {
                        storeName, storeDescription, adminPanelName, webAppName, mobileAppName,
                        promoBannerText, showPromoBanner, maintenanceMode, disableReviews,
                        enableEmailNotifications, notifications
                      };
                      await api.put('/settings', payload);
                      toast.success('Features updated');
                    } catch (err) {
                      toast.error('Failed to save features');
                    }
                  }}
                  style={primaryButtonStyle}
                >
                  Save Feature Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ background: '#1e293b', padding: 24, borderRadius: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Notification Settings</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#0f172a', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>New Order Notifications</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Get notified when a new order is placed</div>
                  </div>
                  <input type="checkbox" checked={notifications.newOrder} onChange={(e) => setNotifications((n) => ({ ...n, newOrder: e.target.checked }))} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#0f172a', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>Low Stock Alerts</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Receive alerts when product stock is low</div>
                  </div>
                  <input type="checkbox" checked={notifications.lowStock} onChange={(e) => setNotifications((n) => ({ ...n, lowStock: e.target.checked }))} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#0f172a', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>Daily Sales Report</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Receive daily sales summary via email</div>
                  </div>
                  <input type="checkbox" checked={notifications.dailyReport} onChange={(e) => setNotifications((n) => ({ ...n, dailyReport: e.target.checked }))} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ background: '#1e293b', padding: 24, borderRadius: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Security Settings</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <input type="password" style={inputStyle} placeholder="Enter current password" />
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input type="password" style={inputStyle} placeholder="Enter new password" />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input type="password" style={inputStyle} placeholder="Confirm new password" />
                </div>
                <div style={{ padding: 16, background: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Password Requirements:</div>
                  <ul style={{ margin: 0, paddingLeft: 20, color: '#94a3b8', fontSize: 12 }}>
                    <li>At least 8 characters</li>
                    <li>Contains uppercase and lowercase letters</li>
                    <li>Contains at least one number</li>
                    <li>Contains at least one special character</li>
                  </ul>
                </div>
                <button style={primaryButtonStyle}>Update Password</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: 8, color: '#94a3b8', fontSize: 14, fontWeight: 500 };
const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#fff',
  fontSize: 14,
};
const primaryButtonStyle = {
  padding: '12px 24px',
  borderRadius: 8,
  background: '#6366f1',
  color: '#fff',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  alignSelf: 'flex-start',
};
const toggleStyle = {
  position: 'absolute',
  cursor: 'pointer',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: '#475569',
  borderRadius: 24,
  transition: '0.3s',
};

export default SettingsPage;
