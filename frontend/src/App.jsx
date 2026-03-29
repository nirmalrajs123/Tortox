import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

import Footer from './components/Footer';
import ProductListPage from './components/ProductListPage';
import ProductDetailPage from './components/ProductDetailPage';

import CategoryGrid from './components/CategoryGrid';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <Router>
      <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', minHeight: '100vh', position: 'relative', transition: 'all 0.3s ease' }}>
          
          <Routes>
              {/* Home Page */}
              <Route path="/" element={
                  <>
                      <Navbar toggleTheme={toggleTheme} theme={theme} />
                      <Hero />
                      <CategoryGrid />
                      <ProductGrid />
                      <Footer />
                  </>
              } />
              
              {/* Login Page */}
              <Route path="/login" element={<LoginPage />} />

              {/* Dashboard CMS */}
              <Route path="/dashboard" element={<Dashboard toggleTheme={toggleTheme} theme={theme} />} />

              {/* Product List Page */}
              <Route path="/products" element={<ProductListPage />} />

              {/* Product Detail Page - by ID (legacy) and by slug (SEO) */}
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage usesSlug />} />
          </Routes>
          
      </div>
    </Router>
  )
}

export default App;
