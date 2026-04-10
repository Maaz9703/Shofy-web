import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Admin components
import DashboardLayout from './components/DashboardLayout';
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const CouponsPage = lazy(() => import('./pages/CouponsPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ActivityFeedPage = lazy(() => import('./pages/ActivityFeedPage'));
const InventoryAlertsPage = lazy(() => import('./pages/InventoryAlertsPage'));
const CustomerInsightsPage = lazy(() => import('./pages/CustomerInsightsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Web / storefront components
import WebLayout from './components/WebLayout';
const HomePage = lazy(() => import('./pages/web/HomePage'));
const ShopPage = lazy(() => import('./pages/web/ShopPage'));
const ProductPage = lazy(() => import('./pages/web/ProductPage'));
const CartPage = lazy(() => import('./pages/web/CartPage'));
const CheckoutPage = lazy(() => import('./pages/web/CheckoutPage'));
const WishlistPage = lazy(() => import('./pages/web/WishlistPage'));
const WebOrdersPage = lazy(() => import('./pages/web/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/web/OrderDetailPage'));
const ProfilePage = lazy(() => import('./pages/web/ProfilePage'));
const AddressesPage = lazy(() => import('./pages/web/AddressesPage'));
const WebLoginPage = lazy(() => import('./pages/web/WebLoginPage'));
const RegisterPage = lazy(() => import('./pages/web/RegisterPage'));

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
      }}>
        <div style={{ color: '#94a3b8', fontSize: 18 }}>Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#94a3b8', fontSize: 18 }}>
        Loading...
      </div>
    }>
      <Routes>
        {/* ─── Admin Routes ─── */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <DashboardLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="activity" element={<ActivityFeedPage />} />
          <Route path="inventory" element={<InventoryAlertsPage />} />
          <Route path="customers" element={<CustomerInsightsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* ─── Web / Storefront Routes ─── */}
        <Route path="/" element={<WebLayout><HomePage /></WebLayout>} />
        <Route path="/shop" element={<WebLayout><ShopPage /></WebLayout>} />
        <Route path="/product/:id" element={<WebLayout><ProductPage /></WebLayout>} />
        <Route path="/cart" element={<WebLayout><CartPage /></WebLayout>} />
        <Route path="/checkout" element={<WebLayout><CheckoutPage /></WebLayout>} />
        <Route path="/wishlist" element={<WebLayout><WishlistPage /></WebLayout>} />
        <Route path="/orders" element={<WebLayout><WebOrdersPage /></WebLayout>} />
        <Route path="/orders/:id" element={<WebLayout><OrderDetailPage /></WebLayout>} />
        <Route path="/profile" element={<WebLayout><ProfilePage /></WebLayout>} />
        <Route path="/profile/addresses" element={<WebLayout><AddressesPage /></WebLayout>} />
        <Route path="/login" element={<WebLayout><WebLoginPage /></WebLayout>} />
        <Route path="/register" element={<WebLayout><RegisterPage /></WebLayout>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
