// Vercel serverless function: POST /api/student/submit-registration
import prisma from '../../src/prisma';
import { getUserFromRequest } from '../../src/utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  const config = await prisma.systemConfig.findUnique({ where: { key: 'REGISTRATION_PERIOD' } });
  const now = new Date();
  if (!config?.isActive || now < config?.startDate || now > config?.endDate) {
    return res.status(400).json({ message: 'Cổng đăng ký đang đóng!' });
  }
  const { courses } = req.body;
  const studentId = user.id;
  try {
    await prisma.$transaction(async (tx) => {
      for (const classId of courses) {
        const cls = await tx.class.findUnique({ where: { id: classId } });
        if (cls.enrolledCount >= cls.capacity) throw new Error(`Lớp ${cls.code} đã đầy`);
        await tx.enrollment.create({ data: { studentId, classId } });
        await tx.class.update({ where: { id: classId }, data: { enrolledCount: { increment: 1 } } });
      }
    });
    res.json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
