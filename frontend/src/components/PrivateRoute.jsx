import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute — wraps a route and checks:
 *  1. User is logged in
 *  2. User has one of the allowed roles (if specified)
 */
export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to the user's own dashboard if wrong role
    const roleRedirects = {
      ADMIN: '/admin',
      FACULTY: '/faculty',
      STUDENT: '/student',
    };
    return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
  }

  return children;
}
