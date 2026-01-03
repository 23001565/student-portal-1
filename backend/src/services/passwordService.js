const prisma = require('../data/prisma');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;

async function changePassword(id, role, oldPassword, newPassword) {
  // Find the user
  let user;
  if (role === 'admin') {
    user = await prisma.admin.findUnique({ where: { id: id } });
  } else {
    user = await prisma.student.findUnique({ where: { code: id } });
  }

  if (!user) {
    throw new Error('User not found');
  }

  // Verify old password
  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) {
    throw new Error('Old password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update password
  if (role === 'admin') {
    return prisma.admin.update({
      where: { id: id },
      data: { password: hashedPassword },
    });
  }
  await prisma.student.update({
    where: { code: id },
    data: { password: hashedPassword },
  });
}

module.exports = {
  changePassword,
};