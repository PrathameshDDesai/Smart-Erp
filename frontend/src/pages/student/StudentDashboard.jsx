import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [fees, setFees] = useState([]);
  const [marksSummary, setMarksSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await API.get(`/students/by-user/${user.userId}`);
        const prn = profileRes.data.prn;
        setProfile(profileRes.data);

        const [attRes, feesRes, marksRes] = await Promise.all([
          API.get(`/attendance/summary/${prn}`),
          API.get(`/fees/${prn}`),
          API.get(`/marks/summary/${prn}`),
        ]);
        setAttendanceSummary(attRes.data);
        setFees(feesRes.data);
        setMarksSummary(marksRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.userId]);

  const avgAttendance = attendanceSummary.length > 0
    ? Math.round(attendanceSummary.reduce((s, r) => s + Number(r.percentage), 0) / attendanceSummary.length)
    : 0;

  const pendingFees = fees.filter(f => f.status === 'PENDING').length;

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-heading">Welcome, {profile?.first_name}! 👋</h2>
          <p className="page-subtitle">{profile?.department} · Semester {profile?.semester} · {profile?.prn}</p>
        </div>
      </div>

      <div className="stats-grid">
        <Link to="/student/attendance" className="stat-card stat-blue">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{avgAttendance}%</span>
            <span className="stat-label">Overall Attendance</span>
          </div>
        </Link>
        <Link to="/student/marks" className="stat-card stat-purple">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{attendanceSummary.length}</span>
            <span className="stat-label">Subjects Enrolled</span>
          </div>
        </Link>
        <Link to="/student/fees" className="stat-card stat-orange">
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <span className="stat-value">{pendingFees}</span>
            <span className="stat-label">Pending Fee Dues</span>
          </div>
        </Link>
        <Link to="/student/exam" className="stat-card stat-green">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <span className="stat-value">Take</span>
            <span className="stat-label">Online Exam</span>
          </div>
        </Link>
      </div>

      {/* Attendance Summary */}
      {attendanceSummary.length > 0 && (
        <div className="dashboard-section">
          <h3 className="section-title">Attendance by Subject</h3>
          <div className="attendance-bars">
            {attendanceSummary.map(item => (
              <div key={item.subject} className="att-bar-item">
                <div className="att-bar-label">
                  <span>{item.subject}</span>
                  <span className={`att-pct ${item.percentage < 75 ? 'att-low' : 'att-ok'}`}>{item.percentage}%</span>
                </div>
                <div className="att-bar-track">
                  <div
                    className={`att-bar-fill ${item.percentage < 75 ? 'att-fill-low' : 'att-fill-ok'}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="att-bar-meta">{item.present}/{item.total_classes} classes</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
