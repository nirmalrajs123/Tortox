import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', position: 'relative' }}>
          
          <Routes>
              {/* Home Page */}
              <Route path="/" element={
                  <>
                      <Navbar />
                      <Hero />
                      <ProductGrid />
                      <Footer />
                  </>
              } />
              
              {/* Login Page */}
              <Route path="/login" element={<LoginPage />} />

              {/* Dashboard CMS */}
              <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          
      </div>
    </Router>
  )
}

export default App;
