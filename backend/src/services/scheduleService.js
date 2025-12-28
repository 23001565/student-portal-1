import prisma from '../data/prisma.js';

/**
 * Lấy thời khoá biểu sinh viên theo học kỳ
 */
export async function getStudentSchedule(studentId, semester, year) {
  return prisma.enrollment.findMany({
    where: {
      studentId,
      status: 'ENROLLED',
      class: {
        semester,
        year,
        canceledAt: null,
        archivedAt: null
      }
    },
    include: {
      class: {
        include: {
          course: true,
          schedules: true,      // lịch học
          examSchedules: true   // lịch thi
        }
      }
    }
  });
}

/**
 * Kiểm tra sinh viên có bị trùng lịch khi đăng ký lớp không
 */
export async function checkScheduleConflict(studentId, classId) {
  const targetClass = await prisma.class.findUnique({
    where: { id: classId },
    include: { schedules: true }
  });

  if (!targetClass) return false;

  const enrolledClasses = await prisma.enrollment.findMany({
    where: {
      studentId,
      status: 'ENROLLED'
    },
    include: {
      class: {
        include: { schedules: true }
      }
    }
  });

  for (const e of enrolledClasses) {
    for (const s1 of e.class.schedules) {
      for (const s2 of targetClass.schedules) {
        if (
          s1.dayOfWeek === s2.dayOfWeek &&
          s1.startTime < s2.endTime &&
          s2.startTime < s1.endTime
        ) {
          return true; // trùng lịch
        }
      }
    }
  }

  return false;
}
