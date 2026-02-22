import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, ShoppingCart, LogOut } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import UsersList from './pages/Users';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Login from './pages/Login';

const Sidebar = ({ onLogout }: { onLogout: () => void }) => (
  <div className="sidebar">
    <div className="sidebar-logo">Parampare Admin</div>
    <nav className="nav-links">
      <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} /> Dashboard
      </NavLink>
      <NavLink to="/users" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Users size={20} /> Users
      </NavLink>
      <NavLink to="/products" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <ShoppingBag size={20} /> Products
      </NavLink>
      <NavLink to="/orders" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <ShoppingCart size={20} /> Orders
      </NavLink>
    </nav>
    <div style={{marginTop: 'auto'}}>
      <button 
        className="nav-item" 
        onClick={onLogout}
        style={{width: '100%', border: 'none', background: 'none', cursor: 'pointer'}}
      >
        <LogOut size={20} /> Logout
      </button>
    </div>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('adminToken'));

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
        } />
        
        <Route path="/*" element={
          isAuthenticated ? (
            <div className="admin-layout">
              <Sidebar onLogout={handleLogout} />
              <main className="main-content">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/users" element={<UsersList />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
