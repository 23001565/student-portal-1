const prisma = require('../prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  let user = null;
  let role = 'student';

  // 1. Tìm trong bảng Admin trước
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (admin) {
    user = admin;
    role = 'admin';
  } else {
    // 2. Nếu không phải Admin, tìm trong bảng Student
    const student = await prisma.student.findUnique({ where: { email } });
    if (student) {
      user = student;
    }
  }

  // 3. Kiểm tra mật khẩu (Giả sử DB đã hash, nếu chưa hash thì so sánh trực tiếp)
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
  }

  // 4. Tạo Token
  const token = jwt.sign(
    { id: user.id, role, code: user.code },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  // 5. Trả về đúng format Frontend cần
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: role,
      studentId: user.code, // Để hiển thị ID
      avatarUrl: null
    }
  });
};