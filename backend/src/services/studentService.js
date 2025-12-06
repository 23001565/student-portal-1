import prisma from '../data/prisma.js';
import redis from '../data/redis.js';

export async function getStudentProfile(studentId) {
  return await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}



