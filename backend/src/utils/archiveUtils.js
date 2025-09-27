const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CURRENT_YEAR = 2025;
const CURRENT_SEMESTER = 1;

async function archiveOldClasses() {
  const now = new Date();

  // Archive classes from previous semesters
  await prisma.class.updateMany({
    where: {
      OR: [
        {
          year: { lt: CURRENT_YEAR }
        },
        {
          year: CURRENT_YEAR,
          semester: { lt: CURRENT_SEMESTER }
        }
      ],
      archivedAt: null // only if not already archived
    },
    data: {
      archivedAt: now
    }
  });

  console.log(` Archived old classes before ${CURRENT_YEAR} S${CURRENT_SEMESTER}`);
}

async function archiveFinalizedEnrollments() {
  const now = new Date();

  // Archive enrollments with final grades
  await prisma.enrollment.updateMany({
    where: {
      grade: { not: null },
      archivedAt: null
    },
    data: {
      archivedAt: now
    }
  });

  console.log(` Archived enrollments with final grades`);
}

module.exports = {
  archiveOldClasses,
  archiveFinalizedEnrollments
};
