const passwordService = require('../services/passwordService');

async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    const { id, role } = req.user;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    await passwordService.changePassword(id, role, oldPassword, newPassword);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { changePassword };