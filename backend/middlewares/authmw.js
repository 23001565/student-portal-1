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
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401).json('Not authorized');
    }
  } else {
    next();
  }
});

module.exports = { protect };
