import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Home page just redirects to the correct dashboard based on role
export default function HomePage() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const redirects = {
    ADMIN: '/admin',
    FACULTY: '/faculty',
    STUDENT: '/student',
  };

  return <Navigate to={redirects[user.role] || '/login'} replace />;
}
