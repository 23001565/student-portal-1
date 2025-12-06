import { prisma } from '../data/prisma.js';
import redis from '../data/redis.js';

/**
 * Cache all relevant courses and classes when admin starts a registration round.
 */
/** 
 * async function curriculumCourseCache() {
  const curricula = await prisma.curriculum.findMany({
    where: { archivedAt: null },
    select: { id: true } 
    });

  for (const curriculum of curricula) {
    // fetch all groups for this curriculum
    const groups = await prisma.curriculumGroup.findMany({
      where: { curriculumId: curriculum.id },
      select: { id: true },
    });
    const groupIds = groups.map(g => g.id);

    // fetch all courses linked to these groups
    const groupCourses = await prisma.groupCourse.findMany({
      where: { groupId: { in: groupIds } },
      select: { courseId: true },
    });
    const courseIds = [...new Set(groupCourses.map(gc => gc.courseId))]; // remove duplicates

    // cache it
    await redis.set(`curriculum:${curriculum.id}:courses`, JSON.stringify(courseIds));
    console.log(` Cached ${courseIds.length} courses for curriculum ${curriculum.id}`);
  }
}
*/


//better version
async function buildAllCurriculumCourseCache() {
  // Step 1: get all groups with curriculumId
  const groups = await prisma.curriculumGroup.findMany({
    select: { id: true, curriculumId: true },
  });

  const groupIdToCurriculumId = {};
  groups.forEach(g => {
    groupIdToCurriculumId[g.id] = g.curriculumId;
  });

  // Step 2: get all courses linked to these groups
  const groupCourses = await prisma.groupCourse.findMany({
    select: { groupId: true, courseId: true },
  });

  // Step 3: flatten courses per curriculum
  const curriculumCoursesMap = {}; // { curriculumId: Set(courseId) }
  for (const gc of groupCourses) {
    const curriculumId = groupIdToCurriculumId[gc.groupId];
    if (!curriculumCoursesMap[curriculumId]) {
      curriculumCoursesMap[curriculumId] = new Set();
    }
    curriculumCoursesMap[curriculumId].add(gc.courseId);
  }

  // Step 4: cache each curriculum
  const pipeline = redis.pipeline();
  for (const [curriculumId, courseSet] of Object.entries(curriculumCoursesMap)) {
    const key = `curriculum:${curriculumId}:courses`;
    pipeline.set(key, JSON.stringify(Array.from(courseSet)), 'EX', 60*60*24*30); // 30 days expiry
  }
  await pipeline.exec();

  console.log(` Cached courses for ${Object.keys(curriculumCoursesMap).length} curricula`);
}


async function cacheAllCourses() {
  const courses = await prisma.course.findMany({
    where: { archivedAt: null },
  }); 
  const pipeline = redis.pipeline();
  
  courses.forEach(course => {
    pipeline.set(`course:${course.id}`, JSON.stringify(course), 'EX', 60*60*24*30); // 30 days expiry
  });

  await pipeline.exec();
  console.log(`Cached ${courses.length} courses`);
}

async function cacheCourses(courseIds) {
  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
  });

  const pipeline = redis.pipeline();
  for (const c of courses) {
    pipeline.set(
      `course:${c.id}`,
      JSON.stringify({
        id: c.id,
        code: c.code,
        title: c.title,
        credits: c.credits,
        department: c.department,
        prerequisites: c.prerequisites,
      })
    );
  }
  await pipeline.exec();
  console.log(`Cached ${courses.length} courses`);
}

