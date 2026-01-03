const jwt = require ('jsonwebtoken');
const prisma = require('../data/prisma.js');

const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-secure-secret';

async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        await prisma.session.updateMany({
          where: {
            token,
            terminatedAt: null,
          },
          data: {
            terminatedAt: err.expiredAt ?? new Date(),
          },
        });
      }
      res.clearCookie('access_token');
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.token = token;
    console.log('JWT payload:', payload);

    if (payload.role === 'admin') {
      req.user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
      };
      return next();
    }

    if (payload.role === 'student') {
      const session = await prisma.session.findUnique({
        where: { token },
      });

      if (!session || session.terminatedAt) {
        return res.status(401).json({ message: 'Session terminated' });
      }

      req.user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
      };
      req.session = session;
      return next();
    }

    return res.status(403).json({ message: 'Invalid role' });
  } catch (err) {
    //  THIS prevents ERR_EMPTY_RESPONSE
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Authentication failed' });
  }
}

module.exports =  authenticate ;
