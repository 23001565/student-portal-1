import React, { useEffect, useState } from 'react';
import PageFrame from '../../components/PageFrame';
import {
  listEnrollments,
  addEnrollment,
  deleteEnrollment,
  updateGrade,
  uploadGradeCSV,
} from '../../api/adminEnrollmentApi';

export default function AdminEnrollmentPage() {
  const [filters, setFilters] = useState({ semester: '', year: '', classCode: '', courseCode: '', studentCode: '' });
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [csvFile, setCsvFile] = useState(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const data = await listEnrollments(filters);
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
  }, [filters]);

  const handleAdd = async () => {
    // Prompt for classCode and studentCode
    const classCode = prompt('Class Code?');
    const studentCode = prompt('Student Code?');
    if (!classCode || !studentCode) return;
    try {
      await addEnrollment({ classCode, studentCode });
      fetchEnrollments();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enrollment?')) return;
    try {
      await deleteEnrollment(id);
      fetchEnrollments();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEditGrade = async (enrollment) => {
    const midTerm = prompt('Midterm grade?', enrollment.midTerm || '');
    const finalExam = prompt('Final exam grade?', enrollment.finalExam || '');
    const total10Scale = prompt('Total (10 scale)?', enrollment.total10Scale || '');
    if (midTerm === null || finalExam === null || total10Scale === null) return;
    try {
      await updateGrade(enrollment.id, { midTerm, finalExam, total10Scale });
      fetchEnrollments();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUploadCSV = async () => {
    if (!csvFile) return;
    const classCode = prompt('Class Code for CSV upload?');
    if (!classCode) return;
    try {
      await uploadGradeCSV(classCode, csvFile);
      fetchEnrollments();
      setCsvFile(null);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <PageFrame
      title="Admin Enrollment Management"
      headerActions={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="Semester" value={filters.semester} onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))} />
          <input placeholder="Year" value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))} />
          <input placeholder="Class Code" value={filters.classCode} onChange={e => setFilters(f => ({ ...f, classCode: e.target.value }))} />
          <input placeholder="Course Code" value={filters.courseCode} onChange={e => setFilters(f => ({ ...f, courseCode: e.target.value }))} />
          <input placeholder="Student Code" value={filters.studentCode} onChange={e => setFilters(f => ({ ...f, studentCode: e.target.value }))} />
          <button onClick={handleAdd}>Add Enrollment</button>
        </div>
      }
    >
      <div style={{ marginBottom: 12 }}>
        <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files[0])} />
        <button onClick={handleUploadCSV} disabled={!csvFile}>Upload Grade CSV</button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Semester</th>
            <th>Year</th>
            <th>Class Code</th>
            <th>Course Code</th>
            <th>Student Code</th>
            <th>Status</th>
            <th>Midterm</th>
            <th>Final</th>
            <th>Total (10)</th>
            <th>Total (4)</th>
            <th>Letter</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={12}>Loading...</td></tr>
          ) : enrollments.length === 0 ? (
            <tr><td colSpan={12}>No enrollments found.</td></tr>
          ) : enrollments.map(enr => (
            <tr key={enr.id}>
              <td>{enr.semester}</td>
              <td>{enr.year}</td>
              <td>{enr.classCode}</td>
              <td>{enr.courseCode}</td>
              <td>{enr.courseName}</td>
              <td>{enr.studentCode}</td>
              <td>{enr.studentName}</td>
              <td>{enr.status}</td>
              <td>{enr.midTerm}</td>
              <td>{enr.finalExam}</td>
              <td>{enr.total10Scale}</td>
              <td>{enr.total4Scale}</td>
              <td>{enr.letterGrade}</td>
              <td>
                <button onClick={() => handleEditGrade(enr)}>Edit Grade</button>
                <button onClick={() => handleDelete(enr.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageFrame>
  );
}
