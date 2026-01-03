const authService = require ('../services/login.js');

async function login(req, res, next) {
  try {
    console.log('LOGIN BODY:', req.body);
    const { email, password, role } = req.body;

    // HTTP metadata
    const userAgent = req.get('user-agent') || null;

    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      null;

    const { token, user } = await authService.login({
      email,
      password,
      role,
      userAgent,
      ipAddress,
    });
    console.log('LOGIN RESPONSE:', { token, user });

    // Set token in HttpOnly cookie
    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: false, 
        sameSite: 'lax',
        maxAge:
          role === 'admin'
            ? 2 * 60 * 60 * 1000 // 2h
            : 15 * 60 * 1000,    // 15m
      })
      .status(200)
      .json({ user });

  } catch (err) {
    //console.error('LOGIN ERROR:', err);
    next(err);
  }
}

module.exports = { login };
