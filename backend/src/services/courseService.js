const prisma = require('../data/prisma');
const { parseCSVBuffer } = require('./csvService');

function cleanStr(s) { return (s ?? '').toString().trim(); }

async function createCourse({ code, name, credits, majorId }) {
  code = cleanStr(code);
  name = cleanStr(name);
  const c = Number(credits);
  if (!code) { const e = new Error('code is required'); e.status = 400; throw e; }
  if (!name) { const e = new Error('name is required'); e.status = 400; throw e; }
  if (!c || c < 0) { const e = new Error('credits invalid'); e.status = 400; throw e; }

  const exists = await prisma.course.findUnique({ where: { code } });
  if (exists) { const e = new Error('Course exists'); e.status = 400; throw e; }

  const created = await prisma.course.create({
    data: {
      code,
      name,
      credits: c,
      ...(majorId !== undefined ? { majorId } : {}),
    },
    select: { id: true, code: true, name: true, credits: true, majorId: true, archivedAt: true, createdAt: true },
  });
  return created;
}

async function updateCourseByCode(code, { name, credits, majorId }) {
  code = cleanStr(code);
  const course = await prisma.course.findUnique({ where: { code } });
  if (!course) { const e = new Error('Not found'); e.status = 404; throw e; }
  const data = {};
  if (name !== undefined) data.name = cleanStr(name);
  if (credits !== undefined) {
    const c = Number(credits);
    if (!c || c < 0) { const e = new Error('credits invalid'); e.status = 400; throw e; }
    data.credits = c;
  }
  if (majorId !== undefined) data.majorId = majorId;

  const updated = await prisma.course.update({ where: { id: course.id }, data, select: { id: true, code: true, name: true, credits: true, majorId: true, archivedAt: true, createdAt: true } });
  return updated;
}

async function archiveCourse(code) {
  code = cleanStr(code);
  const course = await prisma.course.findUnique({ where: { code } });
  if (!course) { const e = new Error('Not found'); e.status = 404; throw e; }
  const updated = await prisma.course.update({ where: { id: course.id }, data: { archivedAt: new Date() }, select: { id: true, code: true, archivedAt: true } });
  return updated;
}

async function deleteCourseByCode(code) {
  code = cleanStr(code);
  const course = await prisma.course.findUnique({ where: { code } });
  if (!course) { const e = new Error('Not found'); e.status = 404; throw e; }

  // Check if there are any classes for this course (active or historical)
  const hasClasses = await prisma.class.findFirst({ where: { courseId: course.id } });
  if (hasClasses) {
    // Archive course and cancel its classes
    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      const _c = await tx.course.update({ where: { id: course.id }, data: { archivedAt: now } });
      const cancelRes = await tx.class.updateMany({ where: { courseId: course.id, canceledAt: null }, data: { canceledAt: now } });
      return { archived: true, canceledClasses: cancelRes.count };
    });
    return result;
  }

  // If no classes, safe to hard-delete
  await prisma.groupCourse.deleteMany({ where: { courseId: course.id } }).catch(() => {});
  await prisma.course.delete({ where: { id: course.id } });
  return { deleted: true };
}

async function listCourses({ code, majorId, curriculumCode, includeArchived } = {}) {
  const where = {};
  if (code) where.code = { contains: code, mode: 'insensitive' };
  if (majorId !== undefined) where.majorId = Number(majorId);
  if (!includeArchived) where.archivedAt = null;

  // Filter by curriculumCode via join if provided
  if (curriculumCode) {
    // Find curriculum by code, then its groups, then groupCourse courseIds
    const curriculum = await prisma.curriculum.findUnique({ where: { code: curriculumCode }, select: { id: true } });
    if (!curriculum) return { items: [] };
    const groups = await prisma.curriculumGroup.findMany({ where: { curriculumId: curriculum.id }, select: { id: true } });
    const groupIds = groups.map(g => g.id);
    if (groupIds.length === 0) return { items: [] };
    const groupCourses = await prisma.groupCourse.findMany({ where: { groupId: { in: groupIds } }, select: { courseId: true } });
    const courseIds = Array.from(new Set(groupCourses.map(gc => gc.courseId)));
    if (courseIds.length === 0) return { items: [] };
    where.id = { in: courseIds };
  }

  const items = await prisma.course.findMany({
    where,
    select: { id: true, code: true, name: true, credits: true, majorId: true, archivedAt: true, createdAt: true },
    orderBy: [{ code: 'asc' }],
  });
  return { items };
}



async function uploadCoursesFromCSV(buffer, mapping = {}) {
  if (!buffer) { const e = new Error('file is required'); e.status = 400; throw e; }
  const rows = await parseCSVBuffer(buffer);
  if (!rows.length) return { inserted: 0, updated: 0, errors: [] };

  const map = {
    code: mapping.code || 'code',
    name: mapping.name || 'name',
    credits: mapping.credits || 'credits',
    majorId: mapping.majorId || 'majorId',
  };

  let inserted = 0, updated = 0;
  const errors = [];

  // To reduce DB roundtrips, prefetch existing by codes
  const codes = Array.from(new Set(rows.map(r => cleanStr(r[map.code])))).filter(Boolean);
  const existing = await prisma.course.findMany({ where: { code: { in: codes } }, select: { id: true, code: true } });
  const existingMap = new Map(existing.map(c => [c.code, c.id]));

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const code = cleanStr(r[map.code]);
    const name = cleanStr(r[map.name]);
    const creditsStr = r[map.credits];
    const majorIdStr = r[map.majorId];
    const credits = Number(creditsStr);
    const majorId = majorIdStr !== undefined && majorIdStr !== '' ? Number(majorIdStr) : undefined;

    if (!code || !name || !credits || credits < 0) {
      errors.push({ row: i + 2, message: `Invalid row (code/name/credits)` }); // +2 for header + 1-based index
      continue;
    }

    const existingId = existingMap.get(code);
    try {
      if (existingId) {
        await prisma.course.update({ where: { id: existingId }, data: { name, credits, ...(majorId !== undefined ? { majorId } : {}) } });
        updated += 1;
      } else {
        await prisma.course.create({ data: { code, name, credits, ...(majorId !== undefined ? { majorId } : {}) } });
        inserted += 1;
      }
    } catch (err) {
      errors.push({ row: i + 2, message: err.message || 'DB error' });
    }
  }

  return { inserted, updated, errors };
}

module.exports = {
  createCourse,
  updateCourseByCode,
  archiveCourse,
  deleteCourseByCode,
  listCourses,
  uploadCoursesFromCSV,
};
