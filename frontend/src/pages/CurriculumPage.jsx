import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageFrame from "../components/PageFrame";
import Button from "../components/Button";
import { getMyCurriculum } from '../api/studentApi';

const CurriculumPage = () => {
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyCurriculum()
      .then(setCurriculum)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const renderGroup = (group, level = 0) => (
    <div key={group.name + level} style={{ marginLeft: level * 20, marginBottom: 16 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
        {group.name} {group.required ? '(Bắt buộc)' : '(Tự chọn)'} - Tổng tín chỉ: {group.totalCredits}
      </div>
      {group.courses && group.courses.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: '600', marginBottom: 4 }}>Các môn học:</div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {group.courses.map(course => (
              <li key={course.code} style={{ marginBottom: 4 }}>
                {course.code} - {course.name} ({course.credits} tín chỉ)
              </li>
            ))}
          </ul>
        </div>
      )}
      {group.subgroups && group.subgroups.map(sub => renderGroup(sub, level + 1))}
    </div>
  );

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
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          ← Về Dashboard
        </Button>
      }
    >
      <div className="card">
        <div className="card-header">
          {curriculum?.code} - {curriculum?.majorName} ({curriculum?.startYear}{curriculum?.endYear ? `-${curriculum.endYear}` : ''})
        </div>
        <div className="card-body">
          {curriculum?.groups && curriculum.groups.map(group => renderGroup(group))}
        </div>
      </div>
    </PageFrame>
  );
};

export default CurriculumPage;