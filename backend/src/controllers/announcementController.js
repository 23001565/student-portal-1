const announcementService = require('../services/announcementService');

async function listAnnouncements(req, res) {
  const announcements = await announcementService.getAllAnnouncements();
  res.json(announcements);
}
async function createAnnouncement(req, res, next) {
  try {
    const { title, content } = req.body;
    const { id } = req.user; 

    const announcement = await announcementService.createAnnouncement({
      title,
      content,
      postedById: id,
    });

    res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
}
async function deleteAnnouncement(req, res) {
  await announcementService.deleteAnnouncement(Number(req.params.id));
  res.status(204).end();
}
async function deleteAllAnnouncements(req, res) {
  await announcementService.deleteAllAnnouncements();
  res.status(204).end();
}
module.exports = {
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  deleteAllAnnouncements,
};