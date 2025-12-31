const prisma = require('../data/prisma');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;

async function changePassword(id, role, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
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