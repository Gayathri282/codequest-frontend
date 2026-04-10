import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar        from './components/Navbar';
import Footer        from './components/Footer';
import BottomNav     from './components/BottomNav';
import Home          from './pages/Home';
import ProductPage   from './pages/ProductPage';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import OrderSuccess  from './pages/OrderSuccess';
import Login         from './pages/Login';
import Register      from './pages/Register';
import AuthCallback  from './pages/AuthCallback';
import Orders        from './pages/Orders';

import AdminLayout   from './pages/admin/AdminLayout';
import Dashboard     from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AddProduct    from './pages/admin/AddProduct';
import AdminOrders   from './pages/admin/AdminOrders';
import AdminUsers    from './pages/admin/AdminUsers';
import AdminBanners     from './pages/admin/AdminBanners';
import AdminCategories  from './pages/admin/AdminCategories';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center" style={{ background: '#050505' }}>
      <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" /> {/* Gold spinner */}
    </div>
  );
  if (!user)   return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

function PublicLayout({ children }) {
  const location = useLocation();
  // Don't show Navbar/Footer on product detail (it's full screen)
  const isDetail = location.pathname.startsWith('/product/');

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      {!isDetail && <Navbar />}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      {!isDetail && <Footer />}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Admin routes — own layout */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index                   element={<Dashboard />} />
        <Route path="products"         element={<AdminProducts />} />
        <Route path="products/add"     element={<AddProduct />} />
        <Route path="products/edit/:id" element={<AddProduct />} />
        <Route path="orders"           element={<AdminOrders />} />
        <Route path="users"            element={<AdminUsers />} />
        <Route path="banners"          element={<AdminBanners />} />
        <Route path="categories"       element={<AdminCategories />} />
      </Route>

      {/* Public routes */}
      <Route path="*" element={
        <PublicLayout>
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="/breed/:slug"    element={<ProductPage />} />
            <Route path="/product/:id"    element={<ProductDetail />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/register"       element={<Register />} />
            <Route path="/auth/callback"  element={<AuthCallback />} />
            <Route path="/cart"           element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout"       element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
            <Route path="/my-orders"      element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="*"               element={<Navigate to="/" replace />} />
          </Routes>
        </PublicLayout>
      } />
    </Routes>
  );
}
