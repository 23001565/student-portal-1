// backend/scripts/importCourse.js

const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const courses = [];

  // Stream CSV to memory
  fs.createReadStream('./csvfiles/course.csv')
    .pipe(csv())
    .on('data', (row) => {
      courses.push({
        code: row.code,
        name: row.name,
        credits: parseInt(row.credits, 10), // ensure integer
      });
    })
    .on('end', async () => {
      console.log(`Importing ${courses.length} courses...`);

      // Bulk insert
      await prisma.course.createMany({
        data: courses,
        skipDuplicates: true, // optional: avoids errors on duplicate codes
      });

      console.log('CSV import completed!');
      await prisma.$disconnect();
    });
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
