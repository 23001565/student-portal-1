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

//find student by id
export async function findStudentsByName(studentId) {
  return await prisma.student.findMany({
    where: {id: { contains: : studentId, mode: 'insensitive' } }
  });
}
