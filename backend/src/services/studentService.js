import prisma from '../data/prisma.js';

export async function getStudentProfile(studentId) {
  return await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      email: true,
      courses: true, // if student has enrolled courses
    },
  });
}
