const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');

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
    const { password, year, majorId, curriculumId, ...rest } = req.body;
    
    // 1. Xử lý mật khẩu: Nếu không nhập thì dùng '123', sau đó MÃ HÓA LUÔN
    const plainPassword = password || '123';
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(plainPassword, salt);

    const newStudent = await prisma.student.create({
      data: { 
        ...rest, 
        password: hashedPassword, // Lưu mật khẩu đã mã hóa
        year: parseInt(year),
        majorId: parseInt(majorId),
        curriculumId: parseInt(curriculumId)
      }
    });
    res.json(newStudent);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// [CẬP NHẬT] Sửa sinh viên (Có mã hóa pass mới)
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, major, curriculum, enrollments, id: _id, ...restData } = req.body;
    
    const updateData = { ...restData };

    // 2. Nếu có nhập password mới thì mã hóa
    if (password && password.trim() !== "") {
      const salt = bcrypt.genSaltSync(10);
      updateData.password = bcrypt.hashSync(password.trim(), salt);
    }

    const updated = await prisma.student.update({
      where: { id: parseInt(id) },
      data: updateData
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
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const classId = parseInt(id);

    // Sử dụng Transaction để đảm bảo xóa sạch hoặc không xóa gì cả
    await prisma.$transaction([
      // 1. Xóa tất cả sinh viên ra khỏi lớp này (Xóa enrollment)
      // Điều này đồng nghĩa xóa luôn điểm số của sinh viên trong môn này
      prisma.enrollment.deleteMany({
        where: { classId: classId }
      }),

      // 2. Sau khi sạch enrollment thì mới xóa Lớp
      prisma.class.delete({
        where: { id: classId }
      })
    ]);

    res.json({ message: "Đã xóa lớp và hủy toàn bộ đăng ký liên quan!" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Lỗi hệ thống: " + err.message });
  }
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

// [MỚI] Cài đặt thời gian đăng ký
exports.setRegistrationPeriod = async (req, res) => {
  try {
    const { startDate, endDate, isActive } = req.body;
    
    // Dùng upsert: Nếu có rồi thì update, chưa có thì tạo mới
    const config = await prisma.systemConfig.upsert({
      where: { key: 'REGISTRATION_PERIOD' },
      update: { 
        startDate: new Date(startDate), 
        endDate: new Date(endDate),
        isActive: isActive 
      },
      create: { 
        key: 'REGISTRATION_PERIOD',
        startDate: new Date(startDate), 
        endDate: new Date(endDate),
        isActive: isActive 
      }
    });
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [MỚI] Bật/Tắt đăng ký cho một lớp cụ thể
exports.toggleClassStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOpen } = req.body; // true hoặc false

    const updatedClass = await prisma.class.update({
      where: { id: parseInt(id) },
      data: { isRegistrationOpen: isOpen }
    });
    res.json(updatedClass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getRegistrationConfig = async (req, res) => {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'REGISTRATION_PERIOD' }
    });
    // Nếu chưa có config thì trả về default
    res.json(config || { startDate: null, endDate: null, isActive: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getAllAnnouncements = async (req, res) => {
  try {
    const data = await prisma.announcement.findMany({
      orderBy: { postedAt: 'desc' }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [CẬP NHẬT] Tạo thông báo mới
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, audience } = req.body;
    const newAnn = await prisma.announcement.create({
      data: {
        title,
        content,
        priority: priority || 'normal',
        audience: audience || 'all',
        postedAt: new Date(), // Reset thời gian đăng
      }
    });
    res.json(newAnn);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// [MỚI] Cập nhật thông báo
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, priority, audience } = req.body;
    
    const updated = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: { 
        title, 
        content, 
        priority, 
        audience,
        // --- THÊM DÒNG NÀY ---
        postedAt: new Date() // Cập nhật thời gian thành 'ngay bây giờ' -> Tự động lên đầu
        // ---------------------
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Lỗi cập nhật: " + err.message });
  }
};

// [MỚI] Xóa thông báo
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(400).json({ message: "Lỗi xóa: " + err.message });
  }
};
exports.getAllMajors = async (req, res) => {
  try {
    const majors = await prisma.major.findMany();
    res.json(majors);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// [MỚI] Lấy danh sách CTĐT
exports.getAllCurriculums = async (req, res) => {
  try {
    const curriculums = await prisma.curriculum.findMany();
    res.json(curriculums);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
exports.getClassEnrollments = async (req, res) => {
  try {
    const { classId } = req.params;
    const enrollments = await prisma.enrollment.findMany({
      where: { classId: parseInt(classId) },
      include: { 
        student: true // Lấy thông tin tên, mã sinh viên
      },
      orderBy: { student: { code: 'asc' } } // Sắp xếp theo mã SV
    });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [MỚI] Cập nhật điểm số cho 1 sinh viên
exports.updateGrade = async (req, res) => {
  try {
    const { enrollmentId, midTerm, finalExam } = req.body;

    // 1. Chuyển đổi sang số thực (float)
    const mid = parseFloat(midTerm);
    const final = parseFloat(finalExam);

    // 2. Tính toán điểm Tổng kết (Hệ 10)
    // Giả sử công thức: Quá trình 40% - Cuối kỳ 60%
    // Bạn có thể sửa tỷ lệ này tùy quy chế trường
    let total10 = null;
    let total4 = null;
    let letterGrade = null;

    if (!isNaN(mid) && !isNaN(final)) {
        total10 = (mid * 0.4) + (final * 0.6);
        total10 = parseFloat(total10.toFixed(1)); // Làm tròn 1 chữ số thập phân

        // 3. Quy đổi sang Điểm Chữ & Hệ 4 (Quy chế tín chỉ)
        if (total10 >= 8.5) { letterGrade = 'A'; total4 = 4.0; }
        else if (total10 >= 8.0) { letterGrade = 'B+'; total4 = 3.5; }
        else if (total10 >= 7.0) { letterGrade = 'B'; total4 = 3.0; }
        else if (total10 >= 6.5) { letterGrade = 'C+'; total4 = 2.5; }
        else if (total10 >= 5.5) { letterGrade = 'C'; total4 = 2.0; }
        else if (total10 >= 5.0) { letterGrade = 'D+'; total4 = 1.5; }
        else if (total10 >= 4.0) { letterGrade = 'D'; total4 = 1.0; }
        else { letterGrade = 'F'; total4 = 0.0; }
    }

    // 4. Lưu vào Database
    const updated = await prisma.enrollment.update({
      where: { id: parseInt(enrollmentId) },
      data: {
        midTerm: isNaN(mid) ? null : mid,
        finalExam: isNaN(final) ? null : final,
        total10,
        total4,
        letterGrade
      }
    });

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật điểm: " + err.message });
  }
};