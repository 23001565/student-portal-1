const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../data/prisma');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-secure-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRY || '15m';
const JWT_EXPIRES_ADMIN = process.env.JWT_EXPIRES_ADMIN || '2h';

/**
 * Try common model names to find a user by email.
 * Adaptable to schemas that use User / Student / Admin table names.
 */
async function findUserByEmail(email, role) {
    const models = ['student', 'admin'];
    const lowerRole = role ? role.toLowerCase() : null;
    if (lowerRole === null || !models.includes(lowerRole)) {
        return null;
    }
    
    if (!prisma[m]) return null;
    try {
            // For authentication we need the password hash; fetch full record
            const byUnique = await prisma[m].findUnique({ where: { email } });
            if (byUnique) return byUnique;
            
    } catch (e) {
            // ignore model-specific errors and continue
    }
    

    // fallback: some schemas might store users in other tables; return null if not found
    return null;
}

function sanitizeUser(user) {
    if (!user) return null;
    return {
        id: user.id || null,
        name: user.name || user.username || null,
        email: user.email || null,
    };
}

function extractId(user) {
    return user.id || null;
}

async function hashPassword(plain) {
    return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Login and issue JWT.
 * role: expected 'student' or 'admin' (optional but if provided will be validated against user record if available)
 * Returns: { token, user }
 */
async function login({ email, password, role } = {}) {
    if (!email || !EMAIL_REGEX.test(email)) {
        throw new Error('Invalid email');
    }
    // password is always required for login and must be a reasonable length
    if (!password) {
        throw new Error('Missing password');
    }
    if (!role) {
        throw new Error('Missing role');
    }

    // Fetch user including password hash for authentication
    const user = await findUserByEmail(email, role);
    if (!user) throw new Error('Invalid credentials');

    const hashed = user.password || null;
    if (!hashed) throw new Error('User has no password set');

    const match = await bcrypt.compare(password, hashed);
    if (!match) throw new Error('Invalid credentials');

    const subject = user.id || null;
    const tokenPayload = {
        sub: subject,
        email: user.email,
        role: role,
    };
    const expiresIn = role === 'admin' ? JWT_EXPIRES_ADMIN : JWT_EXPIRES_IN;
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn });
    const safeUser = { ...sanitizeUser(user), role };
    return { token, user: safeUser };
}

function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    login,
    verifyToken,
};