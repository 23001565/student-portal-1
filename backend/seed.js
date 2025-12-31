// seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync('123', 10);

  // 1. Tạo Admin
  await prisma.admin.upsert({
    where: { email: 'admin@school.edu' },
    update: {},
    create: {
      email: 'admin@school.edu',
      name: 'Thầy Quản Trị',
      password: passwordHash
    }
  });

  // 2. Tạo Ngành & Chương trình
  const major = await prisma.major.create({ data: { name: 'CNTT' } });
  const curriculum = await prisma.curriculum.create({ 
    data: { name: 'K65 Chuẩn', startYear: 2024, endYear: 2028 } 
  });

  // 3. Tạo Sinh viên
  await prisma.student.create({
    data: {
      code: 'SV001',
      email: 'student@school.edu',
      name: 'Nguyễn Văn An',
      password: passwordHash,
      year: 1,
      className: 'K65-CA',
      majorId: major.id,
      curriculumId: curriculum.id,
      dob: new Date('2006-01-01')
    }
  });

  // 4. Tạo Môn học & Lớp học
  const course = await prisma.course.create({
    data: { code: 'INT3306', name: 'Phát triển Web', credits: 3 }
  });

  await prisma.class.create({
    data: {
      code: 'INT3306 1',
      courseId: course.id,
      semester: 1,
      year: 2025,
      capacity: 50,
      // Dữ liệu JSON chuẩn khớp với Frontend parser
      schedule: [
        { day: 'T2', slots: [1, 2, 3], room: '301-G2' },
        { day: 'T4', slots: [1, 2], room: '201-GD2' }
      ]
    }
  });

  console.log('✅ Đã tạo dữ liệu mẫu thành công!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());