// Vercel serverless function: GET /api/student/profile
const prisma = require('../../src/prisma');
const { getUserFromRequest } = require('../../src/utils/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  const student = await prisma.student.findUnique({
    where: { id: user.id },
    include: { major: true, curriculum: true }
  });
  res.json(student);
};
