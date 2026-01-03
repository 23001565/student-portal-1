const redisClient = require("../../data/redis.js");
const prisma = require("../../data/prisma.js");


async function getClassesForRegistration(semester, year, curriculumId, q = null) {
  // Try cache first if we have a curriculumId
  if (curriculumId) {
    const cacheKey = `curriculum:${curriculumId}:classes:${semester}:${year}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const cachedClasses = JSON.parse(cached);
      // Still need to add dynamic seats_taken
      let classesWithSeats = await Promise.all(cachedClasses.map(async (cls) => {
        const key = `class:${cls.id}:seats_taken`;
        const seatsTaken = parseInt(await redisClient.get(key) || "0", 10);
        return {
          ...cls,
          seatsTaken,
        };
      }));
      
      return classesWithSeats;
    }
  }

  // Cache miss or no curriculumId - fetch from DB
  const where = {
    archivedAt: null,
    canceledAt: null,
    semester,
    year,
  };

  if (curriculumId) {
    // Filter by specific curriculum
    where.course = {
      groups: {
        some: {
          curriculumGroup: {
            curriculumId: parseInt(curriculumId)
          }
        }
      }
    };
  }

  const classes = await prisma.class.findMany({
    where,
    include: {
      course: true,
      enrollments: {
        where: { status: 'ENROLLED' },
        select: { id: true }
      }
    }
  });

  // Add seats_taken from Redis or DB
  let classesWithSeats = await Promise.all(classes.map(async (cls) => {
    const key = `class:${cls.id}:seats_taken`;
    const seatsTaken = parseInt(await redisClient.get(key) || cls.enrollments.length.toString(), 10);
    return {
      ...cls,
      seatsTaken,
      courseName: cls.course.name,
      courseCode: cls.course.code,
      credits: cls.course.credits,
    };
  }));

  if (q) {
    const qLower = q.toLowerCase();
    classesWithSeats = classesWithSeats.filter(cls => 
      cls.courseCode.toLowerCase().includes(qLower) ||
      cls.courseName.toLowerCase().includes(qLower)
    );
  }

  // Cache the result if we have a curriculumId
  if (curriculumId && classesWithSeats.length > 0) {
    const cacheKey = `curriculum:${curriculumId}:classes:${semester}:${year}`;
    // Remove dynamic seats_taken from cache (will be added on retrieval)
    const cacheData = classesWithSeats.map(cls => ({
      id: cls.id,
      code: cls.code,
      semester: cls.semester,
      year: cls.year,
      capacity: cls.capacity,
      dayOfWeek: cls.dayOfWeek,
      startPeriod: cls.startPeriod,
      endPeriod: cls.endPeriod,
      location: cls.location,
      courseId: cls.courseId,
      courseName: cls.courseName,
      courseCode: cls.courseCode,
      credits: cls.credits,
    }));
    await redisClient.set(cacheKey, JSON.stringify(cacheData), 'EX', 60*60*24*7); // 7 days
  }

  return classesWithSeats;
}

//
 async function initClassCapacity(classId) {
  const keyTaken = `class:${classId}:seats_taken`;
  const keyCapacity = `class:${classId}:capacity`;

  const exists = await redisClient.exists(keyCapacity);
  if (exists) return;

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { capacity: true }
  });

  await redisClient.set(keyCapacity, cls.capacity);
  await redisClient.set(keyTaken, 0);
}

//
async function reserveSeat(classId) {
  const key = `class:${classId}:seats_taken`;
  const capacityKey = `class:${classId}:capacity`;

  await redisClient.watch(key);

  const seatsTaken = parseInt(await redisClient.get(key) || "0");
  const capacity = parseInt(await redisClient.get(capacityKey));

  if (seatsTaken >= capacity) {
    await redisClient.unwatch();
    return { success: false, message: "Class is full" };
  }

  const tx = redisClient.multi();
  tx.incr(key);

  const results = await tx.exec();

  if (!results) {
    return { success: false, message: "Race condition detected, retry" };
  }

  return { success: true };
}

//
async function releaseSeat(classId) {
  const key = `class:${classId}:seats_taken`;
  await redisClient.decr(key);
}

// Enroll student in class
async function enrollStudent(studentId, classId, semester, year) {
  // Check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_classId_semester_year: {
        studentId,
        classId,
        semester,
        year
      }
    }
  });

  if (existing && existing.status === 'ENROLLED') {
    return { success: false, message: "Already enrolled in this class" };
  }

  // Reserve seat
  const reserveResult = await reserveSeat(classId);
  if (!reserveResult.success) {
    return reserveResult;
  }

  // Create or update enrollment
  await prisma.enrollment.upsert({
    where: {
      studentId_classId_semester_year: {
        studentId,
        classId,
        semester,
        year
      }
    },
    update: {
      status: 'ENROLLED',
      updatedAt: new Date()
    },
    create: {
      studentId,
      classId,
      semester,
      year,
      status: 'ENROLLED'
    }
  });

  return { success: true };
}

// Drop enrollment
async function dropEnrollment(studentId, classId, semester, year) {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_classId_semester_year: {
        studentId,
        classId,
        semester,
        year
      }
    }
  });

  if (!enrollment || enrollment.status !== 'ENROLLED') {
    return { success: false, message: "Not enrolled in this class" };
  }

  // Update status to DROPPED
  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: 'DROPPED',
      updatedAt: new Date()
    }
  });

  // Release seat
  await releaseSeat(classId);

  return { success: true };
}

// Check for time conflicts between classes
function hasTimeConflict(class1, class2) {
  if (class1.dayOfWeek !== class2.dayOfWeek) return false;

  // Check if periods overlap
  const start1 = class1.startPeriod;
  const end1 = class1.endPeriod;
  const start2 = class2.startPeriod;
  const end2 = class2.endPeriod;

  return (start1 <= end2 && end1 >= start2);
}

// Check if student is already enrolled in a class for the same course
function hasSameCourseConflict(enrolledClasses, newClass) {
  return enrolledClasses.some(enrolled => enrolled.class.courseId === newClass.courseId);
}

// Get student's enrollments
async function getStudentEnrollments(studentId, semester, year) {
  return prisma.enrollment.findMany({
    where: {
      studentId,
      semester,
      year,
      status: 'ENROLLED'
    },
    include: {
      class: {
        include: {
          course: true
        }
      }
    }
  });
}

// Check for conflicts before enrolling
async function checkEnrollmentConflicts(studentId, classId, semester, year) {
  // Get the class to enroll in
  const newClass = await prisma.class.findUnique({
    where: { id: classId },
    include: { course: true }
  });

  if (!newClass) {
    return { success: false, message: "Class not found" };
  }

  // Get current enrollments
  const enrollments = await getStudentEnrollments(studentId, semester, year);

  // Check same course
  if (hasSameCourseConflict(enrollments, newClass)) {
    return { success: false, message: "Already enrolled in another class for this course" };
  }

  // Check time conflicts
  for (const enrollment of enrollments) {
    if (hasTimeConflict(enrollment.class, newClass)) {
      return { success: false, message: `Time conflict with ${enrollment.class.course.code} - ${enrollment.class.code}` };
    }
  }

  return { success: true };
}

module.exports = {
  getClassesForRegistration,
  initClassCapacity,
  enrollStudent,
  dropEnrollment,
  getStudentEnrollments,
  checkEnrollmentConflicts,
};
