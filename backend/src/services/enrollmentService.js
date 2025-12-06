import redisClient from "../data/redis.js";


export async function getClassForCurriculum(curriculumId) {
}

export async function reserveSeat(courseId) {
  const key = `course:${courseId}:seats_taken`;
  const capacityKey = `course:${courseId}:capacity`;

  await redisClient.watch(key);
  const seatsTaken = parseInt(await redisClient.get(key));
  const capacity = parseInt(await redisClient.get(capacityKey));

  if (seatsTaken >= capacity) {
    await redisClient.unwatch();
    return { success: false, message: "Course is full" };
  }

  const tx = redisClient.multi();
  tx.incr(key);
  const results = await tx.exec();

  if (!results) {
    return { success: false, message: "Race condition detected, retry" };
  }

  return { success: true };
}

export async function releaseSeat(courseId) {
  const key = `course:${courseId}:seats_taken`;
  await redisClient.decr(key);
}
