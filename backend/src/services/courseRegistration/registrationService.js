/*
export async function getStudentClasses(studentId, curriculumId, term, year) {
  const curriculumCoursesKey = `curriculum:${curriculumId}:courses`;
  let courseIds = JSON.parse(await redis.get(curriculumCoursesKey));
  if (!courseIds) {
    // fallback to DB
    courseIds = await getCoursesFromDB(curriculumId);
  }

  const classLists = [];
  for (const courseId of courseIds) {
    const key = `course:${courseId}:classes:${term}:${year}`;
    let classes = JSON.parse(await redis.get(key));
    if (!classes) {
      classes = await fetchClassesForCourseFromDB(courseId, term, year);
      await redis.set(key, JSON.stringify(classes));
    }

    // merge with dynamic seats
    classes = await Promise.all(classes.map(async cls => {
      const seatsTaken = parseInt(await redis.get(`class:${cls.id}:seats_taken`) || 0, 10);
      return { ...cls, seatsTaken };
    }));

    classLists.push(...classes);
  }

  return classLists;
}
  */