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


// find student by name
export async function findStudentsByName(name) {
  return await prisma.student.findMany({
    where: { name: { contains: name, mode: 'insensitive' } }
  });
}

//get student profile 
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

