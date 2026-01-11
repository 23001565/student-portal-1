// backend/src/prisma.js
// Prisma singleton for serverless (Vercel)
const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = global.prisma || new PrismaClient();
  global.prisma = prisma;
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma;
