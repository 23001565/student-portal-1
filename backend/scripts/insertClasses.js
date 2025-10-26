const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importClasses() {
  const classes = [];

  fs.createReadStream('./csvfiles/classes.csv')
    .pipe(csv())
    .on('data', (row) => {
      classes.push(row);
    })
    .on('end', async () => {
      const courses = await prisma.course.findMany();
      const courseMap = Object.fromEntries(courses.map(c => [c.code, c.id]));
      for (const row of classes) {
        // 1. Find course by code
        const courseId = courseMap[row.courseCode];
        if (!courseId) {
            console.warn(`Missing course for ${row.course_code}`);
            continue;
        }

        // 2. Create class referencing the course id
        await prisma.class.create({
          data: {
            code: row.classCode,
            semester : parseInt(row.semester),
            year: parseInt(row.year, 10), // ensure integer
            capacity: parseInt(row.capacity, 10), // ensure integer
            dayOfWeek: parseInt(row.dayOfWeek, 10), // ensure integer
            startPeriod: parseInt(row.startPeriod, 10), // ensure integer
            endPeriod: parseInt(row.endPeriod, 10), // ensure integer
            location: row.location,
            courseId: courseId,
          },
        });
      }

      console.log('Classes imported successfully');
      await prisma.$disconnect();
    });
}

importClasses().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
