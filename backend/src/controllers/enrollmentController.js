const { EnrollmentStatus } = require('@prisma/client');

// Mark as completed
await prisma.enrollment.update({
  where: { id: enrollmentId },
  data: {
    status: EnrollmentStatus.COMPLETED,
    grade: '4.0'
  }
});

// Drop a course
await prisma.enrollment.update({
  where: { id: enrollmentId },
  data: {
    status: EnrollmentStatus.DROPPED
  }
});
// Withdraw from a course
await prisma.enrollment.update({
  where: { id: enrollmentId },
    data: {
    status: EnrollmentStatus.WITHDRAWN
  }
});

//when admin assigns a grade to an enrollment
await prisma.enrollment.update({
  where: { id: enrollmentId },
  data: {
    grade: 4.0
  }
});

// Fetch active enrollments for a student
const activeEnrollments = await prisma.enrollment.findMany({
  where: {
    studentId: student.id,
    archivedAt: null,
    status: 'ENROLLED'
  },
  include: { class: true }
});

// Show all enrollments (past and present) for transcript:
const allEnrollments = await prisma.enrollment.findMany({
  where: {
    studentId: student.id
  },
  orderBy: {
    createdAt: 'desc'
  },
  include: {
    class: true
  }
});

// When a student cancels:
// Set status = 'CANCELED', canceledAt = new Date()

// When a student completes:
// Set status = 'COMPLETED', archivedAt = new Date()

// When a student drops:
// Set status = 'DROPPED', canceledAt = new Date(), archivedAt = new Date()




