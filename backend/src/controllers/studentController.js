const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

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
  try {
    // 1. KIỂM TRA THỜI GIAN ĐĂNG KÝ
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'REGISTRATION_PERIOD' }
    });

    const now = new Date();
    
    // Nếu chưa cấu hình, hoặc không active, hoặc ngoài khung giờ
    if (!config || !config.isActive) {
      return res.json([]); // Trả về rỗng (Đóng đăng ký)
    }
    
    if (config.startDate && now < config.startDate) {
       return res.status(403).json({ message: "Chưa đến thời gian đăng ký tín chỉ." });
    }
    
    if (config.endDate && now > config.endDate) {
       return res.status(403).json({ message: "Đã hết hạn đăng ký tín chỉ." });
    }

    // 2. LẤY DANH SÁCH LỚP (Chỉ lấy lớp được mở)
    const classes = await prisma.class.findMany({
      where: {
        isRegistrationOpen: true, // Chỉ lấy lớp Admin cho phép
        // Có thể thêm logic: active: true (nếu có soft delete)
      },
      include: { course: true }
    });

    // 3. Map dữ liệu (Giữ nguyên logic cũ của bạn)
    const formatted = classes.map(c => ({
      id: c.id,
      code: c.course.code,
      name: c.course.name,
      classCode: c.code,
      credits: c.course.credits,
      schedule: c.schedule,
      enrolled: c.enrolledCount,
      capacity: c.capacity,
      // Status hiển thị trên FE
      status: c.enrolledCount >= c.capacity ? 'FULL' : 'OPEN'
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
  }
};

// Xử lý gửi đăng ký (registrationApi.submitRegistration)
exports.submitRegistration = async (req, res) => {
  // --- THÊM CHECK THỜI GIAN ---
  const config = await prisma.systemConfig.findUnique({ where: { key: 'REGISTRATION_PERIOD' } });
  const now = new Date();
  if (!config?.isActive || now < config?.startDate || now > config?.endDate) {
    return res.status(400).json({ message: "Cổng đăng ký đang đóng!" });
  }
  // -----------------------------

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
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { audience: 'all' },      // Lấy tin cho tất cả
          { audience: 'students' }  // Lấy tin riêng cho sinh viên
        ]
      },
      orderBy: { postedAt: 'desc' }, // Tin mới nhất lên đầu
      take: 10 // Chỉ lấy 10 tin mới nhất để nhẹ API
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy thông báo: " + error.message });
  }
};

// [QUAN TRỌNG] Bạn cũng đang THIẾU hàm getMyEnrollments cho Dashboard
// Dashboard.jsx có gọi studentApi.getMyEnrollments() để lấy lịch học
// Nhưng controller của bạn chưa có. Hãy thêm hàm này luôn:
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.user.id },
      include: { 
        class: { 
          include: { course: true } 
        } 
      }
    });

    // Map dữ liệu trả về đúng format Dashboard cần (schedule, courseName, credits)
    const formatted = enrollments.map(en => ({
      id: en.class.id,
      courseName: en.class.course.name,
      classCode: en.class.code,
      courseCode: en.class.course.code, // Mã môn (INTxxxx)
      credits: en.class.course.credits,
      schedule: en.class.schedule,
      room: en.class.room,
      // Thêm các trường này để khớp với giao diện của bạn:
      semester: en.class.semester,
      year: en.class.year,
      enrolledCount: en.class.enrolledCount,
      capacity: en.class.capacity
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy lịch học: " + error.message });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    // 2. Lấy thêm password từ request
    const { phone, dob, gender, password } = req.body;

    const updateData = {};
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;
    
    if (dob) {
        const dateObject = new Date(dob);
        if (!isNaN(dateObject.getTime())) {
             updateData.dob = dateObject;
        }
    }

    // 3. LOGIC ĐỔI MẬT KHẨU (Nếu có nhập thì mới đổi)
    if (password && password.trim() !== "") {
        const salt = bcrypt.genSaltSync(10);
        updateData.password = bcrypt.hashSync(password, salt);
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
    });

    res.json({ message: "Cập nhật hồ sơ thành công", student: updatedStudent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi cập nhật: " + err.message });
  }
};