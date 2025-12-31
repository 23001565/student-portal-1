const prisma = require('../data/prisma');

/**
 * Logout the current session.
 * @param {Object} params
 * @param {string} params.token - JWT token used for this session
 * @param {string} params.role - student | admin
 */
async function logout({ token, role }) {
  if (!token) {
    throw new Error('Missing token');
  }
  if (!role) {
    throw new Error('Missing role');
  }

  if (role !== 'student' && role !== 'admin') {
    throw new Error('Invalid role');
  }

  if (role === 'admin') {
    return { message: 'Logged out successfully' };
  }

  // Find the session by token
  const session = await prisma.session.findUnique({
    where: { token },
  });

  // If session does not exist, treat as already logged out
  if (!session) {
    return { message: 'Already logged out' };
  }

  // If already terminated, do nothing (idempotent)
  if (session.terminatedAt) {
    return { message: 'Already logged out' };
  }

  // Terminate session
  await prisma.session.update({
    where: { token },
    data: {
      terminatedAt: new Date(),
    },
  });

  return { message: 'Logged out successfully' };
}

module.exports = {
  logout,
};
