/**
import prisma from '../../data/prisma.js';
import redis from '../../data/redis.js';
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
/**
 * Gỡ một course khỏi session đăng ký tạm (chưa ghi DB)
 
export async function removeCourseFromSession(studentId, courseId) {
  const key = `student:${studentId}:session`;
  const raw = await redis.get(key);

  if (!raw) throw new Error('No active session');

  const session = JSON.parse(raw);

  session.courses = session.courses.filter(
    c => c.courseId !== courseId
  );

  session.lastUpdated = Date.now();
  await redis.set(key, JSON.stringify(session), 'EX', 3600);

  return session;
}
*/
/**
 * Huỷ toàn bộ session đăng ký tạm

export async function clearStudentSession(studentId) {
  const key = `student:${studentId}:session`;
  await redis.del(key);
}
   */
/**
 * Kiểm tra session có course nào không
 
export async function isSessionEmpty(studentId) {
  const key = `student:${studentId}:session`;
  const raw = await redis.get(key);

  if (!raw) return true;

  const session = JSON.parse(raw);
  return session.courses.length === 0;
}
  */
/**
 * Lấy danh sách courseId hiện có trong session
 
export async function getSessionCourseIds(studentId) {
  const session = await getStudentSession(studentId);
  return session.courses.map(c => c.courseId);
}
*/