async function getCachedCourseIds(curriculumId) {
  const key = `curriculum:${curriculumId}:courses`;
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached); // return cached list
  }

  console.warn(`Cache miss for curriculum ${curriculumId}, fetching from DB...`);

  // Fallback to DB
  const curriculumCourses = await prisma.curriculumCourse.findMany({
    where: { curriculumId },
    select: { courseId: true },
  });

  const courseIds = curriculumCourses.map(cc => cc.courseId);

  // Optional: repopulate Redis cache
  if (courseIds.length > 0) {
    await redis.set(key, JSON.stringify(courseIds));
  }

  return courseIds;
}
/** 
 * async function buildCurriculumClassList(curriculumId, term, year) {
  // 1. Get cached course IDs
  const courseIds = await getCachedCourseIds(curriculumId);
  if (courseIds.length === 0) {
    console.warn(`No courses cached for curriculum ${curriculumId}`);
    return [];
  }

  // 2. Fetch classes for these courses and the current registration round
  const classes = await prisma.class.findMany({
    where: {
      courseId: { in: courseIds },
      term, // dynamic argument
      year, // dynamic argument
    },
    select: {
      id: true,
      courseId: true,
      code: true,
      capacity: true,
      dayOfWeek: true,
      startPeriod: true,
      endPeriod: true,
      location: true,
    },
  });

  // 3. Cache in Redis using term and year
  const key = `curriculum:${curriculumId}:classes:${term}:${year}`;
  await redis.set(key, JSON.stringify(classes));

  console.log(`Cached ${classes.length} classes for curriculum ${curriculumId} (${term} ${year})`);
  return classes;
}

 **/

  async function cacheCurriculumClassesForRound(term, year) {
  // Step 1: get all curriculum IDs
  const curricula = await prisma.curriculum.findMany({ 
    where: { archivedAt: null },
    select: { id: true } 
    });

  for (const curriculum of curricula) {
    // Step 2: get course IDs from Redis
    /**
     * const courseIdsStr = await redis.get(`curriculum:${curriculum.id}:courses`);
    if (!courseIdsStr) continue; // skip if curriculum has no courses cached
    const courseIds = JSON.parse(courseIdsStr);
     */
    

    const courseIds = getCachedCourseIds(curriculum.id);

    if (courseIds.length === 0) continue;

    // Step 3: fetch all classes for these courses in the given term/year
    const classes = await prisma.class.findMany({
      where: {
        courseId: { in: courseIds },
        term,
        year,
      },
      select: {
        id: true,
        courseId: true,
        code: true,
        capacity: true,
        dayOfWeek: true,
        startPeriod: true,
        endPeriod: true,
        location: true,
      },
    });

    // Step 4: cache the classes under a curriculum-term-year key
    const key = `curriculum:${curriculum.id}:classes:${term}:${year}`;
    await redis.set(key, JSON.stringify(classes), 'EX', 60*60*24*7); // 7 days expiry

    console.log(` Cached ${classes.length} classes for curriculum ${curriculum.id} (${term} ${year})`);
  }
}

//optimized version
async function cacheAllCurriculumClassesForRound(term, year) {
  console.log(` Building curriculum-class caches for ${term} ${year}`);

  // Step 1: load curriculum->courseIds map from Redis
  const curricula = await prisma.curriculum.findMany({ 
    where: { archivedAt: null },
    select: { id: true } });

  const courseMap = {}; // { curriculumId: [courseIds] }
  
  for (const { id } of curricula) {
    courseMap[id] = await getOrRebuildCurriculumCourses(id);
  } 

  // Flatten all courseIds (for querying classes)
  const allCourseIds = [
    ...new Set(Object.values(courseMap).flat()),
  ];

  if (allCourseIds.length === 0) {
    console.warn(' No courses found in cache to build class lists');
    return;
  }

  // Step 2: fetch all classes for this term/year in a single DB call
  const allClasses = await prisma.class.findMany({
    where: {
      courseId: { in: allCourseIds },
      term,
      year,
    },
    select: {
      id: true,
      courseId: true,
      code: true,
      startPeriod: true,
      endPeriod: true,
      capacity: true,
      dayOfWeek: true,
      location: true,
    },
  });

  // Step 3: build a map of courseId -> class list
  const classByCourse = {};
  for (const cls of allClasses) {
    if (!classByCourse[cls.courseId]) classByCourse[cls.courseId] = [];
    classByCourse[cls.courseId].push(cls);
  }

  // Step 4: map each curriculumId -> its class list
  const curriculumClassesMap = {};
  for (const [curriculumId, courseIds] of Object.entries(courseMap)) {
    const classes = [];
    for (const courseId of courseIds) {
      if (classByCourse[courseId]) classes.push(...classByCourse[courseId]);
    }
    curriculumClassesMap[curriculumId] = classes;
  }

  // Step 5: cache each curriculum’s class list in Redis
  const pipeline = redis.pipeline();
  for (const [curriculumId, classes] of Object.entries(curriculumClassesMap)) {
    const key = `curriculum:${curriculumId}:classes:${term}:${year}`;
    pipeline.set(key, JSON.stringify(classes), 'EX', 60*60*24*7); // 7 days expiry
  }
  await pipeline.exec();

  console.log(` Cached class lists for ${Object.keys(curriculumClassesMap).length} curricula (${term} ${year})`);
}

