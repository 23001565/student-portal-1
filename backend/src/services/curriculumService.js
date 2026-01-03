const prisma = require('../data/prisma');

function collectCourseCodes(groups, acc = new Set()) {
  for (const g of groups || []) {
    for (const c of g.courses || []) acc.add((c || '').trim());
    collectCourseCodes(g.subgroups || [], acc);
  }
  return acc;
}

function normalizeGroup(input) {
  return {
    name: input.name ?? null,
    type: input.type ?? null,
    required: !!input.required,
    totalCredits: Number(input.totalCredits) || 0,
    courses: Array.isArray(input.courses) ? input.courses.map(s => (s || '').trim()).filter(Boolean) : [],
    subgroups: Array.isArray(input.subgroups) ? input.subgroups.map(normalizeGroup) : [],
  };
}

async function ensureCourseCodesExist(courseCodes) {
  if (courseCodes.size === 0) return { map: new Map(), missing: [] };
  const codes = Array.from(courseCodes);
  const courses = await prisma.course.findMany({ where: { code: { in: codes } }, select: { id: true, code: true } });
  const found = new Map(courses.map(c => [c.code, c.id]));
  const missing = codes.filter(c => !found.has(c));
  return { map: found, missing };
}

async function deleteCurriculumTree(curriculumId) {
  // delete courses in groups, then groups
  const groupIds = (await prisma.curriculumGroup.findMany({ where: { curriculumId }, select: { id: true } })).map(g => g.id);
  if (groupIds.length) {
    await prisma.groupCourse.deleteMany({ where: { groupId: { in: groupIds } } });
    await prisma.curriculumGroup.deleteMany({ where: { id: { in: groupIds } } });
  }
}

async function createGroupRecursive(tx, curriculumId, group, parentGroupId, codeToId) {
  const created = await tx.curriculumGroup.create({
    data: {
      name: group.name,
      type: group.type,
      required: group.required,
      totalCredits: group.totalCredits,
      parentGroupId: parentGroupId ?? null,
      curriculumId,
    },
  });

  // link courses
  if (group.courses?.length) {
    const unique = Array.from(new Set(group.courses));
    const links = unique
      .filter(cc => codeToId.has(cc))
      .map(cc => ({ groupId: created.id, courseId: codeToId.get(cc) }));
    if (links.length) {
      await tx.groupCourse.createMany({ data: links, skipDuplicates: true });
    }
  }

  // recurse into subgroups
  for (const sg of group.subgroups || []) {
    await createGroupRecursive(tx, curriculumId, sg, created.id, codeToId);
  }

  return created.id;
}

async function createCurriculum(payload) {
  const { code, majorName, startYear, endYear, groups } = payload || {};
  if (!code || !String(code).trim()) {
    const err = new Error('code is required'); err.status = 400; throw err;
  }
  if (!startYear || Number.isNaN(Number(startYear))) {
    const err = new Error('startYear is required'); err.status = 400; throw err;
  }
  const major = await prisma.major.findUnique({ where: { name: majorName } });
  if (!major) {
    const err = new Error('Major not found'); err.status = 400; throw err;
  }
  const majorId = major.id;
  const normGroups = (groups || []).map(normalizeGroup);
  if (!normGroups.length) { const err = new Error('groups is required'); err.status = 400; throw err; }

  // unique code check
  const exists = await prisma.curriculum.findUnique({ where: { code: String(code).trim() } });
  if (exists) { const err = new Error('Curriculum exists'); err.status = 400; throw err; }

  // collect and validate courses
  const codesSet = collectCourseCodes(normGroups);
  const { map: codeToId, missing } = await ensureCourseCodesExist(codesSet);
  if (missing.length) { const err = new Error('Missing course codes'); err.status = 400; err.details = { missing }; throw err; }

  return await prisma.$transaction(async (tx) => {
    const curriculum = await tx.curriculum.create({
      data: {
        code: String(code).trim(),
        majorId: majorId ,
        startYear: Number(startYear),
        endYear: endYear != null && endYear !== '' ? Number(endYear) : null,
      },
    });

    for (const g of normGroups) {
      await createGroupRecursive(tx, curriculum.id, g, null, codeToId);
    }

    return { curriculumCode: curriculum.code };
  });
}

