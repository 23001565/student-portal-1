// backend/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// --- BỘ DỮ LIỆU TÊN TIẾNG VIỆT ---
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const DEM_NAM = ['Văn', 'Hữu', 'Đức', 'Thành', 'Minh', 'Hoàng', 'Thế', 'Quang', 'Tuấn', 'Mạnh'];
const DEM_NU = ['Thị', 'Thu', 'Phương', 'Thanh', 'Hồng', 'Khánh', 'Mỹ', 'Ngọc', 'Mai'];
const TEN_NAM = ['Hùng', 'Cường', 'Long', 'Hải', 'Phong', 'Tuấn', 'Dũng', 'Thịnh', 'Minh', 'Hiếu', 'Nam', 'Bắc', 'Sơn', 'Đạt'];
const TEN_NU = ['Hoa', 'Lan', 'Huệ', 'Trang', 'Huyền', 'Linh', 'Hương', 'Hạnh', 'Thảo', 'Ly', 'Vân', 'Anh', 'Ngân', 'Nhung'];

function generateName() {
  const isMale = Math.random() > 0.4; // 60% Nam, 40% Nữ
  const ho = HO[Math.floor(Math.random() * HO.length)];
  const dem = isMale ? DEM_NAM[Math.floor(Math.random() * DEM_NAM.length)] : DEM_NU[Math.floor(Math.random() * DEM_NU.length)];
  const ten = isMale ? TEN_NAM[Math.floor(Math.random() * TEN_NAM.length)] : TEN_NU[Math.floor(Math.random() * TEN_NU.length)];
  return { fullName: `${ho} ${dem} ${ten}`, gender: isMale ? 'Nam' : 'Nữ' };
}

// --- HÀM QUY ĐỔI ĐIỂM (Quy chế tín chỉ) ---
function convertGrade(total10) {
  if (total10 >= 8.5) return { letter: 'A', gpa4: 4.0 };
  if (total10 >= 8.0) return { letter: 'B+', gpa4: 3.5 };
  if (total10 >= 7.0) return { letter: 'B', gpa4: 3.0 };
  if (total10 >= 6.5) return { letter: 'C+', gpa4: 2.5 };
  if (total10 >= 5.5) return { letter: 'C', gpa4: 2.0 };
  if (total10 >= 5.0) return { letter: 'D+', gpa4: 1.5 };
  if (total10 >= 4.0) return { letter: 'D', gpa4: 1.0 };
  return { letter: 'F', gpa4: 0.0 };
}

function generateScores(isComplete = true) {
  if (!isComplete) return {}; // Lớp đang học thì chưa có điểm

  // Random điểm thành phần (làm tròn 1 số thập phân)
  const bias = Math.random() * 3; 
  let mid = parseFloat((Math.random() * 5 + 4 + (bias > 2 ? 1 : 0)).toFixed(1)); 
  let final = parseFloat((Math.random() * 5 + 3 + (bias > 2 ? 1.5 : 0)).toFixed(1)); 

  if (mid > 10) mid = 10;
  if (final > 10) final = 10;

  const total10 = parseFloat((mid * 0.4 + final * 0.6).toFixed(1)); // 40% - 60%
  const { letter, gpa4 } = convertGrade(total10);

  return {
    midTerm: mid,
    finalExam: final,
    total10,
    total4: gpa4,
    letterGrade: letter
  };
}

