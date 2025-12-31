const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lấy Profile
exports.getProfile = async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { id: req.user.id },
    include: { major: true, curriculum: true }
  });
  res.json(student);
};

// Lấy danh sách lớp mở đăng ký (registrationApi.getOpenCourses)
exports.getOpenCourses = async (req, res) => {
  const classes = await prisma.class.findMany({
    include: { course: true }
  });

  // Map dữ liệu để khớp với Frontend
  const formatted = classes.map(c => ({
    id: c.id,
    code: c.course.code,      // Mã môn (INT3306)
    name: c.course.name,      // Tên môn
    classCode: c.code,        // Mã lớp (INT3306 1)
    credits: c.course.credits,
    schedule: c.schedule,     // JSON từ DB
    enrolled: c.enrolledCount,
    capacity: c.capacity
  }));
  res.json(formatted);
};

// Xử lý gửi đăng ký (registrationApi.submitRegistration)
exports.submitRegistration = async (req, res) => {
  const { courses } = req.body; // Mảng class IDs
  const studentId = req.user.id;

  try {
    // Transaction: Đảm bảo tính toàn vẹn (ACID)
    await prisma.$transaction(async (tx) => {
      for (const classId of courses) {
        // Check lại sĩ số lần cuối
        const cls = await tx.class.findUnique({ where: { id: classId } });
        if (cls.enrolledCount >= cls.capacity) {
          throw new Error(`Lớp ${cls.code} đã đầy`);
        }

        // Tạo enrollment
        await tx.enrollment.create({
          data: { studentId, classId }
        });

        // Tăng sĩ số
        await tx.class.update({
          where: { id: classId },
          data: { enrolledCount: { increment: 1 } }
        });
      }
    });

    res.json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy bảng điểm
exports.getGrades = async (req, res) => {
  const grades = await prisma.enrollment.findMany({
    where: { studentId: req.user.id },
    include: { class: { include: { course: true } } }
  });
  
  // Format cho GradesPage.jsx
  const formatted = grades.map(g => ({
    courseCode: g.class.course.code,
    courseName: g.class.course.name,
    credits: g.class.course.credits,
    midTerm: g.midTerm,
    finalExam: g.finalExam,
    total10Scale: g.total10,
    letterGrade: g.letterGrade
  }));
  res.json(formatted);
};