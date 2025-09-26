const now = new Date();

const registrationWindow = await prisma.courseRegistrationWindow.findFirst({
  where: {
    startTime: { lte: now },
    endTime: { gte: now },
    isActive: true
  }
});

if (!registrationWindow) {
  throw new Error(' Course registration is not currently open.');
}

await prisma.enrollment.create({
  data: {
    studentId: studentId,
    classId: classId,
    semester: registrationWindow.semester, //  set it here
  }
});


const studentGradesBySemester = await prisma.enrollment.findMany({
  where: {
    studentId: someId,
    grade: { not: null } // only completed classes
  },
  include: {
    class: {
      select: {
        semester: true,
        course: {
          select: {
            name: true,
            code: true
          }
        }
      }
    }
  },
  orderBy: {
    class: { semester: 'asc' }
  }
});
