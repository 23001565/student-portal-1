const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../data/prisma');

/* =========================
   Configuration
========================= */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-secure-secret';
const JWT_EXPIRES_STUDENT = process.env.JWT_EXPIRY || '15m';
const JWT_EXPIRES_ADMIN = process.env.JWT_EXPIRES_ADMIN || '2h';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;
const STUDENT_LOGIN_COOLDOWN_MINUTES = Number(process.env.LOCKOUT_DURATION) || 20;

/* =========================
   Helpers
========================= */

/**
 * Find user by role and email.
 * Currently supports: student | admin
 */
async function findUserByEmail(email, role) {
  if (!role) return null;

  const model = role.toLowerCase();
  if (!['student', 'admin'].includes(model)) return null;
  if (!prisma[model]) return null;

  return prisma[model].findUnique({
    where: { email: email },
  });
}

async function getId(user, role){
  if (role === 'student') {
    return user.code;
  } else if (role === 'admin') {
    return user.id;
  }
  return null;
}

function sanitizeUser(user, role) {
  return {
    id: getId(user, role),
    email: user.email,
    role,
  };
}

function getJwtExpiry(role) {
  return role === 'admin' ? JWT_EXPIRES_ADMIN : JWT_EXPIRES_STUDENT;
}

/**
 * Determine effective logout time.
 * - Manual logout → terminatedAt
 * - Token expiry → JWT exp
 */
function getEffectiveLogoutTime(session) {
  if (!session) return null;

  if (session.terminatedAt) {
    return session.terminatedAt;
  }

  try {
    const payload = jwt.decode(session.token);
    if (payload?.exp) {
      return new Date(payload.exp * 1000); // JWT exp is in seconds, JavaScript Date uses milliseconds
    }
  } catch {
    // ignore decode errors
  }

  return null;
}

/**
 * Enforce student cooldown rule.
 */
async function enforceStudentCooldown(studentId) {
  const lastSession = await prisma.session.findFirst({
    where: { studentId },
    orderBy: { startedAt: 'desc' },
  });
  
  if (!lastSession) return;

  const logoutAt = getEffectiveLogoutTime(lastSession);

  //  If logoutAt is null OR logoutAt is in the future → session is active
  if (!logoutAt || logoutAt > new Date()) {
    throw new Error('You are already logged in.');
  }

  const allowedAt = new Date(
    logoutAt.getTime() + STUDENT_LOGIN_COOLDOWN_MINUTES * 60 * 1000
  );

  if (new Date() < allowedAt) {
    throw new Error(
      `Login allowed after ${allowedAt.toISOString()}`
    );
  }
}


/**
 * Persist a new session.
 */
async function recordSession({
  token,
  studentId,
  userAgent,
  ipAddress,
}) {
  return prisma.session.create({
    data: {
      token,
      startedAt: new Date(),
      studentId,
      userAgent,
      ipAddress,
    },
  });
}

/* =========================
   Public API
========================= */

/**
 * Login and issue JWT.
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @param {string} params.role - student | admin
 * @param {string} [params.userAgent]
 * @param {string} [params.ipAddress]
 */
async function login({
  email,
  password,
  role,
  userAgent,
  ipAddress,
} = {}) {
  /* ---- Input validation ---- */
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new Error('Invalid email');
  }

  if (!password) {
    throw new Error('Missing password');
  }

  if (!role) {
    throw new Error('Missing role');
  }

  /* ---- Fetch user ---- */
  //console.log('DATABASE_URL:', process.env.DATABASE_URL);
  //const admins = await prisma.admin.findMany();
  //console.log('ALL ADMINS:', admins);
  
  const user = await findUserByEmail(email, role);
  if (!user || !user.password) {
    throw new Error('Wrong email/role');
  }

  /* ---- Verify password ---- */
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error('Wrong password');
  }

  /* ---- Student cooldown enforcement ---- */
  if (role === 'student') {
    await enforceStudentCooldown(user.id);
  }

  /* ---- Issue JWT ---- */
  const token = jwt.sign(
    {
      sub: getId(user, role),
      email: user.email,
      role: role,
    },
    JWT_SECRET,
    { expiresIn: getJwtExpiry(role) }
  );

  /* ---- Record session (students only) ---- */
  if (role === 'student') {
    await recordSession({
      token,
      studentId: user.id,
      userAgent,
      ipAddress,
    });
  }

  return {
    token,
    user: sanitizeUser(user, role),
  };
}

/**
 * Verify JWT (used by middleware)
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  login,
  verifyToken,
};
