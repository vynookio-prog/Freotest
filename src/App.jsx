import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy loading Customer Pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const Gallery = lazy(() => import('./pages/Gallery'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));

// Lazy loading Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Loading indicator with Apple Liquid Glass style
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <div className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(93,58,41,0.08)] px-6 py-4 rounded-3xl flex items-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-[#8B5742]" />
      <span className="text-sm font-semibold text-[#5D3A29] tracking-wide">Memuat...</span>
    </div>
  </div>
);

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.toLowerCase().startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] text-[#1F2937] font-sans antialiased selection:bg-[#DDA15E] selection:text-white relative">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1F2937] font-sans antialiased selection:bg-[#DDA15E] selection:text-white flex flex-col relative overflow-x-hidden">
      {/* Apple-style Ambient Glow Orbs for Glassmorphism depth */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#DDA15E]/18 blur-[80px] md:blur-[120px] pointer-events-none -z-10 will-change-transform transform-gpu animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="fixed top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#8B5742]/12 blur-[90px] md:blur-[140px] pointer-events-none -z-10 will-change-transform transform-gpu animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="fixed bottom-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-[#DDA15E]/15 blur-[80px] md:blur-[130px] pointer-events-none -z-10 will-change-transform transform-gpu" />

      <Navbar />
      <main className="flex-grow pt-28">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
