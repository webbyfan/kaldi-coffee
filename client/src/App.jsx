import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wholesale from './pages/Wholesale';
import About from './pages/About';
import Journal from './pages/Journal';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import Admin from './pages/Admin';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import MyOrders from './pages/MyOrders';
import PaymentVerify from './pages/PaymentVerify';
import NotFound from './pages/NotFound';

import './index.css';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <CartProvider>
            <ScrollToTop />

        {/* Accessibility Skip Link */}
        <a
          href="#main-content"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 'auto',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
          onFocus={(e) => {
            e.target.style.left = '50%';
            e.target.style.transform = 'translateX(-50%)';
            e.target.style.width = 'auto';
            e.target.style.height = 'auto';
            e.target.style.top = '8px';
            e.target.style.padding = '8px 16px';
            e.target.style.background = 'var(--color-espresso)';
            e.target.style.color = 'var(--color-cream)';
            e.target.style.zIndex = '99999';
            e.target.style.borderRadius = '4px';
          }}
          onBlur={(e) => {
            e.target.style.left = '-9999px';
          }}
        >
          Skip to main content
        </a>

        {/* Global Navigation */}
        <Navbar />

        {/* Slide-out Cart Drawer */}
        <CartDrawer />

        {/* App Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wholesale" element={<Wholesale />} />
          <Route path="/about" element={<About />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<Legal initialTab="privacy" />} />
          <Route path="/terms" element={<Legal initialTab="terms" />} />
          <Route path="/shipping-policy" element={<Legal initialTab="shipping" />} />
          <Route path="/refund-policy" element={<Legal initialTab="refund" />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/profile" element={<MyOrders />} />
          <Route path="/payment-verify" element={<PaymentVerify />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Global Footer */}
        <Footer />
          </CartProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
