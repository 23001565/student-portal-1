const redisClient = require("../../data/redis.js");
const prisma = require("../../data/prisma.js");
const csvParser = require('csv-parser');
const streamifier = require('streamifier');

async function getStudentId(studentCode) {
  const student = await prisma.student.findUnique({ where: { code: studentCode } });
  if (!student) throw new Error('Student not found');
  return student.id;
}

// Student: List their enrollments with grade details, filtered
async function studentListEnrollments({ studentId, semester, year, courseCode, classCode }) {
  let classIds = undefined;
  // If classCode is given, get classId
  if (classCode) {
    const classObj = await prisma.class.findUnique({ where: { code: classCode } });
    if (!classObj) throw new Error('Class not found');
    classIds = [classObj.id];
  } else if (courseCode) {
    // If only courseCode is given, get all classes for that course (optionally filter by semester/year)
    const course = await prisma.course.findUnique({ where: { code: courseCode } });
    if (!course) throw new Error('Course not found');
    const classWhere = { courseId: course.id };
    if (semester) classWhere.semester = Number(semester);
    if (year) classWhere.year = Number(year);
    const classes = await prisma.class.findMany({ where: classWhere });
    classIds = classes.map(c => c.id);
    if (classIds.length === 0) return [];
  }
  const where = {
    studentId,
    ...(semester && { semester: Number(semester) }),
    ...(year && { year: Number(year) }),
    ...(classIds && { classId: { in: classIds } }),
  };
  return prisma.enrollment.findMany({
    where,
    include: {
      class: { include: { course: true } },
      grade: true,
    },
  });
}

// Admin: View any student's enrollments (with grade details)
async function adminStudentEnrollments({ studentCode, semester, year, courseCode, classCode }) {
  const student = await prisma.student.findUnique({ where: { code: studentCode } });
  if (!student) throw new Error('Student not found');
  return studentListEnrollments({ studentId: student.id, semester, year, courseCode, classCode });
}


// Admin: List enrollments with filters
async function adminListEnrollments({ semester, year, classCode, courseCode, studentCode, status = 'ENROLLED' }) {
  // Build where clause for enrollment with partial matching
  const where = {
    status,
    ...(semester && { semester: Number(semester) }),
    ...(year && { year: Number(year) }),
    ...(classCode || courseCode ? {
      class: {
        ...(classCode && { code: { contains: classCode, mode: 'insensitive' } }),
        ...(courseCode && { course: { code: { contains: courseCode, mode: 'insensitive' } } }),
      }
    } : {}),
    ...(studentCode && {
      student: {
        code: { contains: studentCode, mode: 'insensitive' }
      }
    }),
  };
  // Return with class and student info for display
  const enrollments = await prisma.enrollment.findMany({
    where,
    include: {
      class: { include: { course: true } },
      student: true,
    },
  });
  return enrollments.map(enr => ({
    ...enr,
    classCode: enr.class?.code || '',
    courseCode: enr.class?.course?.code || '',
    courseName: enr.class?.course?.name || '',
    studentCode: enr.student?.code || '',
    studentName: enr.student?.name || '',
  }));
}

// Admin: Add enrollment
async function adminAddEnrollment({ classCode, studentCode }) {
  // Find class and student
  const classObj = await prisma.class.findUnique({ where: { code: classCode } });
  const studentObj = await prisma.student.findUnique({ where: { code: studentCode } });
  if (!classObj || !studentObj) throw new Error('Class or student not found');
  return prisma.enrollment.create({
    data: {
      classId: classObj.id,
      studentId: studentObj.id,
      semester: classObj.semester,
      year: classObj.year,
      status: 'ENROLLED',
    }
  });
}

// Admin: Delete enrollment
async function adminDeleteEnrollment(enrollmentId) {
  return prisma.enrollment.delete({ where: { id: enrollmentId } });
}

// Admin: View/edit/add grade for enrollment
async function adminUpdateGrade(enrollmentId, { midTerm, finalExam, total10Scale }) {
  // Default conversion
  function convert10to4(total10) {
    if (total10 >= 8.5) return 4.0;
    if (total10 >= 7.0) return 3.0;
    if (total10 >= 5.5) return 2.0;
    if (total10 >= 4.0) return 1.0;
    return 0.0;
  }
  function getLetterGrade(total10) {
    if (total10 >= 8.5) return 'A';
    if (total10 >= 7.0) return 'B';
    if (total10 >= 5.5) return 'C';
    if (total10 >= 4.0) return 'D';
    return 'F';
  }
  const total4Scale = convert10to4(total10Scale);
  const letterGrade = getLetterGrade(total10Scale);
  return prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { midTerm, finalExam, total10Scale, total4Scale, letterGrade }
  });
}