// --- MAIN FUNCTION ---
async function main() {
  console.log('🚀 Bắt đầu khởi tạo dữ liệu mẫu (Fixed)...');

  // 1. Xóa dữ liệu cũ (Dùng tên biến chính xác để tránh lỗi)
  // Xóa theo thứ tự quan hệ khóa ngoại (Bảng con xóa trước)
  try {
    await prisma.announcement.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.class.deleteMany();
    await prisma.course.deleteMany();
    await prisma.student.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.major.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.systemConfig.deleteMany(); // Đã sửa tên đúng
    console.log('🧹 Đã xóa sạch dữ liệu cũ.');
  } catch (error) {
    console.error('⚠️ Lỗi dọn dẹp dữ liệu (có thể bỏ qua nếu DB trống):', error.message);
  }

  // 2. Tạo Admin
  const passwordHash = bcrypt.hashSync('123', 10);
  await prisma.admin.create({
    data: {
      email: 'admin@school.edu',
      name: 'Phòng Đào Tạo',
      password: passwordHash
    }
  });

  // 3. Tạo Ngành & Chương trình đào tạo
  const majorsList = [
    { name: 'Công nghệ thông tin', code: 'CNTT' },
    { name: 'Khoa học máy tính', code: 'KHMT' },
    { name: 'Kỹ thuật phần mềm', code: 'KTPM' },
    { name: 'Hệ thống thông tin', code: 'HTTT' }
  ];
  
  const dbMajors = [];
  for (const m of majorsList) {
    dbMajors.push(await prisma.major.create({ data: { name: m.name } }));
  }

  const curriculumsList = [
    { name: 'K66 (2021-2025)', startYear: 2021, endYear: 2025 },
    { name: 'K67 (2022-2026)', startYear: 2022, endYear: 2026 },
    { name: 'K68 (2023-2027)', startYear: 2023, endYear: 2027 },
    { name: 'K69 (2024-2028)', startYear: 2024, endYear: 2028 },
  ];
  const dbCurriculums = [];
  for (const c of curriculumsList) {
    dbCurriculums.push(await prisma.curriculum.create({ data: c }));
  }

  // 4. Tạo Sinh viên
  console.log('👥 Đang tạo hồ sơ sinh viên...');
  const students = [];
  
  for (let k = 0; k < dbCurriculums.length; k++) {
    const cur = dbCurriculums[k];
    const yearPrefix = (cur.startYear % 100); 
    
    for (let i = 1; i <= 25; i++) { 
      const { fullName, gender } = generateName();
      const major = dbMajors[Math.floor(Math.random() * dbMajors.length)];
      const studentCode = `${yearPrefix}02${String(i).padStart(3, '0')}`;
      
      const student = await prisma.student.create({
        data: {
          code: studentCode,
          email: `${studentCode}@vnu.edu.vn`, 
          name: fullName,
          password: passwordHash,
          year: k + 1, 
          // --- SỬA LỖI VIẾT HOA TÊN LỚP ---
          className: `${major.name.split(' ').map(w => w[0]).join('').toUpperCase()}-K${yearPrefix}`, 
          // --------------------------------
          majorId: major.id,
          curriculumId: cur.id,
          dob: new Date(`${cur.startYear - 18}-05-15`),
          gender: gender,
          address: 'Hà Nội',
          phone: `09${Math.floor(Math.random() * 100000000)}`
        }
      });
      students.push(student);
    }
  }

  // 5. Tạo Môn học
  console.log('📚 Đang tạo danh sách môn học...');
  const coursesData = [
    { code: 'MAT1093', name: 'Đại số tuyến tính', credits: 3 },
    { code: 'MAT1041', name: 'Giải tích 1', credits: 3 },
    { code: 'INT1050', name: 'Toán rời rạc', credits: 4 },
    { code: 'PHY1101', name: 'Vật lý đại cương 1', credits: 3 },
    { code: 'INT2202', name: 'Lập trình nâng cao', credits: 3 },
    { code: 'INT2204', name: 'Lập trình hướng đối tượng', credits: 3 },
    { code: 'INT2203', name: 'Cấu trúc dữ liệu và giải thuật', credits: 4 },
    { code: 'INT3306', name: 'Phát triển ứng dụng Web', credits: 3 },
    { code: 'INT3110', name: 'Cơ sở dữ liệu', credits: 3 },
    { code: 'INT3401', name: 'Trí tuệ nhân tạo', credits: 3 },
    { code: 'INT3202', name: 'Hệ quản trị cơ sở dữ liệu', credits: 3 },
    { code: 'INT3304', name: 'Kỹ thuật phần mềm', credits: 3 },
    { code: 'INT2215', name: 'Lập trình mạng', credits: 3 },
    { code: 'INT3404', name: 'Xử lý ảnh', credits: 3 },
    { code: 'PHI1006', name: 'Triết học Mác - Lênin', credits: 3 }
  ];

  const dbCourses = [];
  for (const c of coursesData) {
    dbCourses.push(await prisma.course.create({ data: c }));
  }

  // 6. Tạo Lớp học phần & Đăng ký
  console.log('🏫 Đang mở lớp và đăng ký tín chỉ...');
  const rooms = ['301-G2', '302-G2', '201-E3', '405-G3', '101-GĐ2', 'Online-Teams'];
  
  for (const course of dbCourses) {
    const numClasses = Math.floor(Math.random() * 2) + 2; 
    
    for (let c = 1; c <= numClasses; c++) {
      const day = Math.floor(Math.random() * 6) + 2; 
      const startSlot = Math.floor(Math.random() * 9) + 1; 
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      
      const newClass = await prisma.class.create({
        data: {
          code: `${course.code} ${c}`, 
          courseId: course.id,
          semester: 1, 
          year: 2024,
          capacity: 60,
          enrolledCount: 0,
          isRegistrationOpen: false, 
          schedule: [
            { day: `T${day}`, slots: [startSlot, startSlot + 1, startSlot + 2], room: room }
          ]
        }
      });

      const shuffledStudents = students.sort(() => 0.5 - Math.random());
      const classStudents = shuffledStudents.slice(0, Math.floor(Math.random() * 20) + 20);

      for (const st of classStudents) {
        const isGraded = ['INT3306', 'INT3110', 'MAT1093', 'INT2204'].includes(course.code);
        const scores = generateScores(isGraded);

        await prisma.enrollment.create({
          data: {
            studentId: st.id,
            classId: newClass.id,
            status: 'ENROLLED',
            ...scores
          }
        });
      }

      await prisma.class.update({
        where: { id: newClass.id },
        data: { enrolledCount: classStudents.length }
      });
    }
  }

  // 7. Tạo Thông báo
  console.log('📢 Đang tạo thông báo...');
  await prisma.announcement.createMany({
    data: [
      { 
        title: 'Thông báo về lịch nghỉ Tết Nguyên Đán Ất Tỵ 2025', 
        content: 'Căn cứ theo kế hoạch đào tạo năm học 2024-2025...', 
        priority: 'high', 
        audience: 'all',
        postedAt: new Date()
      },
      { 
        title: 'Kế hoạch đăng ký học phần bổ sung Học kỳ II', 
        content: 'Phòng Đào tạo thông báo mở cổng đăng ký bổ sung...', 
        priority: 'normal', 
        audience: 'students',
        postedAt: new Date(Date.now() - 86400000) 
      },
      { 
        title: 'Nhắc nhở nộp học phí Kỳ I năm học 2024-2025 (Đợt 2)', 
        content: 'Hiện tại vẫn còn một số sinh viên chưa hoàn thành...', 
        priority: 'high', 
        audience: 'students',
        postedAt: new Date(Date.now() - 172800000) 
      }
    ]
  });

  // 8. Cấu hình hệ thống (SỬA LỖI: Dùng upsert thay vì create)
  console.log('⚙️ Đang cấu hình hệ thống...');
  await prisma.systemConfig.upsert({
    where: { key: 'REGISTRATION_PERIOD' },
    update: {}, // Nếu tồn tại thì không làm gì
    create: {
      key: 'REGISTRATION_PERIOD',
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-02-20'),
      isActive: false
    }
  });

  console.log('✅ KHỞI TẠO DỮ LIỆU HOÀN TẤT!');
  console.log('------------------------------------------------');
  console.log('🔑 Tài khoản Admin: admin@school.edu / 123');
  console.log(`🔑 Tài khoản Sinh viên (mẫu): ${students[0].email} / 123`);
  console.log('------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });