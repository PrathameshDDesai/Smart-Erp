import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AIChatbot from './components/AIChatbot';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageFaculty from './pages/admin/ManageFaculty';
import ManageDepartments from './pages/admin/ManageDepartments';
import AdminFees from './pages/admin/AdminFees';

import StudentDashboard from './pages/student/StudentDashboard';
import AttendancePage from './pages/student/AttendancePage';
import MarksPage from './pages/student/MarksPage';
import FeesPage from './pages/student/FeesPage';
import OnlineExam from './pages/student/OnlineExam';

import FacultyDashboard from './pages/faculty/FacultyDashboard';
import MarkAttendance from './pages/faculty/MarkAttendance';
import CreateExam from './pages/faculty/CreateExam';

// Layout wrapper for authenticated pages (sidebar + navbar)
function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar />
        <main className="dashboard-body">
          <Outlet />
        </main>
      </div>
      <AIChatbot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Home redirects based on role */}
          <Route path="/" element={
            <PrivateRoute><HomePage /></PrivateRoute>
          } />

          {/* ── ADMIN ── */}
          <Route element={<PrivateRoute roles={['ADMIN']}><DashboardLayout /></PrivateRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/faculty" element={<ManageFaculty />} />
            <Route path="/admin/departments" element={<ManageDepartments />} />
            <Route path="/admin/fees" element={<AdminFees />} />
          </Route>

          {/* ── STUDENT ── */}
          <Route element={<PrivateRoute roles={['STUDENT']}><DashboardLayout /></PrivateRoute>}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/attendance" element={<AttendancePage />} />
            <Route path="/student/marks" element={<MarksPage />} />
            <Route path="/student/fees" element={<FeesPage />} />
            <Route path="/student/exam" element={<OnlineExam />} />
          </Route>

          {/* ── FACULTY ── */}
          <Route element={<PrivateRoute roles={['FACULTY']}><DashboardLayout /></PrivateRoute>}>
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/attendance" element={<MarkAttendance />} />
            <Route path="/faculty/create-exam" element={<CreateExam />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
