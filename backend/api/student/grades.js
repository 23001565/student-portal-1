// Vercel serverless function: GET /api/student/grades
import prisma from '../../src/prisma';
import { getUserFromRequest } from '../../src/utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  const grades = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    include: { class: { include: { course: true } } }
  });
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
}
