import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const NAV_ITEMS = [
  { to: '/admin',          end: true,  icon: '▦',  label: 'Dashboard' },
  { to: '/admin/products', icon: '⬡',  label: 'Products' },
  { to: '/admin/orders',   icon: '◫',  label: 'Orders' },
  { to: '/admin/users',    icon: '◉',  label: 'Users' },
  { to: '/admin/coupons',  icon: '◈',  label: 'Coupons' },
  { to: '/admin/reviews',  icon: '◎',  label: 'Reviews' },
];
const NAV_ANALYTICS = [
  { to: '/admin/reports',   icon: '◬',  label: 'Reports' },
  { to: '/admin/activity',  icon: '◭',  label: 'Activity Feed' },
  { to: '/admin/inventory', icon: '◰',  label: 'Inventory Alerts' },
  { to: '/admin/customers', icon: '◱',  label: 'Customer Insights' },
  { to: '/admin/settings',  icon: '◲',  label: 'Settings' },
];

// SVG Icons
const icons = {
  dashboard:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><rect x={2} y={3} width={9} height={9} rx={2}/><rect x={13} y={3} width={9} height={9} rx={2}/><rect x={2} y={14} width={9} height={9} rx={2}/><rect x={13} y={14} width={9} height={9} rx={2}/></svg>,
  products:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  orders:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1={3} y1={6} x2={21} y2={6}/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  users:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx={9} cy={7} r={4}/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  coupons:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1={7} y1={7} x2={7.01} y2={7}/></svg>,
  reviews:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  reports:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><line x1={18} y1={20} x2={18} y2={10}/><line x1={12} y1={20} x2={12} y2={4}/><line x1={6} y1={20} x2={6} y2={14}/></svg>,
  activity:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  inventory:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><path d="M22 17H2a3 3 0 000 6h20a3 3 0 000-6z"/><path d="M5.45 17L4 3h16l-1.45 14"/></svg>,
  customers:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  settings:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><circle cx={12} cy={12} r={3}/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  storefront: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  logout:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1={21} y1={12} x2={9} y2={12}/></svg>,
};

const NAV_MAIN = [
  { to: '/admin',          end: true,  icon: icons.dashboard,  label: 'Dashboard' },
  { to: '/admin/products', icon: icons.products,  label: 'Products' },
  { to: '/admin/orders',   icon: icons.orders,    label: 'Orders' },
  { to: '/admin/users',    icon: icons.users,     label: 'Users' },
  { to: '/admin/coupons',  icon: icons.coupons,   label: 'Coupons' },
  { to: '/admin/reviews',  icon: icons.reviews,   label: 'Reviews' },
];
const NAV_ANALYTIC = [
  { to: '/admin/reports',   icon: icons.reports,    label: 'Reports' },
  { to: '/admin/activity',  icon: icons.activity,   label: 'Activity Feed' },
  { to: '/admin/inventory', icon: icons.inventory,  label: 'Inventory Alerts' },
  { to: '/admin/customers', icon: icons.customers,  label: 'Customer Insights' },
  { to: '/admin/settings',  icon: icons.settings,   label: 'Settings' },
];

const NavItem = ({ to, icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    style={{ textDecoration: 'none' }}
  >
    <span className="nav-item__icon">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'A';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar__logo">
          <div className="sidebar__logo-text">{settings.adminPanelName || 'Trader Admin'}</div>
          <div className="sidebar__user">
            <div className="sidebar__avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Trader Admin'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          <div className="nav-section-label">Main</div>
          {NAV_MAIN.map(item => <NavItem key={item.to} {...item} />)}

          <div className="nav-section-label" style={{ marginTop: 12 }}>Analytics</div>
          {NAV_ANALYTIC.map(item => <NavItem key={item.to} {...item} />)}

          <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <NavLink
              to="/"
              className="nav-item"
              style={{ textDecoration: 'none' }}
            >
              <span className="nav-item__icon">{icons.storefront}</span>
              <span>View Storefront</span>
            </NavLink>
          </div>
        </nav>

        {/* Footer / Logout */}
        <div className="sidebar__footer">
          <button className="sidebar__logout" onClick={handleLogout}>
            {icons.logout}
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
