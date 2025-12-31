const prisma = require('../data/prisma');
const { parseCSVBuffer } = require('./csvService');

function cleanStr(s) {
  return (s ?? '').toString().trim();
}

/**
 * Create a class (section) for a course
 * courseCode MUST exist
 */
async function createClass({
  code,
  semester,
  year,
  capacity,
  dayOfWeek,
  startPeriod,
  endPeriod,
  location,
  courseCode,
}) {
  code = cleanStr(code);
  location = cleanStr(location);
  courseCode = cleanStr(courseCode);

  const sem = Number(semester);
  const y = Number(year);
  const cap = Number(capacity);
  const dow = Number(dayOfWeek);
  const sp = Number(startPeriod);
  const ep = Number(endPeriod);

  if (!code) { const e = new Error('code is required'); e.status = 400; throw e; }
  if (!courseCode) { const e = new Error('courseCode is required'); e.status = 400; throw e; }
  if (!sem || !y) { const e = new Error('semester/year invalid'); e.status = 400; throw e; }
  if (!cap || cap < 0) { const e = new Error('capacity invalid'); e.status = 400; throw e; }
  if (!dow || !sp || !ep) { const e = new Error('schedule invalid'); e.status = 400; throw e; }

  const course = await prisma.course.findUnique({
    where: { code: courseCode },
    select: { id: true },
  });
  if (!course) { const e = new Error('Course not found'); e.status = 400; throw e; }

  const exists = await prisma.class.findUnique({
    where: { code_semester_year: { code, semester: sem, year: y } },
  });
  if (exists) { const e = new Error('Class already exists'); e.status = 400; throw e; }

  const created = await prisma.class.create({
    data: {
      code,
      semester: sem,
      year: y,
      capacity: cap,
      dayOfWeek: dow,
      startPeriod: sp,
      endPeriod: ep,
      location,
      courseId: course.id,
    },
    select: {
      id: true,
      code: true,
      semester: true,
      year: true,
      capacity: true,
      courseId: true,
      archivedAt: true,
      canceledAt: true,
      createdAt: true,
    },
  });

  return created;
}

/**
 * Update class by (code, semester, year)
 */
async function updateClass(code, semester, year, data = {}) {
  code = cleanStr(code);
  const sem = Number(semester);
  const y = Number(year);

  const cls = await prisma.class.findUnique({
    where: { code_semester_year: { code, semester: sem, year: y } },
  });
  if (!cls) { const e = new Error('Not found'); e.status = 404; throw e; }

  const updateData = {};

  if (data.capacity !== undefined) {
    const c = Number(data.capacity);
    if (!c || c < 0) { const e = new Error('capacity invalid'); e.status = 400; throw e; }
    updateData.capacity = c;
  }
  if (data.dayOfWeek !== undefined) updateData.dayOfWeek = Number(data.dayOfWeek);
  if (data.startPeriod !== undefined) updateData.startPeriod = Number(data.startPeriod);
  if (data.endPeriod !== undefined) updateData.endPeriod = Number(data.endPeriod);
  if (data.location !== undefined) updateData.location = cleanStr(data.location);

  // allow changing course via courseCode
  if (data.courseCode !== undefined) {
    const courseCode = cleanStr(data.courseCode);
    const course = await prisma.course.findUnique({ where: { code: courseCode } });
    if (!course) { const e = new Error('Course not found'); e.status = 400; throw e; }
    updateData.courseId = course.id;
  }

  const updated = await prisma.class.update({
    where: { id: cls.id },
    data: updateData,
  });

  return updated;
}

/**
 * Archive a class (soft remove)
 */
async function archiveClass(code, semester, year) {
  code = cleanStr(code);
  const sem = Number(semester);
  const y = Number(year);

  const cls = await prisma.class.findUnique({
    where: { code_semester_year: { code, semester: sem, year: y } },
  });
  if (!cls) { const e = new Error('Not found'); e.status = 404; throw e; }

  return prisma.class.update({
    where: { id: cls.id },
    data: { archivedAt: new Date() },
    select: { id: true, code: true, archivedAt: true },
  });
}

/**
 * Delete class
 * If has enrollments/exams → cancel instead
 */
async function deleteClass(code, semester, year) {
  code = cleanStr(code);
  const sem = Number(semester);
  const y = Number(year);

  const cls = await prisma.class.findUnique({
    where: { code_semester_year: { code, semester: sem, year: y } },
    include: {
      enrollments: { select: { id: true }, take: 1 },
      examSchedules: { select: { id: true }, take: 1 },
    },
  });
  if (!cls) { const e = new Error('Not found'); e.status = 404; throw e; }

  if (cls.enrollments.length || cls.examSchedules.length) {
    const now = new Date();
    await prisma.class.update({
      where: { id: cls.id },
      data: { canceledAt: now },
    });
    return { canceled: true };
  }

  await prisma.class.delete({ where: { id: cls.id } });
  return { deleted: true };
}

/**
 * Filter classes
 * - by courseCode
 * - by semester + year
 */
async function listClasses({
  courseCode,
  semester,
  year,
  includeArchived,
} = {}) {
  const where = {};

  if (!includeArchived) where.archivedAt = null;
  if (semester !== undefined) where.semester = Number(semester);
  if (year !== undefined) where.year = Number(year);

  if (courseCode) {
    const course = await prisma.course.findUnique({
      where: { code: cleanStr(courseCode) },
      select: { id: true },
    });
    if (!course) return { items: [] };
    where.courseId = course.id;
  }

  const items = await prisma.class.findMany({
    where,
    orderBy: [{ year: 'desc' }, { semester: 'desc' }, { code: 'asc' }],
    select: {
      id: true,
      code: true,
      semester: true,
      year: true,
      capacity: true,
      dayOfWeek: true,
      startPeriod: true,
      endPeriod: true,
      location: true,
      courseId: true,
      archivedAt: true,
      canceledAt: true,
      createdAt: true,
    },
  });

  return { items };
}

async function uploadClassesFromCSV(buffer, mapping = {}) {
  if (!buffer) {
    const e = new Error('file is required');
    e.status = 400;
    throw e;
  }

  const rows = await parseCSVBuffer(buffer);
  if (!rows.length) return { inserted: 0, updated: 0, errors: [] };

  const map = {
    code: mapping.code || 'code',
    semester: mapping.semester || 'semester',
    year: mapping.year || 'year',
    capacity: mapping.capacity || 'capacity',
    dayOfWeek: mapping.dayOfWeek || 'dayOfWeek',
    startPeriod: mapping.startPeriod || 'startPeriod',
    endPeriod: mapping.endPeriod || 'endPeriod',
    location: mapping.location || 'location',
    courseCode: mapping.courseCode || 'courseCode',
  };

  let inserted = 0;
  let updated = 0;
  const errors = [];

  /* ---------------------------------------------
     Prefetch courses
  --------------------------------------------- */
  const courseCodes = Array.from(
    new Set(rows.map(r => cleanStr(r[map.courseCode]))),
  ).filter(Boolean);

  const courses = await prisma.course.findMany({
    where: { code: { in: courseCodes } },
    select: { id: true, code: true },
  });
  const courseMap = new Map(courses.map(c => [c.code, c.id]));

  /* ---------------------------------------------
     Prefetch existing classes
  --------------------------------------------- */
  const keys = rows
    .map(r => ({
      code: cleanStr(r[map.code]),
      semester: Number(r[map.semester]),
      year: Number(r[map.year]),
    }))
    .filter(k => k.code && k.semester && k.year);

  const existing = await prisma.class.findMany({
    where: {
      OR: keys.map(k => ({
        code: k.code,
        semester: k.semester,
        year: k.year,
      })),
    },
    select: { id: true, code: true, semester: true, year: true },
  });

  const existingMap = new Map(
    existing.map(c => [`${c.code}|${c.semester}|${c.year}`, c.id]),
  );

  /* ---------------------------------------------
     Process rows
  --------------------------------------------- */
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    const code = cleanStr(r[map.code]);
    const semester = Number(r[map.semester]);
    const year = Number(r[map.year]);
    const capacity = Number(r[map.capacity]);
    const dayOfWeek = Number(r[map.dayOfWeek]);
    const startPeriod = Number(r[map.startPeriod]);
    const endPeriod = Number(r[map.endPeriod]);
    const location = cleanStr(r[map.location]);
    const courseCode = cleanStr(r[map.courseCode]);

    if (
      !code || !semester || !year ||
      !capacity || capacity < 0 ||
      !courseCode
    ) {
      errors.push({ row: i + 2, message: 'Invalid required fields' });
      continue;
    }

    const courseId = courseMap.get(courseCode);
    if (!courseId) {
      errors.push({ row: i + 2, message: `Course not found: ${courseCode}` });
      continue;
    }

    const key = `${code}|${semester}|${year}`;

    try {
      if (existingMap.has(key)) {
        await prisma.class.update({
          where: { id: existingMap.get(key) },
          data: {
            capacity,
            dayOfWeek,
            startPeriod,
            endPeriod,
            location,
            courseId,
          },
        });
        updated++;
      } else {
        await prisma.class.create({
          data: {
            code,
            semester,
            year,
            capacity,
            dayOfWeek,
            startPeriod,
            endPeriod,
            location,
            courseId,
          },
        });
        inserted++;
      }
    } catch (err) {
      errors.push({
        row: i + 2,
        message: err.message || 'DB error',
      });
    }
  }

  return { inserted, updated, errors };
}


module.exports = {
  createClass,
  updateClass,
  archiveClass,
  deleteClass,
  listClasses,
  uploadClassesFromCSV,
};
