// // backend/src/middleware/initRedisSession.js
// import redis from "../data/redis.js";
// import prisma from "../data/prisma.js";

// export async function initRedisSession(req, res, next) {
//   try {
//     const studentId = req.user.id;
//     const key = `student:${studentId}:session`;

//     const exists = await redis.exists(key);

//     if (!exists) {
//       // Load current enrolled classes from DB
//       const enrollments = await prisma.enrollment.findMany({
//         where: {
//           studentId,
//           status: 'ENROLLED'
//         },
//         select: {
//           classId: true
//         }
//       });

//       const session = {
//         courses: enrollments.map(e => ({ classId: e.classId })),
//         lastUpdated: Date.now()
//       };

//       // Cache session to Redis (20 minutes)
//       await redis.set(
//         key,
//         JSON.stringify(session),
//         'EX',
//         60 * 20
//       );
//     } else {
//       // Refresh TTL if session already exists
//       await redis.expire(key, 60 * 20);
//     }

//     next();
//   } catch (err) {
//     console.error('Init redis session error:', err);
//     res.status(500).json({ error: 'Failed to init registration session' });
//   }
// }
