import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Box, PlusCircle, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>
          <Box size={24} color="var(--primary)" />
          <span>InventoryHub</span>
        </h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/products" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Box size={20} />
          <span>Product List</span>
        </NavLink>

        {isAdmin() && (
          <NavLink 
            to="/products/new" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <PlusCircle size={20} />
            <span>Add Product</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="user-info-panel">
            <div className="user-avatar">
              {getInitials(user.email)}
            </div>
            <div className="user-meta">
              <span className="user-email" title={user.email}>{user.email}</span>
              <span className="user-role">
                {user.roles?.[0]?.replace('ROLE_', '') || 'USER'}
              </span>
            </div>
          </div>
        )}
        <button className="btn btn-secondary" onClick={logout} style={{ width: '100%' }}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