// Delete-all-Rebuild-all type of update (not optimal)
async function updateCurriculumByCode(code, payload) {
  const curriculum = await prisma.curriculum.findUnique({ where: { code } });
  if (!curriculum) { const err = new Error('Not found'); err.status = 404; throw err; }

  const { startYear, endYear, majorName, groups } = payload || {};

  const major = await prisma.major.findUnique({ where: { name: majorName } });
  if (!major) {
    const err = new Error('Major not found'); err.status = 400; throw err;
  }
  const majorId = major.id;

  const normGroups = (groups || []).map(normalizeGroup);
  if (!normGroups.length) { const err = new Error('groups is required'); err.status = 400; throw err; }

  const codesSet = collectCourseCodes(normGroups);
  const { map: codeToId, missing } = await ensureCourseCodesExist(codesSet);
  if (missing.length) { const err = new Error('Missing course codes'); err.status = 400; err.details = { missing }; throw err; }

  return await prisma.$transaction(async (tx) => {
    await tx.curriculum.update({
      where: { id: curriculum.id },
      data: {
        ...(startYear != null ? { startYear: Number(startYear) } : {}),
        ...(endYear !== undefined ? { endYear: endYear != null && endYear !== '' ? Number(endYear) : null } : {}),
        ...(majorId !== undefined ? { majorId: majorId ?? null } : {}),
      },
    });

    await deleteCurriculumTree(curriculum.id);

    for (const g of normGroups) {
      await createGroupRecursive(tx, curriculum.id, g, null, codeToId);
    }

    return { curriculumCode: curriculum.code };
  });
}

async function archiveCurriculum(code) {
  const curriculum = await prisma.curriculum.findUnique({ where: { code } });
  if (!curriculum) { const err = new Error('Not found'); err.status = 404; throw err; }
  await prisma.curriculum.update({ where: { id: curriculum.id }, data: { archivedAt: new Date() } });
  return { curriculumId: curriculum.id };
}

async function deleteCurriculumByCode(code) {
  const curriculum = await prisma.curriculum.findUnique({ where: { code } });
  if (!curriculum) { const err = new Error('Not found'); err.status = 404; throw err; }
  const students = await prisma.student.findMany({ where: { curriculumId: curriculum.id }, select: { id: true } });
  if (students.length) {
    const err = new Error('Cannot delete curriculum assigned to students'); err.status = 400; throw err;
  }
  await prisma.$transaction(async (tx) => {
    await deleteCurriculumTree(curriculum.id);
    await tx.curriculum.delete({ where: { id: curriculum.id } });
  });
  return { deleted: true };
}

async function cloneCurriculum({ fromCode, toCode, startYear, endYear, majorName }) {
  

  if (!fromCode || !toCode) { const err = new Error('fromCode and toCode are required'); err.status = 400; throw err; }
  const src = await prisma.curriculum.findUnique({ where: { code: fromCode } });
  if (!src) { const err = new Error('Source not found'); err.status = 404; throw err; }

  const majorId = src.majorId;
  if (String(majorName).trim()) {
    const major =  await prisma.major.findUnique({ where: { name: majorName } });
    if (major) {
      majorId = major.id;
    }
  }
  
  const exists = await prisma.curriculum.findUnique({ where: { code: toCode } });
  if (exists) { const err = new Error('Curriculum exists'); err.status = 400; throw err; }

  // Load full tree of groups and courses
  const groups = await prisma.curriculumGroup.findMany({
    where: { curriculumId: src.id },
    select: { id: true, name: true, type: true, required: true, totalCredits: true, parentGroupId: true },
  });
  const children = new Map();
  for (const g of groups) {
    const pid = g.parentGroupId || 0;
    if (!children.has(pid)) children.set(pid, []);
    children.get(pid).push(g);
  }
  const groupCourses = await prisma.groupCourse.findMany({ where: { groupId: { in: groups.map(g => g.id) } }, select: { groupId: true, courseId: true } });
  const courseIds = Array.from(new Set(groupCourses.map(gc => gc.courseId)));
  const courses = courseIds.length ? await prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, code: true, name: true, credits: true } }) : [];
  const idToCourse = new Map(courses.map(c => [c.id, { code: c.code, name: c.name, credits: c.credits }]));

  function buildTree(pid = 0) {
    const arr = children.get(pid) || [];
    return arr.map(g => ({
      name: g.name,
      type: g.type,
      required: g.required,
      totalCredits: g.totalCredits,
      courses: groupCourses.filter(gc => gc.groupId === g.id).map(gc => idToCourse.get(gc.courseId)).filter(Boolean),
      subgroups: buildTree(g.id),
    }));
  }

  const srcTree = buildTree(0);

  return await prisma.$transaction(async (tx) => {
    const created = await tx.curriculum.create({
      data: {
        code: toCode,
        majorId: majorId,
        startYear: startYear != null ? Number(startYear) : src.startYear,
        endYear: endYear !== undefined ? (endYear != null ? Number(endYear) : null) : src.endYear,
      },
    });

    const codeMap = new Map(courses.map(c => [c.code, c.id]));
    for (const g of srcTree) {
      await createGroupRecursive(tx, created.id, g, null, codeMap);
    }

    return { curriculumCode: created.code };
  });
}

