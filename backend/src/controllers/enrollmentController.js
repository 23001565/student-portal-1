// backend/src/controllers/enrollmentController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- HÀM PHỤ TRỢ: KIỂM TRA TRÙNG LỊCH ---
// scheduleA và scheduleB có dạng: [{ day: "T2", slots: [1,2,3], room: "101" }]
const checkScheduleConflict = (scheduleA, scheduleB) => {
  // Đảm bảo dữ liệu là mảng (phòng trường hợp lưu chuỗi JSON)
  const listA = Array.isArray(scheduleA) ? scheduleA : JSON.parse(scheduleA || "[]");
  const listB = Array.isArray(scheduleB) ? scheduleB : JSON.parse(scheduleB || "[]");

  for (const sessionA of listA) {
    for (const sessionB of listB) {
      // 1. Kiểm tra xem có cùng THỨ không (Ví dụ cùng là "T2")
      if (sessionA.day === sessionB.day) {
        // 2. Kiểm tra xem có trùng TIẾT không (Giao thoa giữa 2 mảng slots)
        // Ví dụ: A học tiết [1,2,3], B học tiết [3,4,5] -> Trùng tiết 3
        const conflictSlots = sessionA.slots.filter(slot => sessionB.slots.includes(slot));
        
        if (conflictSlots.length > 0) {
          return true; // CÓ TRÙNG LỊCH
        }
      }
    }
  }
  return false; // KHÔNG TRÙNG
};

// --- HÀM CHÍNH: ĐĂNG KÝ MÔN HỌC ---
exports.registerClass = async (req, res) => {
  try {
    const studentId = req.user.id; // Lấy ID từ token đăng nhập
    const { classId } = req.body;

    // 1. Lấy thông tin lớp muốn đăng ký
    const targetClass = await prisma.class.findUnique({
      where: { id: parseInt(classId) },
      include: { course: true }
    });

    if (!targetClass) return res.status(404).json({ message: "Lớp học không tồn tại" });

    // 2. Kiểm tra sĩ số
    if (targetClass.enrolledCount >= targetClass.capacity) {
      return res.status(400).json({ message: "Lớp đã đầy sĩ số!" });
    }

    // 3. Lấy danh sách các lớp ĐÃ đăng ký trong cùng kỳ/năm đó
    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId: studentId,
        class: {
          semester: targetClass.semester,
          year: targetClass.year
        }
      },
      include: { class: { include: { course: true } } }
    });

    // 4. KIỂM TRA TRÙNG LỊCH & TRÙNG MÔN
    for (const enrollment of existingEnrollments) {
      const existingClass = enrollment.class;

      // a. Kiểm tra trùng môn (Không được học 2 lớp của cùng 1 môn)
      if (existingClass.courseId === targetClass.courseId) {
        return res.status(400).json({ 
            message: `Bạn đã đăng ký lớp ${existingClass.code} của môn này rồi!` 
        });
      }

      // b. Kiểm tra trùng thời gian
      if (checkScheduleConflict(targetClass.schedule, existingClass.schedule)) {
        return res.status(400).json({
          message: `Trùng lịch học với lớp ${existingClass.code} (${existingClass.course.name})!`
        });
      }
    }

    // 5. Nếu không trùng gì cả -> Tiến hành đăng ký (Dùng transaction để an toàn)
    await prisma.$transaction([
      // Tạo bản ghi enrollment
      prisma.enrollment.create({
        data: {
          studentId: studentId,
          classId: parseInt(classId),
        }
      }),
      // Tăng sĩ số lớp lên 1
      prisma.class.update({
        where: { id: parseInt(classId) },
        data: { enrolledCount: { increment: 1 } }
      })
    ]);

    res.json({ message: "Đăng ký thành công!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
  }
};
exports.cancelRegistration = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { classId } = req.body;

    // 1. LẤY CẤU HÌNH ĐỢT ĐĂNG KÝ TỪ SYSTEM_CONFIG
    // (Dùng lại đúng cái key 'REGISTRATION_PERIOD' mà Admin đã set)
    const config = await prisma.systemConfig.findUnique({
        where: { key: 'REGISTRATION_PERIOD' }
    });

    // Kiểm tra xem Admin đã cấu hình chưa
    if (!config || !config.isActive) {
        return res.status(400).json({ message: "Hệ thống đang ĐÓNG cổng đăng ký/hủy tín chỉ." });
    }

    // 2. KIỂM TRA THỜI GIAN (So sánh giờ hiện tại với config)
    const now = new Date();
    
    if (now < new Date(config.startDate)) {
        return res.status(400).json({ 
            message: `Chưa đến giờ mở cổng. Thời gian bắt đầu: ${new Date(config.startDate).toLocaleString('vi-VN')}` 
        });
    }

    if (now > new Date(config.endDate)) {
        return res.status(400).json({ 
            message: `Đã hết hạn thao tác. Hạn chót là: ${new Date(config.endDate).toLocaleString('vi-VN')}` 
        });
    }

    // 3. LOGIC HỦY (Phần này giữ nguyên không đổi)
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            studentId: studentId,
            classId: parseInt(classId)
        }
    });

    if (!enrollment) {
        return res.status(404).json({ message: "Bạn chưa đăng ký lớp học này." });
    }

    await prisma.$transaction([
        prisma.enrollment.delete({
            where: { id: enrollment.id }
        }),
        prisma.class.update({
            where: { id: parseInt(classId) },
            data: { enrolledCount: { decrement: 1 } }
        })
    ]);

    res.json({ message: "Hủy học phần thành công!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
  }
};