// Admin: Upload grade CSV for class
async function adminUploadGradeCSV(classCode, csvText) {
  // CSV format: studentCode,midTerm,final,total10Scale
  const results = [];
  const classObj = await prisma.class.findUnique({ where: { code: classCode } });
  if (!classObj) throw new Error('Class not found');
  const records = await new Promise((resolve, reject) => {
    const out = [];
    const stream = streamifier.createReadStream(csvText);
    stream
      .pipe(csvParser())
      .on('data', (row) => out.push(row))
      .on('end', () => resolve(out))
      .on('error', reject);
  });
  for (const rec of records) {
    const studentObj = await prisma.student.findUnique({ where: { code: rec.studentCode } });
    if (!studentObj) continue;
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: studentObj.id,
        classId: classObj.id,
        semester: classObj.semester,
        year: classObj.year
      }
    });
    if (enrollment) {
      const updated = await adminUpdateGrade(enrollment.id, {
        midTerm: Number(rec.midTerm),
        finalExam: Number(rec.final),
        total10Scale: Number(rec.total10Scale)
      });
      results.push(updated);
    }
  }
  return results;
}



async function getCurriculumIdForStudent(studentId) {
  const student = await prisma.student.findUnique({
    where: { code: studentId },
    select: { curriculumId: true }
  });
  return student ? student.curriculumId : null;
}

async function getStudentId(studentCode) {
  const student = await prisma.student.findUnique({
    where: { code: studentCode },
  });
  return student ? student.id : null;
}

async function getClassesForRegistration(semester, year, curriculumId, q = null) {
  console.log('getClassesForRegistration called with:', { semester, year, curriculumId, q });

  // ---------- CACHE (only when curriculumId exists) ----------
  if (curriculumId && redisClient) {
    const cacheKey = `curriculum:${curriculumId}:classes:${semester}:${year}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const cachedClasses = JSON.parse(cached);

        const classesWithSeats = await Promise.all(
          cachedClasses.map(async (cls) => {
            const key = `class:${cls.id}:seats_taken`;
            const seatsTaken = parseInt((await redisClient.get(key)) || '0', 10);
            return { ...cls, seatsTaken };
          })
        );

        console.log('Returning from cache');
        return classesWithSeats;
      }
    } catch (e) {
      console.log('Redis cache error:', e.message);
    }
  }

  // ---------- DB QUERY ----------
  const where = {
    archivedAt: null,
    canceledAt: null,
    semester,
    year,
  };

  //  Only filter by curriculum if provided
  if (curriculumId) {
    where.course = {
      groups: {
        some: {
          curriculumGroup: {
            curriculumId: Number(curriculumId),
          },
        },
      },
    };
  }

  const classes = await prisma.class.findMany({
    where,
    include: {
      course: true,
      enrollments: {
        where: { status: 'ENROLLED' },
        select: { id: true },
      },
    },
  });

  // ---------- ADD seats_taken ----------
  let classesWithSeats = await Promise.all(
    classes.map(async (cls) => {
      let seatsTaken = cls.enrollments.length;

      if (redisClient) {
        try {
          const key = `class:${cls.id}:seats_taken`;
          seatsTaken = parseInt((await redisClient.get(key)) || seatsTaken.toString(), 10);
        } catch {}
      }

      return {
        ...cls,
        seatsTaken,
        courseName: cls.course.name,
        courseCode: cls.course.code,
        credits: cls.course.credits,
      };
    })
  );

  // ---------- SEARCH ----------
  if (q) {
    const qLower = q.toLowerCase();
    classesWithSeats = classesWithSeats.filter(
      (cls) =>
        cls.courseCode.toLowerCase().includes(qLower) ||
        cls.courseName.toLowerCase().includes(qLower)
    );
  }

  // ---------- CACHE RESULT (only with curriculumId) ----------
  if (curriculumId && classesWithSeats.length && redisClient) {
    const cacheKey = `curriculum:${curriculumId}:classes:${semester}:${year}`;
    const cacheData = classesWithSeats.map((cls) => ({
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

    try {
      await redisClient.set(cacheKey, JSON.stringify(cacheData), 'EX', 60 * 60 * 24 * 7);
    } catch (e) {
      console.log('Redis set error:', e.message);
    }
  }

  return classesWithSeats;
}

//
async function initClassCapacity(classId) {
  if (!redisClient) return;

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
  if (!redisClient) {
    // Without redis, check capacity from DB
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      select: { capacity: true },
      include: {
        enrollments: {
          where: { status: 'ENROLLED' },
          select: { id: true }
        }
      }
    });
    if (cls.enrollments.length >= cls.capacity) {
      return { success: false, message: "Class is full" };
    }
    return { success: true };
  }

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
  if (!redisClient) return;
  const key = `class:${classId}:seats_taken`;
  await redisClient.decr(key);
}

// Enroll student in class
async function enrollStudent(studentId, classId, semester, year) {
  console.log('enrollStudent called with:', { studentId, classId, semester, year });
  // Check if already enrolled
  const stId = await getStudentId(studentId);
  console.log('Resolved student ID:', stId);
  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_classId_semester_year: {
        studentId: stId,
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
        studentId: stId,
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
      studentId: stId,
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
  const stId = await getStudentId(studentId);
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_classId_semester_year: {
        studentId: stId,
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
  const stId = await getStudentId(studentId);
  return prisma.enrollment.findMany({
    where: {
      studentId: stId,
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
  //const stId = await getStudentId(studentId);
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
  getCurriculumIdForStudent,
  getStudentId,
  adminListEnrollments,
  adminAddEnrollment,
  adminDeleteEnrollment,
  adminUpdateGrade,
  adminUploadGradeCSV,
  studentListEnrollments,
  adminStudentEnrollments,
  getStudentId,
};