async function getStudentCurriculum(id) {
  const student = await prisma.student.findUnique({ where: { code: id } });
  if (!student) { const err = new Error('Student not found'); err.status = 404; throw err; }

  const curriculum = await getCurriculumByCode(student.curriculumCode);
  return curriculum;
}

async function getCurriculumByCode(code) {
  const cur = await prisma.curriculum.findUnique({ where: { code } });
  if (!cur) { const err = new Error('Not found'); err.status = 404; throw err; }

  const groups = await prisma.curriculumGroup.findMany({
    where: { curriculumId: cur.id },
    select: { id: true, name: true, type: true, required: true, totalCredits: true, parentGroupId: true },
  });
  const children = new Map();
  for (const g of groups) {
    const pid = g.parentGroupId || 0;
    if (!children.has(pid)) children.set(pid, []);
    children.get(pid).push(g);
  }
  const groupCourses = await prisma.groupCourse.findMany({ where: { groupId: { in: groups.map(g => g.id) } }, select: { groupId: true, courseId: true } });
  const courseIds = Array.from(new Set(groupCourses.map(gc => gc.courseId)));
  const courses = courseIds.length ? await prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, code: true, name: true, credits: true } }) : [];
  const idToCourse = new Map(courses.map(c => [c.id, { code: c.code, name: c.name, credits: c.credits }]));

  function buildTree(pid = 0) {
    const arr = children.get(pid) || [];
    return arr.map(g => ({
      name: g.name,
      type: g.type,
      required: g.required,
      totalCredits: g.totalCredits,
      courses: groupCourses.filter(gc => gc.groupId === g.id).map(gc => idToCourse.get(gc.courseId)).filter(Boolean),
      subgroups: buildTree(g.id),
    }));
  }

  const major = await prisma.major.findUnique({ where: { id: cur.majorId } });

  return {
    code: cur.code,
    majorName: major?.name || "",
    startYear: cur.startYear,
    endYear: cur.endYear,
    archivedAt: cur.archivedAt,
    groups: buildTree(0),
  };
}

async function listCurricula({ majorName, startYear, endYear } = {}) {
  let majorId = null;
  if (majorName && majorName !== 'undefined') {
    const major = await prisma.major.findUnique({ where: { name: majorName } });
    if (!major) {
      const err = new Error('Major not found'); err.status = 400; throw err;
    }
    majorId = major.id;
  }
  const where = {};
  if (majorId !== null) where.majorId = majorId;
  if (startYear && startYear !== 'undefined') where.startYear = Number(startYear);
  if (endYear && endYear !== 'undefined') where.endYear = endYear ? Number(endYear) : null;
  const items = await prisma.curriculum.findMany({
    where,
    select: { code: true, startYear: true, endYear: true, archivedAt: true, major: { select: { name: true } } },
    orderBy: [ {major: { name: 'asc' }}, { startYear: 'asc' }, { code: 'asc' }],
  });
  const mappedItems = items.map(item => ({
    ...item,
    majorName: item.major?.name || '',
    major: undefined, // remove the object
  }));
  return { items: mappedItems };
}


module.exports = {
  createCurriculum,
  updateCurriculumByCode,
  archiveCurriculum,
  deleteCurriculumByCode,
  cloneCurriculum,
  getCurriculumByCode,
  getStudentCurriculum,
  listCurricula,
};
