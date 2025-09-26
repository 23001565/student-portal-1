const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // your insert logic here
  const admin = await prisma.admin.create({
    data: {
      email: 'admin1@gmail.com',
      username: 'admin1',
      password: 'admin1'
    }
  });
  console.log('Created admin:', admin);

  const newStudent = await prisma.student.create({
    data: [{
      email: '100@gmail.com',
      name: 'Chanchan',
      password: '100',
      year: 2,
      major: {
      connect: {
        name: 'KHDL'  // Must exactly match a Major.name value
      }} 
    },
    {
      email: '101@gmail.com',
      name: 'Kitty',
      password: '101',
      year: 1,
      major: {
      connect: {
        name: 'KHMT'  // Must exactly match a Major.name value
      }} 
    }]
  });
  console.log('Created student:', newStudent);
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
