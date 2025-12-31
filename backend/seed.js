// backend/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Đảm bảo đã npm install bcryptjs
const prisma = new PrismaClient();

// Hàm tạo điểm ngẫu nhiên
function randomGrade() {
  const mid = parseFloat((Math.random() * 5 + 5).toFixed(1)); // 5.0 -> 10.0
  const final = parseFloat((Math.random() * 5 + 5).toFixed(1));
  const total10 = parseFloat((mid * 0.3 + final * 0.7).toFixed(1)); // 30% - 70%
  
  let letter = 'F';
  if (total10 >= 8.5) letter = 'A';
  else if (total10 >= 8.0) letter = 'B+';
  else if (total10 >= 7.0) letter = 'B';
  else if (total10 >= 6.5) letter = 'C+';
  else if (total10 >= 5.5) letter = 'C';
  else if (total10 >= 5.0) letter = 'D+';
  else if (total10 >= 4.0) letter = 'D';

  return { mid, final, total10, letter };
}

async function main() {
  console.log('🌱 Đang bắt đầu tạo dữ liệu mẫu...');

  // 1. Xóa dữ liệu cũ (Theo thứ tự để tránh lỗi khóa ngoại)
  await prisma.announcement.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.class.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.major.deleteMany();
  await prisma.curriculum.deleteMany();

  // 2. Tạo Admin & User cơ bản
  const passwordHash = bcrypt.hashSync('123', 10);
  
  await prisma.admin.create({
    data: {
      email: 'admin@school.edu',
      name: 'Thầy Quản Trị',
      password: passwordHash
    }
  });

  // 3. Tạo Chuyên ngành & Chương trình
  const majorsData = ['Công nghệ thông tin', 'Khoa học máy tính', 'Hệ thống thông tin', 'Toán tin', 'Vật lý kỹ thuật'];
  const majors = [];
  for (const name of majorsData) {
    const m = await prisma.major.create({ data: { name } });
    majors.push(m);
  }

  const curriculum = await prisma.curriculum.create({
    data: { name: 'K65 Chuẩn', startYear: 2024, endYear: 2028 }
  });

  // 4. Tạo 50 Sinh viên
  console.log('creating students...');
  const students = [];
  for (let i = 1; i <= 50; i++) {
    const code = `SV${1000 + i}`; // SV1001, SV1002...
    const student = await prisma.student.create({
      data: {
        code: code,
        email: `${code.toLowerCase()}@school.edu`,
        name: `Sinh viên ${i}`,
        password: passwordHash,
        year: Math.floor(Math.random() * 4) + 1, // Năm 1 đến 4
        className: 'K65-CA',
        majorId: majors[Math.floor(Math.random() * majors.length)].id,
        curriculumId: curriculum.id,
        dob: new Date('2003-01-01'),
        gender: i % 2 === 0 ? 'Nam' : 'Nữ',
        address: 'Hà Nội'
      }
    });
    students.push(student);
  }

  // 5. Tạo Môn học
  console.log('creating courses...');
  const coursesData = [
    { code: 'INT3306', name: 'Phát triển ứng dụng Web', credits: 3 },
    { code: 'INT3304', name: 'Kỹ thuật phần mềm', credits: 3 },
    { code: 'INT3401', name: 'Trí tuệ nhân tạo', credits: 3 },
    { code: 'MAT1093', name: 'Đại số tuyến tính', credits: 4 },
    { code: 'PHY1101', name: 'Vật lý đại cương', credits: 4 },
    { code: 'INT3110', name: 'Cơ sở dữ liệu', credits: 3 },
    { code: 'INT1050', name: 'Toán rời rạc', credits: 3 },
    { code: 'PHI1002', name: 'Triết học Mác - Lênin', credits: 3 }
  ];

  const courses = [];
  for (const c of coursesData) {
    const created = await prisma.course.create({ data: c });
    courses.push(created);
  }

  // 6. Tạo Lớp học phần (Mỗi môn 2 lớp)
  console.log('creating classes...');
  const classes = [];
  for (const course of courses) {
    for (let j = 1; j <= 2; j++) {
      const cls = await prisma.class.create({
        data: {
          code: `${course.code} ${j}`,
          courseId: course.id,
          semester: 1,
          year: 2025,
          capacity: 40,
          enrolledCount: 0,
          schedule: [
            { day: 'T2', slots: [1, 2, 3], room: '301-G2' },
            { day: 'T4', slots: [7, 8], room: '201-G2' }
          ]
        }
      });
      classes.push(cls);
    }
  }

  // 7. Tạo Đăng ký & Điểm số (Mỗi SV đăng ký 3-5 môn)
  console.log('enrolling students...');
  for (const student of students) {
    // Chọn ngẫu nhiên 3 đến 5 lớp
    const shuffledClasses = classes.sort(() => 0.5 - Math.random());
    const selectedClasses = shuffledClasses.slice(0, Math.floor(Math.random() * 3) + 3);

    for (const cls of selectedClasses) {
      // 80% sinh viên đã có điểm, 20% chưa có điểm (đang học)
      const hasGrade = Math.random() > 0.2;
      let gradeData = {};
      
      if (hasGrade) {
        const g = randomGrade();
        gradeData = {
          midTerm: g.mid,
          finalExam: g.final,
          total10: g.total10,
          total4: parseFloat((g.total10 * 0.4).toFixed(1)), // Quy đổi sơ bộ
          letterGrade: g.letter
        };
      }

      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          classId: cls.id,
          status: 'ENROLLED',
          ...gradeData
        }
      });

      // Update sĩ số
      await prisma.class.update({
        where: { id: cls.id },
        data: { enrolledCount: { increment: 1 } }
      });
    }
  }

  // 8. Tạo Thông báo
  await prisma.announcement.createMany({
    data: [
      { title: 'Lịch nghỉ Tết Nguyên Đán 2025', content: 'Sinh viên nghỉ từ ngày 20/01 đến hết 05/02.', priority: 'high', audience: 'all' },
      { title: 'Đăng ký học bổng kỳ 1', content: 'Đã mở đơn đăng ký học bổng khuyến khích học tập.', priority: 'normal', audience: 'students' },
      { title: 'Bảo trì hệ thống đăng ký tín chỉ', content: 'Hệ thống sẽ bảo trì vào 12h đêm nay.', priority: 'low', audience: 'all' }
    ]
  });

  console.log('✅ Đã tạo dữ liệu mẫu thành công!');
  console.log('👉 Admin: admin@school.edu / 123');
  console.log('👉 Sinh viên: SV1001@school.edu / 123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });