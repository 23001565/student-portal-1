import redisClient from '../data/redis.js';

export async function checkTimeConflict(studentId, newCourse) {
  const timeIndexKey = `session:${studentId}:time_index`;

  for (const day of newCourse.days) {
    for (let p = newCourse.periodStart; p <= newCourse.periodEnd; p++) {
      const slotKey = `${day}-P${p}`;
      const conflict = await redisClient.sIsMember(timeIndexKey, slotKey);
      if (conflict) {
        return { valid: false, message: "Time conflict detected" };
      }
    }
  }
  return { valid: true };
}

export async function checkDuplicateCourse(studentId, courseId) {
  const scheduleKey = `session:${studentId}:schedule`;
  const scheduleRaw = await redisClient.get(scheduleKey);
  const schedule = scheduleRaw ? JSON.parse(scheduleRaw) : [];

  if (schedule.some(c => c.course_id === courseId)) {
    return { valid: false, message: "Duplicate course selected" };
  }
  return { valid: true };
}

export async function checkSeatAvailability(courseId) {
  const seatsTaken = await redisClient.get(`course:${courseId}:seats_taken`);
  const capacity = await redisClient.get(`course:${courseId}:capacity`);

  if (seatsTaken === null || capacity === null) {
    // fallback to DB if cache miss
    const { rows } = await db.query(
      "SELECT capacity, seats_taken FROM courses WHERE id = $1",
      [courseId]
    );
    if (rows.length === 0) return { valid: false, message: "Course not found" };
    await redisClient.set(`course:${courseId}:capacity`, rows[0].capacity);
    await redisClient.set(`course:${courseId}:seats_taken`, rows[0].seats_taken);
    return rows[0].capacity > rows[0].seats_taken
      ? { valid: true }
      : { valid: false, message: "Course is full" };
  }

  if (parseInt(seatsTaken) >= parseInt(capacity)) {
    return { valid: false, message: "Course is full" };
  }

  return { valid: true };
}