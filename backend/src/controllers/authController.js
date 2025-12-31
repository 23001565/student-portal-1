// controllers/authController.js
function me(req, res) {
  // authMiddleware guarantees req.user exists
  res.status(200).json({
    user: req.user,
  });
}

module.exports = { me };
