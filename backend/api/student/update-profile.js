// Vercel serverless function: PUT /api/student/update-profile
const prisma = require('../../src/prisma');
const bcrypt = require('bcryptjs');
const { getUserFromRequest } = require('../../src/utils/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method not allowed' });
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const studentId = user.id;
    const { phone, dob, gender, password } = req.body;
    const updateData = {};
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;
    if (dob) {
      const dateObject = new Date(dob);
      if (!isNaN(dateObject.getTime())) updateData.dob = dateObject;
    }
    if (password && password.trim() !== "") {
      const salt = bcrypt.genSaltSync(10);
      updateData.password = bcrypt.hashSync(password, salt);
    }
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
    });
    res.json({ message: "Cập nhật hồ sơ thành công", student: updatedStudent });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật: " + err.message });
  }
};
