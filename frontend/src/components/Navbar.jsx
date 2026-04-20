import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/admin':              'Admin Dashboard',
  '/admin/students':     'Manage Students',
  '/admin/faculty':      'Manage Faculty',
  '/admin/fees':         'Fees Management',
  '/student':            'Student Dashboard',
  '/student/attendance': 'My Attendance',
  '/student/marks':      'My Marks',
  '/student/fees':       'My Fees',
  '/faculty':            'Faculty Dashboard',
  '/faculty/attendance': 'Mark Attendance',
};

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'EduERP';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="user-avatar-sm">{user?.email?.[0]?.toUpperCase()}</div>
          <span className="navbar-email">{user?.email}</span>
        </div>
      </div>
    </header>
  );
}
