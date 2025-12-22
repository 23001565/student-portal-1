// // backend/src/middleware/initRedisSession.js
// import redis from "../data/redis.js";
// import db from "../data/prisma.js";

// export async function initRedisSession(req, res, next) {
//   const studentId = req.user.id;
//   const key = `session:${studentId}`;

//   const exists = await redis.exists(key);

//   if (!exists) {
//     // Load last saved schedule from PostgreSQL
//     const schedule = await db.enrollment.findMany({
//       where: { studentId, status: 'ENROLLED' },
//       select: { courseId: true },
//     });
//     const savedSchedule = schedule.map((r) => r.courseId);

//     // Initialize Redis session with existing data
//     await redis.hset(key, {
//       schedule: JSON.stringify(savedSchedule),
//       createdAt: Date.now(),
//     });

//     // Set 20-min TTL
//     await redis.expire(key, 60 * 20);
//   } else {
//     // Refresh TTL on any registration activity
//     await redis.expire(key, 60 * 20);
//   }

//   next();
// }




// backend/src/middleware/initRedisSession.js
import redis from "../data/redis.js";
import prisma from "../data/prisma.js";

export async function initRedisSession(req, res, next) {
  try {
    const studentId = req.user.id;
    const key = `student:${studentId}:session`;

    const exists = await redis.exists(key);

    if (!exists) {
      // Load current enrolled classes from DB
      const enrollments = await prisma.enrollment.findMany({
        where: {
          studentId,
          status: 'ENROLLED'
        },
        select: {
          classId: true
        }
      });

      const session = {
        courses: enrollments.map(e => ({ classId: e.classId })),
        lastUpdated: Date.now()
      };

      // Cache session to Redis (20 minutes)
      await redis.set(
        key,
        JSON.stringify(session),
        'EX',
        60 * 20
      );
    } else {
      // Refresh TTL if session already exists
      await redis.expire(key, 60 * 20);
    }

    next();
  } catch (err) {
    console.error('Init redis session error:', err);
    res.status(500).json({ error: 'Failed to init registration session' });
  }
}
