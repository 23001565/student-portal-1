const prisma = require('../../data/prisma.js');

async function createRegistrationWindow(data) {
  return prisma.courseRegistrationWindow.create({
    data: {
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      semester: parseInt(data.semester, 10),
      year: parseInt(data.year, 10),
      round: parseInt(data.round || 1, 10),
      isActive: data.isActive ?? true,
    },
  });
}

async function getActiveRegistrationWindow() {
  return prisma.courseRegistrationWindow.findFirst({
    where: {
      //isActive: true,
      //startTime: { lte: new Date() },
      endTime: { gte: new Date() },
    },
    orderBy: { startTime: 'desc' },
  });
}

async function getStudentActiveRegistrationWindow() {
  return prisma.courseRegistrationWindow.findFirst({
    where: {
      isActive: true,
      endTime: { gte: new Date() },
    },
    orderBy: { startTime: 'desc' },
  });
}

async function getAllRegistrationWindows() {
  return prisma.courseRegistrationWindow.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

async function updateRegistrationWindow(id, data) {
  return prisma.courseRegistrationWindow.update({
    where: { id: parseInt(id) },
    data: {
      ...(data.startTime && { startTime: new Date(data.startTime) }),
      ...(data.endTime && { endTime: new Date(data.endTime) }),
      ...(data.semester !== undefined && { semester: parseInt(data.semester, 10) }),
      ...(data.year !== undefined && { year: parseInt(data.year, 10) }),
      ...(data.round !== undefined && { round: parseInt(data.round, 10) }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

async function deleteRegistrationWindow(id) {
  return prisma.courseRegistrationWindow.delete({
    where: { id: parseInt(id) },
  });
}
module.exports = {
  createRegistrationWindow,
  getActiveRegistrationWindow,
  getAllRegistrationWindows,
  updateRegistrationWindow,
  deleteRegistrationWindow,
  getStudentActiveRegistrationWindow,
};