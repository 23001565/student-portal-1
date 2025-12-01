import prisma from '../data/prisma.js'; 

// get student information
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

// creat student
export async function createStudent(data) {
  return await prisma.student.create({ data });
}

// update
export async function updateStudent(studentId,data) {
  return await prisma.student.update({
    where: {id: studentId},
    data,
  })
  
}

//delete
export async function deleteStudent(studentId) {
  return await prisma.student.delete({ where: { id: studentId } });
}

// query list 
export async function getAllStudents() {
  return await prisma.student.findMany();
}