// services/curriculumCacheService.js



/**
 * Fetch curriculum course list from cache, rebuild if missing.
 * Returns an array of courseIds.
 */
async function getOrRebuildCurriculumCourses(curriculumId) {
  const redisKey = `curriculum:${curriculumId}:courses`;

  // Step 1: Try cache first
  const cached = await redis.get(redisKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Step 2: Cache miss → rebuild from DB
  const groups = await prisma.curriculumGroup.findMany({
    where: { curriculumId },
    select: { id: true },
  });
  const groupIds = groups.map(g => g.id);

  if (groupIds.length === 0) {
    console.warn(` Curriculum ${curriculumId} has no curriculumGroups`);
    await redis.set(redisKey, JSON.stringify([]), 'EX', 60*60*24*30); // cache empty list for 30 days
    return [];
  }

  const groupCourses = await prisma.curriculumGroupCourse.findMany({
    where: { groupId: { in: groupIds } },
    select: { courseId: true },
  });
  const courseIds = [...new Set(groupCourses.map(gc => gc.courseId))];

  // Step 3: Cache it for next time
  await redis.set(redisKey, JSON.stringify(courseIds), 'EX', 60*60*24*30); // 30 days expiry

  console.log(` Rebuilt cache for curriculum ${curriculumId} (${courseIds.length} courses)`);

  return courseIds;
}


 async function cacheClassCapacity(year, semester) {
  const classes = await prisma.class.findMany({
    where: { year, term: semester },
    include: {
      _count: { select: { enrollments: true } },
    },
  });

  for (const cls of classes) {
    await redis.hSet(`class:${cls.id}`, {
      capacity: cls.capacity,
      seats_taken: cls._count.enrollments,
    });
  }

  console.log(` Cached capacity and seats taken for ${classes.length} classes`);
}


async function deleteKeysByPattern(pattern) {
  let cursor = '0';
  do {
    const reply = await redis.scan(cursor, 'MATCH', pattern);
    cursor = reply[0];
    const keys = reply[1];
    if (keys.length > 0) await redis.del(...keys);
  } while (cursor !== '0');
  console.log(` Deleted old keys matching ${pattern}`);
}


async function prepareRegistrationRound(term, year, round) {
  console.log(` Preparing cache for registration Round ${round} (${term} ${year})`);

  // Step 0: Clean up previous class caches
  const pattern = 'curriculum:*:classes:*';
  await deleteKeysByPattern(pattern); // uses SCAN + DEL internally

  // Step 1: For first round, rebuild static data
  if (round === 1) {
    await cacheAllCourses(); // courseId -> details
    await buildAllCurriculumCourseCache(); // curriculumId -> [courseIds]
  }

  // Step 2: Rebuild dynamic class caches for this round
  await cacheAllCurriculumClassesForRound(term, year);

  console.log(` Cache ready for Round ${round}`);
}

