import prisma from '../data/prisma.js';
import redis from '../data/redis.js';
import { checkConflicts } from './redisValidationService.js';

export async function getStudentSession(studentId) {
  const key = `student:${studentId}:session`;
  let session = await redis.get(key);

  if (!session) {
    // No session cached → load from DB
    const schedule = await prisma.enrollment.findMany({
      where: { studentId },
      include: { course: true },
    });
    session = { courses: schedule, lastUpdated: Date.now() };
    await redis.set(key, JSON.stringify(session), 'EX', 3600); // cache 1 hour
  } else {
    session = JSON.parse(session);
  }

  return session;
}

export async function enrollStudent(studentId, courseId) {
  const key = `student:${studentId}:session`;
  let session = await getStudentSession(studentId);

  if (checkConflicts(session.courses, courseId)) {
    throw new Error('Course time conflict!');
  }

  // Add course to session
  session.courses.push({ courseId });
  await redis.set(key, JSON.stringify(session), 'EX', 3600);

  return session;
}

export async function saveSchedule(studentId) {
  const key = `student:${studentId}:session`;
  const session = JSON.parse(await redis.get(key));

  if (!session) throw new Error('No active session.');

  // Sync final selection to DB
  await prisma.$transaction(async (tx) => {
    await tx.enrollment.deleteMany({ where: { studentId } });
    await tx.enrollment.createMany({
      data: session.courses.map((c) => ({
        studentId,
        courseId: c.courseId,
      })),
    });
  });

  // Remove session after saving
  await redis.del(key);
}

/// update 21/12

export async function getStudentSchedule(studentId, semester, year) {
  return prisma.enrollment.findMany({
    where: {
      studentId,
      semester,
      year,
      status: 'ENROLLED'
    },
    include: {
      class: {
        include: {
          course: true,
          examSchedules: true
        }
      }
    }
  });
}
