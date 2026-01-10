// Vercel serverless function: GET /api/student/profile
import prisma from '../../src/prisma';
import { getUserFromRequest } from '../../src/utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  const student = await prisma.student.findUnique({
    where: { id: user.id },
    include: { major: true, curriculum: true }
  });
  res.json(student);
}
