// Vercel serverless function: GET /api/student/my-enrollments
const prisma = require('../../src/prisma');
const { getUserFromRequest } = require('../../src/utils/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: user.id },
      include: { class: { include: { course: true } } }
    });
    const formatted = enrollments.map(en => ({
      id: en.id,
      classId: en.class.id,
      courseName: en.class.course.name,
      classCode: en.class.code,
      courseCode: en.class.course.code,
      credits: en.class.course.credits,
      schedule: en.class.schedule,
      room: en.class.room,
      semester: en.class.semester,
      year: en.class.year,
      enrolledCount: en.class.enrolledCount,
      capacity: en.class.capacity,
      total10: en.total10,
      letterGrade: en.letterGrade
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy lịch học: ' + error.message });
  }
};
