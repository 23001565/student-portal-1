import prisma from '../data/prisma.js'; 

// get student information
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

// creat student
export async function createStudent(data) {
  return await prisma.student.create({ data });
}

// update student
export async function updateStudent(studentId,data) {
  return await prisma.student.update({
    where: {id: studentId},
    data,
  })
  
}

//delete student
export async function deleteStudent(studentId) {
  return await prisma.student.delete({ where: { id: studentId } });
}

// query list 
export async function getAllStudents() {
  return await prisma.student.findMany();
}

// all courses
export async function getStudentCourses(studentId) {
  return await prisma.student.findUnique({
    where: { id: studentId },
    select: { courses: true }
  });
}
// find student by name
export async function findStudentsByName(name) {
  return await prisma.student.findMany({
    where: { name: { contains: name, mode: 'insensitive' } }
  });
}

// find by name
export async function findStudentsByName(name) {
  return await prisma.student.findMany({
    where: { name: { contains: name, mode: 'insensitive' } }
  });
}
// get student detail 
export async function getStudentDetail(studentId) {
  return await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      courses: true,
      _count: {
        select: { courses: true },
      },
    },
  });
}

//add course 
export async function addCourseToStudent(studentId, courseId) {
  return await prisma.student.update({
    where: { id: studentId },
    data: {
      courses: {
        connect: { id: courseId },
      },
    },
  });
}

// remove course
export async function removeCourseFromStudent(studentId, courseId) {
  return await prisma.student.update({
    where: { id: studentId },
    data: {
      courses: {
        disconnect: { id: courseId },
      },
    },
  });
}
