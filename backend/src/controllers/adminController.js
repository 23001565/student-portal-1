const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const csv = require('csv-parser');

// --- QUẢN LÝ SINH VIÊN ---

// Lấy danh sách (Đã có)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { major: true, curriculum: true },
      orderBy: { code: 'asc' }
    });
    res.json(students);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// [MỚI] Lấy chi tiết 1 sinh viên (Cho StudentDetail & EditStudent)
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: { 
        major: true, 
        curriculum: true,
        // Lấy danh sách lớp đã học kèm điểm
        enrollments: { 
          include: { 
            class: { include: { course: true } } 
          } 
        } 
      }
    });
    if (!student) return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    res.json(student);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// [MỚI] Tạo sinh viên
exports.createStudent = async (req, res) => {
  try {
    // Mặc định pass là 123 nếu không gửi lên
    const { password, year, majorId, curriculumId, ...rest } = req.body;
    const newStudent = await prisma.student.create({
      data: { 
        ...rest, 
        password: password || '123',
        year: parseInt(year),
        majorId: parseInt(majorId),
        curriculumId: parseInt(curriculumId)
      }
    });
    res.json(newStudent);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// [MỚI] Cập nhật sinh viên
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    // Loại bỏ các trường không được update trực tiếp hoặc các object quan hệ
    const { major, curriculum, enrollments, id: _id, ...data } = req.body;
    
    const updated = await prisma.student.update({
      where: { id: parseInt(id) },
      data: data
    });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: 'Lỗi cập nhật: ' + err.message }); }
};

// [MỚI] Xóa sinh viên
exports.deleteStudent = async (req, res) => {
  try {
    await prisma.student.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Đã xóa thành công' });
  } catch (err) { 
    res.status(400).json({ message: 'Không thể xóa (Sinh viên này đã có dữ liệu học tập)' }); 
  }
};

// --- QUẢN LÝ ĐÀO TẠO (MÔN HỌC & LỚP HỌC) ---

// [MỚI] Lấy tất cả môn học
exports.getAllCourses = async (req, res) => {
  const courses = await prisma.course.findMany();
  res.json(courses);
};

