import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = {
  ADMIN: [
    { path: '/admin', label: 'Dashboard', icon: '🏠' },
    { path: '/admin/departments', label: 'Manage Departments', icon: '🏛️' },
    { path: '/admin/students', label: 'Manage Students', icon: '🎓' },
    { path: '/admin/faculty', label: 'Manage Faculty', icon: '👩‍🏫' },
    { path: '/admin/fees', label: 'Fees Management', icon: '💰' },
  ],
  STUDENT: [
    { path: '/student', label: 'Dashboard', icon: '🏠' },
    { path: '/student/attendance', label: 'Attendance', icon: '📋' },
    { path: '/student/marks', label: 'Marks', icon: '📊' },
    { path: '/student/fees', label: 'Fees', icon: '💳' },
  ],
  FACULTY: [
    { path: '/faculty', label: 'Dashboard', icon: '🏠' },
    { path: '/faculty/attendance', label: 'Mark Attendance', icon: '✅' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = menuItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    ADMIN: 'role-admin',
    FACULTY: 'role-faculty',
    STUDENT: 'role-student',
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">EduERP</span>
        </div>
        <div className={`role-badge ${roleColors[user?.role]}`}>
          {user?.role}
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin' || item.path === '/student' || item.path === '/faculty'}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.email?.[0]?.toUpperCase()}</div>
          <div className="user-details">
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
