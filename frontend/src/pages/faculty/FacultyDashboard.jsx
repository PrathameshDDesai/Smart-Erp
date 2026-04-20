import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [profRes, studRes] = await Promise.all([
          API.get(`/faculty/by-user/${user.userId}`),
          API.get('/students'),
        ]);
        setProfile(profRes.data);
        setStudents(studRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.userId]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-heading">Welcome, {profile?.first_name}! 👋</h2>
          <p className="page-subtitle">{profile?.department} Department</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <Link to="/faculty/attendance" className="stat-card stat-blue">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">Mark</span>
            <span className="stat-label">Attendance</span>
          </div>
        </Link>
        <Link to="/faculty/create-exam" className="stat-card stat-green">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <span className="stat-value">Create</span>
            <span className="stat-label">Online Exam</span>
          </div>
        </Link>
        <div className="stat-card stat-purple">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <span className="stat-value">{students.length}</span>
            <span className="stat-label">Total Students</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3 className="section-title">Students List</h3>
        <div className="table-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>PRN</th><th>Name</th><th>Department</th><th>Semester</th></tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.prn}>
                    <td><span className="badge">{s.prn}</span></td>
                    <td>{s.first_name} {s.last_name}</td>
                    <td>{s.department}</td>
                    <td>Semester {s.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
