const bcrypt = require('bcrypt');


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function main() {
  // your insert logic here
  const hashedPassword = await hashPassword("admin");
  const adminEmail = 'admin@gmail.com';
  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      username: 'admin',
      password: hashedPassword
    }
  });
  console.log('Admin ensured:', admin);

  
  // create majors using createMany
  await prisma.major.createMany({
    data: [
      { name: 'KHMT' },
      { name: 'KHDL' }
    ],
    skipDuplicates: true
  });
  console.log('Created majors');

  // create curricula individually so we can connect to majors by name
  const curriculaData = [
    { majorName: 'KHMT', code: 'KHMT2020', startYear: 2020 },
    { majorName: 'KHDL', code: 'KHDL2020', startYear: 2020 }
  ];

  const curricula = await Promise.all(curriculaData.map(c =>
    prisma.curriculum.create({
      data: {
        major: { connect: { name: c.majorName } },
        code: c.code,
        startYear: c.startYear
      }
    })
  ));
  console.log('Created curricula:', curricula.map(c => c.code));

  const studentpassw = await hashPassword("student");
  // create students individually because nested connect in createMany is not supported
  const studentsData = [
    { code: 100, email: '100@gmail.com', name: 'Nguyen Van A', year: 2, majorName: 'KHDL', curriculumCode: 'KHDL2020' },
    { code: 101, email: '101@gmail.com', name: 'Nguyen Van B', year: 1, majorName: 'KHMT', curriculumCode: 'KHMT2020' },
    { code: 102, email: '102@gmail.com', name: 'Nguyen Van C', year: 1, majorName: 'KHMT', curriculumCode: 'KHMT2020' },
    { code: 103, email: '103@gmail.com', name: 'Nguyen Van D', year: 1, majorName: 'KHDL', curriculumCode: 'KHDL2020' },
    { code: 104, email: '104@gmail.com', name: 'Nguyen Van E', year: 3, majorName: 'KHDL', curriculumCode: 'KHDL2020' },
    { code: 105, email: '105@gmail.com', name: 'Nguyen Van N', year: 2, majorName: 'KHDL', curriculumCode: 'KHDL2020' }
  ];

  const createdStudents = await Promise.all(studentsData.map(s =>
    prisma.student.create({
      data: {
        code: s.code,
        email: s.email,
        name: s.name,
        password: studentpassw,
        year: s.year,
        major: { connect: { name: s.majorName } },
        curriculum: { connect: { code: s.curriculumCode } }
      }
    })
  ));

  console.log('Created students:', createdStudents.map(s => s.code));
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
