const prisma = require('../data/prisma');

async function getAllAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
        title: true,
        content: true,
        createdAt: true,
    }
  });
}

async function createAnnouncement({ title, content, postedById }) {
  if (!title || title.trim() === '') {
    throw new Error('Title is required');
  }

  if (!content || content.trim() === '') {
    throw new Error('Content is required');
  }

  return prisma.announcement.create({
    data: {
      title,
      content,
      postedById, 
    },
  });
}


  async function deleteAnnouncement(id) {
    return prisma.announcement.delete({
      where: { id },
    });
  }

  async function deleteAllAnnouncements() {
    return prisma.announcement.deleteMany({});
  }

module.exports = {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  deleteAllAnnouncements,
};