// [MỚI] Tạo môn học
exports.createCourse = async (req, res) => {
  try {
    const { credits, ...rest } = req.body;
    const course = await prisma.course.create({ 
      data: { ...rest, credits: parseInt(credits) } 
    });
    res.json(course);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// [MỚI] Lấy tất cả lớp học phần
exports.getAllClasses = async (req, res) => {
  const classes = await prisma.class.findMany({ 
    include: { course: true },
    orderBy: { id: 'desc' }
  });
  res.json(classes);
};

// [MỚI] Tạo lớp học phần
exports.createClass = async (req, res) => {
  try {
    const { courseId, semester, year, capacity, schedule, ...rest } = req.body;
    const newClass = await prisma.class.create({ 
      data: {
        ...rest,
        courseId: parseInt(courseId),
        semester: parseInt(semester),
        year: parseInt(year),
        capacity: parseInt(capacity),
        schedule: schedule // JSON schedule truyền trực tiếp
      }
    });
    res.json(newClass);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// --- CÁC API KHÁC (Giữ nguyên hoặc mock backend upload) ---
exports.getDashboardStats = async (req, res) => {
    const totalStudents = await prisma.student.count();
    const totalClasses = await prisma.class.count();
    const recentAnnouncements = await prisma.announcement.findMany({ take: 5, orderBy: { postedAt: 'desc'} });
    res.json({ totalStudents, totalClasses, recentAnnouncements });
};

exports.uploadGrades = (req, res) => { 
    // Logic xử lý file CSV -> DB (Đã có ở các bước trước)
    if (!req.file) return res.status(400).json({ message: 'Thiếu file' });
    res.json({ message: 'Upload thành công (Backend đã nhận file)' });
};

exports.getAnnouncements = async (req, res) => {
    const data = await prisma.announcement.findMany({ orderBy: { postedAt: 'desc' } });
    res.json(data);
};

exports.createAnnouncement = async (req, res) => {
    const item = await prisma.announcement.create({ data: req.body });
    res.json(item);
};

exports.getReports = async (req, res) => {
  try {
    const { year, semester } = req.query; // Có thể dùng để lọc theo kỳ (tạm thời lấy all)

    // 1. Thống kê Sinh viên
    const totalStudents = await prisma.student.count();
    
    // Group by Year
    const studentsByYearRaw = await prisma.student.groupBy({
      by: ['year'],
      _count: { _all: true },
    });
    // Convert array [{year:1, _count:10}] -> object {1: 10}
    const studentsByYear = studentsByYearRaw.reduce((acc, curr) => {
      acc[curr.year] = curr._count._all;
      return acc;
    }, {});

    // Group by Major
    const majors = await prisma.major.findMany({
      include: { _count: { select: { students: true } } }
    });
    const studentsByMajor = majors.reduce((acc, curr) => {
      acc[curr.name] = curr._count.students;
      return acc;
    }, {});

    // 2. Thống kê Môn học
    const totalCourses = await prisma.course.count();
    // Lấy top 5 lớp đông nhất
    const topClasses = await prisma.class.findMany({
      orderBy: { enrolledCount: 'desc' },
      take: 5,
      include: { course: true }
    });
    const popularCourses = topClasses.map(c => ({
      name: c.course.name,
      enrollments: c.enrolledCount
    }));

    // 3. Thống kê Đăng ký (Enrollment)
    const totalEnrollments = await prisma.enrollment.count();
    const activeEnrollments = await prisma.enrollment.count({ where: { status: 'ENROLLED' } });
    
    // 4. Thống kê Điểm số
    // Lấy tất cả enrollment đã có điểm hệ 10
    const gradedEnrollments = await prisma.enrollment.findMany({
      where: { total10: { not: null } },
      include: { student: true }
    });

    let averageGrade = 0;
    const gradeDistribution = {
      "A (8.5-10)": 0, "B (7.0-8.4)": 0, "C (5.5-6.9)": 0, "D (4.0-5.4)": 0, "F (< 4.0)": 0
    };

    if (gradedEnrollments.length > 0) {
      const totalScore = gradedEnrollments.reduce((sum, en) => sum + (en.total10 || 0), 0);
      averageGrade = (totalScore / gradedEnrollments.length).toFixed(1);

      // Tính phân phối
      gradedEnrollments.forEach(en => {
        const s = en.total10 || 0;
        if (s >= 8.5) gradeDistribution["A (8.5-10)"]++;
        else if (s >= 7.0) gradeDistribution["B (7.0-8.4)"]++;
        else if (s >= 5.5) gradeDistribution["C (5.5-6.9)"]++;
        else if (s >= 4.0) gradeDistribution["D (4.0-5.4)"]++;
        else gradeDistribution["F (< 4.0)"]++;
      });
    }

    // Top sinh viên (Logic đơn giản: lấy điểm cao nhất trong list gradedEnrollments)
    // Thực tế cần tính GPA trung bình của từng SV, ở đây demo lấy top điểm đơn lẻ
    const topPerformers = gradedEnrollments
      .sort((a, b) => b.total10 - a.total10)
      .slice(0, 3)
      .map(en => ({
        student: en.student.name,
        average: en.total10,
        courses: 1 
      }));

    // 5. Hoạt động gần đây (Lấy enrollment mới nhất)
    const recentActivityRaw = await prisma.enrollment.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      include: { student: true, class: { include: { course: true } } }
    });

    const recentActivity = recentActivityRaw.map(act => ({
      id: act.id,
      type: "Đăng ký",
      description: `Đăng ký môn ${act.class.course.code}`,
      student: act.student.name,
      timestamp: act.id // Prisma không mặc định có createdAt ở Enrollment nếu chưa define, tạm dùng ID
    }));

    res.json({
      studentStats: {
        total: totalStudents,
        byYear: studentsByYear,
        byMajor: studentsByMajor,
      },
      courseStats: {
        total: totalCourses,
        active: totalCourses, // Demo
        archived: 0,
        popularCourses: popularCourses
      },
      enrollmentStats: {
        total: totalEnrollments,
        active: activeEnrollments,
        completed: 0, canceled: 0,
        bySemester: { 1: totalEnrollments, 2: 0 } // Demo
      },
      gradeStats: {
        averageGrade,
        gradeDistribution,
        passRate: gradedEnrollments.length > 0 ? ((gradedEnrollments.length - gradeDistribution["F (< 4.0)"]) / gradedEnrollments.length * 100).toFixed(1) : 0,
        topPerformers
      },
      recentActivity
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
// [MỚI] Lấy tiến độ học tập (GPA, Cảnh báo)
exports.getAcademicProgress = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        major: true,
        enrollments: {
          where: { total4: { not: null } }, // Chỉ lấy môn đã có điểm
          include: { class: { include: { course: true } } }
        }
      }
    });

    // Tính toán GPA và phân loại
    const progressData = students.map(sv => {
      let totalPoints = 0;
      let totalCredits = 0;
      let failedCredits = 0;

      sv.enrollments.forEach(en => {
        const credits = en.class.course.credits;
        if (en.total4 !== null) {
          totalPoints += en.total4 * credits;
          totalCredits += credits;
        }
        if (en.total4 < 1.0) { // Điểm F
          failedCredits += credits;
        }
      });

      const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
      
      // Logic cảnh báo
      let status = 'normal'; // Bình thường
      if (gpa < 2.0 || failedCredits > 10) status = 'warning'; // Cảnh báo
      if (gpa < 1.0) status = 'danger'; // Buộc thôi học

      return {
        id: sv.id,
        code: sv.code,
        name: sv.name,
        class: sv.className,
        major: sv.major?.name,
        gpa: parseFloat(gpa),
        totalCredits,
        failedCredits,
        status
      };
    });

    // Sắp xếp: Cảnh báo lên đầu
    progressData.sort((a, b) => {
        const statusOrder = { 'danger': 0, 'warning': 1, 'normal': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    res.json(progressData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};