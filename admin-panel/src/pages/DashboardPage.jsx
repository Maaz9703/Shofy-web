import React, { useState, useEffect, useRef, memo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import api from '../config/api';
import Clock from '../components/Clock';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend, Filler,
);

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const start = useRef(null);
  useEffect(() => {
    if (!target) return;
    const step = (ts) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(2)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

const CARD_CONFIGS = [
  { key: 'totalRevenue',   label: 'Total Revenue',    icon: '💰', color: '#10b981', gradient: 'rgba(16,185,129,0.12)', isMoney: true },
  { key: 'totalOrders',    label: 'Total Orders',     icon: '🛒', color: '#7c3aed', gradient: 'rgba(124,58,237,0.12)' },
  { key: 'totalUsers',     label: 'Total Users',      icon: '👥', color: '#06b6d4', gradient: 'rgba(6,182,212,0.12)' },
  { key: 'pendingOrders',  label: 'Pending Orders',   icon: '⏳', color: '#f59e0b', gradient: 'rgba(245,158,11,0.12)' },
  { key: 'avgOrderValue',  label: 'Avg Order Value',  icon: '📊', color: '#a855f7', gradient: 'rgba(168,85,247,0.12)', isMoney: true },
  { key: 'completedOrders',label: 'Completed Orders', icon: '✅', color: '#34d399', gradient: 'rgba(52,211,153,0.12)' },
];

const StatCard = memo(({ label, value, icon, color, gradient, isMoney, delay = 0 }) => {
  const num = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const animated = useCountUp(num);
  const display = isMoney
    ? `PKR ${animated.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : Math.round(animated).toLocaleString();

  return (
    <div
      className="stat-card"
      style={{
        animationDelay: `${delay}ms`,
        borderTop: `2px solid ${color}`,
        boxShadow: `0 0 0 1px var(--border), 0 20px 40px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Background gradient blob */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 120, height: 120,
        background: gradient,
        borderRadius: '0 14px 0 120px',
        filter: 'blur(1px)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <p className="stat-card__label">{label}</p>
          <span style={{
            fontSize: 22,
            width: 42, height: 42,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: gradient,
            borderRadius: 12,
            border: `1px solid ${color}30`,
          }}>{icon}</span>
        </div>
        <p className="stat-card__value" style={{ color: '#fff' }}>{display}</p>
      </div>
    </div>
  );
});

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(8,13,28,0.95)',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      padding: 12,
      cornerRadius: 10,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
      ticks: { color: '#475569', font: { size: 11 } },
      border: { display: false },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#475569', font: { size: 11 } },
      border: { display: false },
    },
  },
};

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalOrders: 0, totalRevenue: 0,
    completedOrders: 0, pendingOrders: 0,
    todayRevenue: 0, todayOrders: 0, avgOrderValue: 0,
  });
  const [orderChart, setOrderChart] = useState({ labels: [], values: [] });
  const [revenueChart, setRevenueChart] = useState({ labels: [], values: [] });
  const [statusChart, setStatusChart] = useState({ labels: [], values: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/users/stats'),
          api.get('/orders/admin/all'),
        ]);
        const data = statsRes.data.data || {};
        const allOrders = ordersRes.data.data || [];
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = allOrders.filter(o => o.createdAt?.startsWith(today));
        const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
        const pendingOrders = allOrders.filter(o =>
          ['Pending', 'Pending - Cash on Delivery', 'Processing'].includes(o.status)
        ).length;
        const avgOrderValue = data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0;

        setStats({ ...data, todayRevenue, todayOrders: todayOrders.length, avgOrderValue, pendingOrders });

        // Charts
        const last7 = [], counts = [], revenues = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const ds = d.toISOString().split('T')[0];
          const dayOrders = allOrders.filter(o => o.createdAt?.startsWith(ds));
          last7.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          counts.push(dayOrders.length);
          revenues.push(dayOrders.reduce((s, o) => s + (o.total || 0), 0));
        }
        setOrderChart({ labels: last7, values: counts });
        setRevenueChart({ labels: last7, values: revenues });

        const statusMap = {};
        allOrders.forEach(o => {
          const s = o.status || 'Unknown';
          statusMap[s] = (statusMap[s] || 0) + 1;
        });
        setStatusChart({ labels: Object.keys(statusMap), values: Object.values(statusMap) });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const barData = React.useMemo(() => ({
    labels: orderChart.labels,
    datasets: [{
      label: 'Orders',
      data: orderChart.values,
      backgroundColor: 'rgba(124,58,237,0.7)',
      hoverBackgroundColor: 'rgba(168,85,247,0.9)',
      borderRadius: 8,
      borderSkipped: false,
    }],
  }), [orderChart]);

  const lineData = React.useMemo(() => ({
    labels: revenueChart.labels,
    datasets: [{
      label: 'Revenue (PKR)',
      data: revenueChart.values,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.08)',
      borderWidth: 2.5,
      pointBackgroundColor: '#10b981',
      pointBorderColor: 'rgba(16,185,129,0.4)',
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: true,
    }],
  }), [revenueChart]);

  const doughnutData = React.useMemo(() => ({
    labels: statusChart.labels,
    datasets: [{
      data: statusChart.values,
      backgroundColor: ['#7c3aed','#10b981','#f59e0b','#f43f5e','#06b6d4','#a855f7'],
      hoverBackgroundColor: ['#a855f7','#34d399','#fbbf24','#fb7185','#22d3ee','#c084fc'],
      borderWidth: 0,
      borderRadius: 4,
    }],
  }), [statusChart]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', padding: 14, font: { size: 11 }, boxWidth: 10, borderRadius: 4 },
      },
      tooltip: chartDefaults.plugins.tooltip,
    },
  };

  if (loading) {
    return (
      <div style={{ padding: 32 }}>
        <div className="page-header">
          <div className="skeleton" style={{ width: 180, height: 36 }} />
          <div className="skeleton" style={{ width: 120, height: 20 }} />
        </div>
        <div className="grid-stats" style={{ marginBottom: 24 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
          ))}
        </div>
        <div className="loading-center"><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: 4 }}>
            Welcome back — here's what's happening today
          </p>
        </div>
        <Clock />
      </div>

      {/* Stat cards */}
      <div className="grid-stats" style={{ marginBottom: 28 }}>
        {CARD_CONFIGS.map((cfg, i) => (
          <StatCard
            key={cfg.key}
            {...cfg}
            value={stats[cfg.key] ?? 0}
            delay={i * 80}
          />
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="chart-card" style={{ height: 360 }}>
          <h2>Orders Last 7 Days</h2>
          <p className="subtitle">Daily order volume trend</p>
          <div style={{ height: 280 }}>
            <Bar data={barData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
          </div>
        </div>
        <div className="chart-card" style={{ height: 360 }}>
          <h2>Order Status</h2>
          <p className="subtitle">Distribution by status</p>
          <div style={{ height: 280 }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="chart-card" style={{ height: 320 }}>
        <h2>Revenue Trend</h2>
        <p className="subtitle">Last 7 days in PKR</p>
        <div style={{ height: 240 }}>
          <Line data={lineData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
