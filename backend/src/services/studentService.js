import prisma from '../data/prisma.js';
// get student profile 
export async function getStudentProfile(studentId) {
  return prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      code: true,
      name: true,
      email: true,
      year: true,
      major: {
        select: { id: true, name: true }
      },
      curriculum: {
        select: { id: true, code: true }
      }
    }
  });
}

// create student
export async function createStudent(data) {
  return prisma.student.create({ data });
}

// update student (logic cũ)
export async function updateStudent(studentId, data) {
  return prisma.student.update({
    where: { id: studentId },
    data
  });
}

// alias cho controller (KHÔNG đổi logic)
export async function updateStudentProfile(studentId, data) {
  return updateStudent(studentId, data);
}

// delete student
export async function deleteStudent(studentId) {
  return prisma.student.delete({ where: { id: studentId } });
}

// query list
export async function getAllStudents() {
  return prisma.student.findMany();
}

// find student by name
export async function findStudentsByName(name) {
  return prisma.student.findMany({
    where: { name: { contains: name, mode: 'insensitive' } }
  });
}

/* ================= ENROLLMENT / SCHEDULE ================= */

// controller: GET /students/me/enrollments
export async function getStudentEnrollments(studentId) {
  return prisma.enrollment.findMany({
    where: { studentId },
    include: {
      class: {
        include: {
          course: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

// controller: GET /students/me/schedule
export async function getStudentSchedule(studentId, semester, year) {
  return prisma.enrollment.findMany({
    where: {
      studentId,
      class: {
        semester,
        year
      }
    },
    include: {
      class: {
        include: {
          course: true
        }
      }
    }
  });
}
