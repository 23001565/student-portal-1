const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// === Utility function to read a sheet ===
function readExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}


async function insertCourses() {
  const rows = readExcel('./courses.xlsx');;

  for (const row of rows) {
    const courseCode = row.course_code?.trim();
    const courseName = row.course_name?.trim() || courseCode;
    const credits = parseInt(row.credits);
    const majorStr = row.major?.trim();

    let isGlobal = false;
    let majorNames = [];

    if (!majorStr || majorStr === '') {
      isGlobal = true;
    } else {
      majorNames = majorStr.split('+').map(m => m.trim());
    }

    // Look up major IDs
    const majorConnections = [];

    if (!isGlobal) {
      for (const majorName of majorNames) {
        const major = await prisma.major.findUnique({
          where: { name: majorName }
        });

        if (major) {
          majorConnections.push({ id: major.id });
        } else {
          console.warn(`Major not found: "${majorName}" — skipping.`);
        }
      }
    }

    // Create the course with connected majors or isGlobal
    await prisma.course.create({
      data: {
        code: courseCode,
        name: courseName,
        credits: credits,
        isGlobal: isGlobal,
        majors: {
          connect: majorConnections
        }
      }
    });

    console.log(`Inserted course: ${courseCode} (${courseName})`);
  }

  await prisma.$disconnect();
}

function parsePeriod(periodStr) {
  if (periodStr.includes('-')) {
    const [start, end] = periodStr.split('-').map(p => parseInt(p.trim()));
    return { startPeriod: start, endPeriod: end };
  } else {
    const p = parseInt(periodStr.trim());
    return { startPeriod: p, endPeriod: p };
  }
}


async function insertClasses() {
  const rows = readExcel('./classes.xlsx');
  for (const row of rows) {
    try {
        const { startPeriod, endPeriod } = parsePeriod(row.period);
        await prisma.class.create({
            data: {
                code: row.class_id,
                courseId: row.course_id,
                capacity: Number(row.capacity),
                dayOfWeek: Number(row.day_of_week),
                startPeriod,
                endPeriod,
                location: row.location,
            }
        });
      console.log(`Inserted class: ${row.class_id}`);
    } catch (err) {
      console.error(`Failed to insert class: ${row.class_id}`, err.message);
    }
  }
}

async function insertStudents() {
  const rows = readExcel('./students.xlsx');
  for (const row of rows) {
    try {
      await prisma.student.create({
        data: {
          name: row.name,
          email: row.email,
          password: row.password,
          major: {
            connect: {
                name: row.major  // Connect by major name instead of ID
            }
        },
          year: Number(row.year)
        }
      });
      console.log(`Inserted student: ${row.name}`);
    } catch (err) {
      console.error(`Failed to insert student: ${row.name}`, err.message);
    }
  }
}

// === Main function to run them all ===
async function main() {
  await insertCourses();
  await insertClasses();
  await insertStudents();

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Unhandled error:', e);
  prisma.$disconnect();
});

