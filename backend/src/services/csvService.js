
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const isValidRow = (row, courseMap) => {
  const day = parseInt(row.dayOfWeek);
  const start = parseInt(row.startPeriod);
  const end = parseInt(row.endPeriod);
  const semester = parseInt(row.semester);
  const courseId = courseMap[row.course_code];

  if (!courseId) return false;                  // course must exist
  if (isNaN(day) || day < 1 || day > 7) return false;
  if (isNaN(start) || isNaN(end) || start > end) return false;
  if (isNaN(semester) || semester < 1 || semester > 2) return false;
  if (!row.code || !row.year ) return false;

  return true;
};

const createClassesFromCSV = async (rows) => {
  const courses = await prisma.course.findMany();
  const courseMap = {};
  courses.forEach(c => {
    courseMap[c.code] = c.id;
  });
  const validRows = [];
  const invalidRows = [];
  rows.forEach(row => {
    if (isValidRow(row, courseMap)) validRows.push(row);
    else invalidRows.push(row);
  });

  if (validRows.length === 0) return { insertedCount: 0, invalidRows };
  
  const insertedCount = await prisma.$transaction(async (prisma) => {
    const result = await prisma.class.createMany({
      data: validRows.map(row => ({
        courseId: courseMap[row.course_code],
        code: row.code,
        year: parseInt(row.year),
        semester: parseInt(row.semester),
        location: row.location?.trim() || "",
        capacity: isNaN(parseInt(row.capacity)) ? 0 : parseInt(row.capacity),
        dayOfWeek: parseInt(row.dayOfWeek),
        startPeriod: parseInt(row.startPeriod),
        endPeriod: parseInt(row.endPeriod),
      })),
      skipDuplicates: true,
    });
    return result.count;
  });


  return { insertedCount, invalidRows }

};

module.exports = { createClassesFromCSV };
