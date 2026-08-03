import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MenuProvider } from './context/MenuContext';
import { CartProvider } from './context/CartContext';
import { ReservationProvider } from './context/ReservationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CustomCursor from "./components/CustomCursor";
import ReservationSummarySticky from './components/ReservationSummarySticky';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Reserve from './pages/Reserve';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MenuProvider>
        <CartProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CustomCursor />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/reserve" element={<Reserve />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              {/* 404 fallback */}
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '4rem', color: 'var(--color-primary)' }}>404</p>
                  <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Page not found.</p>
                </div>
              } />
            </Routes>
            <Footer />
          </div>
        </CartProvider>
          <ReservationProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <CustomCursor />
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/reserve" element={<Reserve />} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* 404 fallback */}
                <Route path="*" element={
                  <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '4rem', color: 'var(--color-primary)' }}>404</p>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Page not found.</p>
                  </div>
                } />
              </Routes>
              <ReservationSummarySticky />
              <Footer />
            </div>
          </ReservationProvider>
        </MenuProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;