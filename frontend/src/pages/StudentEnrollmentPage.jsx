import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageFrame from '../components/PageFrame';
import { getStudentEnrollments } from '../api/studentEnrollmentApi';
import { getAdminStudentEnrollments } from '../api/adminStudentEnrollmentApi';

export default function StudentEnrollmentPage() {
  const { studentCode } = useParams();
  const [filters, setFilters] = useState({ semester: '', year: '', courseCode: '', classCode: '' });
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // GPA calculation
  const gpa = React.useMemo(() => {
    let totalCredits = 0, totalPoints = 0;
    enrollments.forEach(enr => {
      const credits = enr.class?.course?.credits || 0;
      const scale = enr.grade?.total4Scale;
      if (credits && scale != null) {
        totalCredits += credits;
        totalPoints += credits * scale;
      }
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '';
  }, [enrollments]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      let data;
      if (studentCode) {
        data = await getAdminStudentEnrollments({ ...filters, studentCode });
      } else {
        data = await getStudentEnrollments(filters);
      }
      setEnrollments(data.items || []);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    // eslint-disable-next-line
  }, [filters, studentCode]);

  return (
    <PageFrame
      title={studentCode ? `Student ${studentCode} Enrollments` : 'My Enrollments'}
      headerActions={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="Semester" value={filters.semester} onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))} />
          <input placeholder="Year" value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))} />
          <input placeholder="Course Code" value={filters.courseCode} onChange={e => setFilters(f => ({ ...f, courseCode: e.target.value }))} />
          <input placeholder="Class Code" value={filters.classCode} onChange={e => setFilters(f => ({ ...f, classCode: e.target.value }))} />
        </div>
      }
    >
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Class Code</th>
            <th>Course</th>
            <th>Course Name</th>
            <th>Credits</th>
            <th>Semester</th>
            <th>Year</th>
            <th>Status</th>
            <th>Midterm</th>
            <th>Final</th>
            <th>Total (10)</th>
            <th>Total (4)</th>
            <th>Letter</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={12}>Loading...</td></tr>
          ) : enrollments.length === 0 ? (
            <tr><td colSpan={12}>No enrollments found.</td></tr>
          ) : enrollments.map(enr => (
            <tr key={enr.id}>
              <td>{enr.class?.code}</td>
              <td>{enr.class?.course?.code}</td>
              <td>{enr.class?.course?.name}</td>
              <td>{enr.class?.course?.credits}</td>
              <td>{enr.semester}</td>
              <td>{enr.year}</td>
              <td>{enr.status}</td>
              <td>{enr.grade?.midTerm ?? ''}</td>
              <td>{enr.grade?.finalExam ?? ''}</td>
              <td>{enr.grade?.total10Scale ?? ''}</td>
              <td>{enr.grade?.total4Scale ?? ''}</td>
              <td>{enr.grade?.letterGrade ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 12, fontWeight: 600 }}>
        GPA: {gpa}
      </div>
    </PageFrame>
  );
}
