
// controllers/logout.controller.js
const logoutService = require ('../services/logout.js');

async function logout(req, res, next) {
  try {
    await logoutService.logout({
      token: req.token,
      role: req.user.role,
    });

    res
    .clearCookie('access_token')
    .status(200)
    .json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}
module.exports = { logout };

