import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageFrame from "../components/PageFrame";
import Button from "../components/Button";
import { getMyCurriculum } from '../api/studentApi';
import { getCurriculumByCode } from '../api/curriculumApi';
import { useAuth } from '../context/authContext';

const CurriculumPage = () => {
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code && user?.role === 'admin') {
      getCurriculumByCode(code)
        .then(setCurriculum)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      getMyCurriculum()
        .then(setCurriculum)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [searchParams, user]);

  const renderGroup = (group, level = 0, isLast = true) => {
    const rows = [];
    const indent = '  '.repeat(level);
    const prefix = level > 0 ? (isLast ? '└── ' : '├── ') : '';
    const bgColor = level === 0 ? '#e8f4f8' : level === 1 ? '#f0f8e8' : '#fff8e8';
    // Group header row
    rows.push(
      <tr key={`${group.name}-${level}-header`} style={{ backgroundColor: bgColor }}>
        <td colSpan="4" style={{ fontWeight: 'bold', padding: '8px', border: '1px solid #ddd', paddingLeft: `${8 + level * 20}px` }}>
          {indent}{prefix}{group.name} {group.required ? '(Bắt buộc)' : '(Tự chọn)'} - Tổng tín chỉ: {group.totalCredits}
        </td>
      </tr>
    );
    // Courses rows
    if (group.courses && group.courses.length > 0) {
      group.courses.forEach((course, index) => {
        const coursePrefix = index === group.courses.length - 1 && (!group.subgroups || group.subgroups.length === 0) ? '└── ' : '├── ';
        rows.push(
          <tr key={`${group.name}-${level}-${course.code}`}>
            <td style={{ padding: '4px 8px', border: '1px solid #ddd', paddingLeft: `${8 + (level + 1) * 20}px` }}>
              {indent}  {coursePrefix}
            </td>
            <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>{course.code}</td>
            <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>{course.name}</td>
            <td style={{ padding: '4px 8px', border: '1px solid #ddd' }}>{course.credits}</td>
          </tr>
        );
      });
    }
    // Subgroups
    if (group.subgroups && group.subgroups.length > 0) {
      group.subgroups.forEach((sub, index) => {
        const isLastSub = index === group.subgroups.length - 1;
        rows.push(...renderGroup(sub, level + 1, isLastSub));
      });
    }
    return rows;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <PageFrame
      title="Chương trình đào tạo"
      subtitle="Xem chương trình đào tạo của bạn"
      headerActions={
        <Button variant="outline" onClick={() => navigate(user?.role === 'admin' ? "/admin/curricula" : "/dashboard")}>
          ← {user?.role === 'admin' ? 'Về Quản lý CTĐT' : 'Về Dashboard'}
        </Button>
      }
    >
      <div className="card">
        <div className="card-header">
          {curriculum?.code} - {curriculum?.majorName} ({curriculum?.startYear}{curriculum?.endYear ? `-${curriculum.endYear}` : ''})
        </div>
        <div className="card-body">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#e0e0e0' }}>Nhóm</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#e0e0e0' }}>Mã môn</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#e0e0e0' }}>Tên môn</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#e0e0e0' }}>Tín chỉ</th>
              </tr>
            </thead>
            <tbody>
              {curriculum?.groups && curriculum.groups.flatMap(group => renderGroup(group))}
            </tbody>
          </table>
        </div>
      </div>
    </PageFrame>
  );
};

export default CurriculumPage;