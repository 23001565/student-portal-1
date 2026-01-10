// Vercel serverless function: GET /api/student/announcements
const prisma = require('../../src/prisma');
const { getUserFromRequest } = require('../../src/utils/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { audience: 'all' },
          { audience: 'students' }
        ]
      },
      orderBy: { postedAt: 'desc' },
      take: 10
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông báo: ' + error.message });
  }
};
