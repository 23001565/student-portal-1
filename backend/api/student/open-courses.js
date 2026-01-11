// Vercel serverless function: GET /api/student/open-courses
const prisma = require('../../src/prisma');
const { getUserFromRequest } = require('../../src/utils/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'REGISTRATION_PERIOD' } });
    const now = new Date();
    if (!config || !config.isActive) return res.json([]);
    if (config.startDate && now < config.startDate) return res.status(403).json({ message: 'Chưa đến thời gian đăng ký tín chỉ.' });
    if (config.endDate && now > config.endDate) return res.status(403).json({ message: 'Đã hết hạn đăng ký tín chỉ.' });
    const classes = await prisma.class.findMany({
      where: { isRegistrationOpen: true },
      include: { course: true }
    });
    const formatted = classes.map(c => ({
      id: c.id,
      code: c.course.code,
      name: c.course.name,
      classCode: c.code,
      credits: c.course.credits,
      schedule: c.schedule,
      enrolled: c.enrolledCount,
      capacity: c.capacity,
      status: c.enrolledCount >= c.capacity ? 'FULL' : 'OPEN'
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi hệ thống: ' + err.message });
  }
};
