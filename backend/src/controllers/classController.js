// Cancel a class
const { ClassStatus } = require('@prisma/client');

await prisma.class.update({
  where: { id: classId },
  data: {
    status: ClassStatus.CANCELED,
    canceledAt: new Date()
  }
});
// Fetch active classes for current semester
const classes = await prisma.class.findMany({
  where: {
    archivedAt: null,
    status: 'ACTIVE',
    semester: currentSemester,
    year: currentYear
  }
});

// Example request:
// POST /admin/archive
// {
//   "year": 2025,
//   "semester": 1
// }