


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//fetch enrollments for all students in a specific semester
const enrollments = await prisma.enrollment.findMany({
  where: {
    studentId: studentId,
    registrationWindow: {
      semester: 1,
      year: 2025
    }
  },
  include: {
    class: true
  }
});

//when student enrolls in a class
const cls = await prisma.class.findUnique({
  where: { id: classId }
});

await prisma.enrollment.create({
  data: {
    studentId: studentId,
    classId: classId,
    registrationWindowId: cls.registrationWindowId, // assuming this field exists
  }
});

