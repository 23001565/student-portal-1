import redisClient from "../../data/redis.js";
import prisma from "../data/prisma.js";

// /**
//  * Lấy danh sách các lớp (Class) thuộc chương trình đào tạo
//  * Dùng khi frontend load danh sách lớp để sinh viên đăng ký
//  */
export async function getClassForCurriculum(curriculumId) {
  return prisma.class.findMany({
    where: { 
      archivedAt: null,
      canceledAt: null,
      course: {
        groups: {
          some: {
            curriculumGroup: {
              curriculumId
            }
          }
        }
      }
    },
    include: {
      course: true
    }
  });
}

// /**
//  * Khởi tạo capacity & seats_taken cho class trong Redis
//  * Gọi khi mở đợt đăng ký hoặc khi server restart
//  */
export async function initClassCapacity(classId) {
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

// /**
//  * Giữ chỗ cho 1 sinh viên khi đăng ký lớp
//  * ✔ Chống race condition
//  * ✔ Không vượt quá capacity
//  */
export async function reserveSeat(classId) {
  const key = `class:${classId}:seats_taken`;
  const capacityKey = `class:${classId}:capacity`;

  // Theo dõi key để tránh race condition
  await redisClient.watch(key);

  const seatsTaken = parseInt(await redisClient.get(key) || "0");
  const capacity = parseInt(await redisClient.get(capacityKey));

  // Nếu lớp đã đầy
  if (seatsTaken >= capacity) {
    await redisClient.unwatch();
    return { success: false, message: "Class is full" };
  }

  // Transaction: tăng số chỗ đã giữ
  const tx = redisClient.multi();
  tx.incr(key);

  const results = await tx.exec();

  // Nếu exec = null → có race condition
  if (!results) {
    return { success: false, message: "Race condition detected, retry" };
  }

  return { success: true };
}

// /**
//  * Trả lại chỗ khi sinh viên huỷ đăng ký
//  */
export async function releaseSeat(classId) {
  const key = `class:${classId}:seats_taken`;
  await redisClient.decr(key);
}
