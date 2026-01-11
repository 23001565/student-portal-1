// backend/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// --- 1. DỮ LIỆU TÊN GIẢ (REALISTIC) ---
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const DEM_NAM = ['Văn', 'Hữu', 'Đức', 'Thành', 'Minh', 'Hoàng', 'Thế', 'Quang', 'Tuấn', 'Mạnh', 'Gia', 'Bảo'];
const DEM_NU = ['Thị', 'Thu', 'Phương', 'Thanh', 'Hồng', 'Khánh', 'Mỹ', 'Ngọc', 'Mai', 'Lan', 'Diệu', 'Tú'];
const TEN_NAM = ['Hùng', 'Cường', 'Long', 'Hải', 'Phong', 'Tuấn', 'Dũng', 'Thịnh', 'Minh', 'Hiếu', 'Nam', 'Bắc', 'Sơn', 'Đạt', 'Kiên', 'Huy'];
const TEN_NU = ['Hoa', 'Lan', 'Huệ', 'Trang', 'Huyền', 'Linh', 'Hương', 'Hạnh', 'Thảo', 'Ly', 'Vân', 'Anh', 'Ngân', 'Nhung', 'Trâm', 'Vy'];

function generateName() {
  const isMale = Math.random() > 0.45;
  const ho = HO[Math.floor(Math.random() * HO.length)];
  const dem = isMale ? DEM_NAM[Math.floor(Math.random() * DEM_NAM.length)] : DEM_NU[Math.floor(Math.random() * DEM_NU.length)];
  const ten = isMale ? TEN_NAM[Math.floor(Math.random() * TEN_NAM.length)] : TEN_NU[Math.floor(Math.random() * TEN_NU.length)];
  return { fullName: `${ho} ${dem} ${ten}`, gender: isMale ? 'Nam' : 'Nữ' };
}

// --- 2. HÀM TẠO ĐIỂM SỐ ---
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

function generateScores(passed = true) {
  const min = passed ? 4.5 : 0;
  let mid = parseFloat((Math.random() * (10 - min) + min).toFixed(1));
  let final = parseFloat((Math.random() * (10 - min) + min).toFixed(1));
  
  if (mid > 8.0) final = Math.max(final, 7.0); // Giỏi thì giỏi đều
  
  const total10 = parseFloat((mid * 0.4 + final * 0.6).toFixed(1));
  const { letter, gpa4 } = convertGrade(total10);
  return { midTerm: mid, finalExam: final, total10, total4: gpa4, letterGrade: letter };
}

// --- 3. CẤU HÌNH NGÀNH & MÔN HỌC ---
const MAJORS_CONFIG = [
  { name: 'Công nghệ thông tin', short: 'CNTT' },
  { name: 'Quản trị kinh doanh', short: 'QTKD' },
  { name: 'Ngôn ngữ Anh', short: 'NNA' }
];

const COURSES_DATA = [
  // --- ĐẠI CƯƠNG (Dùng chung) ---
  { code: 'PHI1006', name: 'Triết học Mác - Lênin', credits: 3, level: 1, type: 'ALL' },
  { code: 'MAT1093', name: 'Đại số tuyến tính', credits: 3, level: 1, type: 'ALL' },
  { code: 'MAT1041', name: 'Giải tích 1', credits: 3, level: 1, type: 'ALL' },
  { code: 'ENG1001', name: 'Tiếng Anh cơ sở 1', credits: 4, level: 1, type: 'ALL' },

  // --- CNTT ---
  { code: 'INT2202', name: 'Lập trình nâng cao', credits: 3, level: 2, type: 'CNTT' },
  { code: 'INT2204', name: 'Lập trình hướng đối tượng', credits: 3, level: 2, type: 'CNTT' },
  { code: 'INT3110', name: 'Cơ sở dữ liệu', credits: 3, level: 2, type: 'CNTT' },
  { code: 'INT3306', name: 'Phát triển ứng dụng Web', credits: 3, level: 3, type: 'CNTT' },
  { code: 'INT3401', name: 'Trí tuệ nhân tạo', credits: 3, level: 3, type: 'CNTT' },
  { code: 'INT4003', name: 'Đồ án tốt nghiệp', credits: 10, level: 4, type: 'CNTT' },

  // --- QTKD ---
  { code: 'BUS2001', name: 'Nguyên lý Marketing', credits: 3, level: 2, type: 'QTKD' },
  { code: 'ECO2001', name: 'Kinh tế vi mô', credits: 3, level: 2, type: 'QTKD' },
  { code: 'BUS3005', name: 'Thương mại điện tử', credits: 3, level: 3, type: 'QTKD' },
  { code: 'BUS4009', name: 'Khóa luận tốt nghiệp', credits: 10, level: 4, type: 'QTKD' },

  // --- NNA ---
  { code: 'ENG2003', name: 'Văn hóa Anh - Mỹ', credits: 3, level: 2, type: 'NNA' },
  { code: 'ENG3001', name: 'Biên dịch nâng cao', credits: 3, level: 3, type: 'NNA' },
  { code: 'ENG4001', name: 'Tiếng Anh thương mại', credits: 3, level: 4, type: 'NNA' }
];

// --- 4. HÀM MAIN ---
async function main() {
  console.log('🚀 Bắt đầu khởi tạo dữ liệu...');

  // --- BƯỚC 1: CLEANUP ---
  try {
    await prisma.enrollment.deleteMany();
    await prisma.class.deleteMany();
    await prisma.course.deleteMany();
    await prisma.student.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.major.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.systemConfig.deleteMany();
    await prisma.announcement.deleteMany();
    console.log('🧹 Đã dọn dẹp DB.');
  } catch (e) { console.log('⚠️ DB sạch hoặc lỗi dọn dẹp:', e.message); }

  const passwordHash = bcrypt.hashSync('123', 10);

  // --- BƯỚC 2: TẠO ADMIN & MAJORS ---
  await prisma.admin.create({ data: { email: 'admin@school.edu', name: 'Phòng Đào Tạo', password: passwordHash } });

  // Tạo Majors (CHỈ CÓ NAME, KHÔNG CÓ CODE)
  const dbMajors = {};
  for (const m of MAJORS_CONFIG) {
    const created = await prisma.major.create({ 
      data: { name: m.name } // <-- Đã sửa: Không truyền m.short hay m.code vào đây
    });
    dbMajors[m.short] = created.id; // Map để dùng sau
  }

  // --- BƯỚC 3: TẠO KHÓA HỌC (Curriculum) ---
  const curriculums = [
    { name: 'K66', year: 4, start: 2021, prefix: '21' },
    { name: 'K67', year: 3, start: 2022, prefix: '22' },
    { name: 'K68', year: 2, start: 2023, prefix: '23' },
    { name: 'K69', year: 1, start: 2024, prefix: '24' }
  ];

  const dbCurriculums = {};
  for (const c of curriculums) {
    const created = await prisma.curriculum.create({ 
      data: { name: c.name, startYear: c.start, endYear: c.start + 4 } 
    });
    dbCurriculums[c.name] = created.id;
  }

  // --- BƯỚC 4: TẠO MÔN HỌC ---
  const dbCourses = [];
  for (const c of COURSES_DATA) {
    dbCourses.push(await prisma.course.create({ data: { 
      code: c.code, name: c.name, credits: c.credits 
    }}));
  }
  console.log(`📚 Đã tạo ${dbCourses.length} môn học.`);

  // --- BƯỚC 5: TẠO SINH VIÊN ---
  const studentsCache = []; 

  for (const m of MAJORS_CONFIG) {
    for (const cur of curriculums) {
      const numStudents = 5; // Mỗi ngành mỗi khóa 5 SV
      
      for (let i = 1; i <= numStudents; i++) {
        const { fullName, gender } = generateName();
        // Mã SV string: 21 + 02 + 001
        const majorCodeNum = m.short === 'CNTT' ? '02' : (m.short === 'QTKD' ? '05' : '08');
        const studentCode = `${cur.prefix}${majorCodeNum}${String(i).padStart(3, '0')}`;
        
        const st = await prisma.student.create({
          data: {
            code: studentCode,
            email: `${studentCode}@vnu.edu.vn`,
            name: fullName,
            password: passwordHash,
            year: 5 - cur.year, 
            className: `${m.short}-${cur.name}`,
            majorId: dbMajors[m.short],
            curriculumId: dbCurriculums[cur.name],
            dob: new Date(`${cur.start + 18}-01-01`),
            gender,
            address: 'Hà Nội',
            phone: '0988777666'
          }
        });

        studentsCache.push({
          id: st.id,
          majorShort: m.short,
          yearInSchool: cur.year, // 1, 2, 3, 4
          email: st.email
        });
      }
    }
  }
  console.log(`👥 Đã tạo ${studentsCache.length} hồ sơ sinh viên.`);

  // --- BƯỚC 6: GIẢ LẬP ĐIỂM QUÁ KHỨ ---
  console.log('⏳ Đang giả lập điểm quá khứ...');
  
  for (const st of studentsCache) {
    // Sinh viên năm X sẽ có điểm của các môn Level < X
    // Môn học phải thuộc ngành của SV hoặc môn chung (ALL)
    const passedCourses = COURSES_DATA.filter(c => 
      c.level < st.yearInSchool && (c.type === 'ALL' || c.type === st.majorShort)
    );

    for (const courseMeta of passedCourses) {
      const dbCourse = dbCourses.find(c => c.code === courseMeta.code);
      if (!dbCourse) continue;

      // Tính năm học của môn này trong quá khứ
      const pastYear = 2025 - (st.yearInSchool - courseMeta.level);
      
      // Tạo lớp học "đã đóng"
      // Sử dụng upsert hoặc create (để đơn giản create luôn vì code lớp duy nhất theo @@unique)
      // Code lớp: INT1001_2102_2023 (để tránh trùng)
      const pastClassCode = `${dbCourse.code}_OLD_${pastYear}`;
      
      // Tìm hoặc tạo lớp cũ
      let pastClass = await prisma.class.findFirst({ where: { code: pastClassCode } });
      if (!pastClass) {
          pastClass = await prisma.class.create({
            data: {
                code: pastClassCode,
                courseId: dbCourse.id,
                semester: 1,
                year: pastYear,
                capacity: 200,
                enrolledCount: 0,
                isRegistrationOpen: false,
                schedule: []
            }
          });
      }

      // Nhập điểm
      const scores = generateScores(true);
      await prisma.enrollment.create({
        data: {
          studentId: st.id,
          classId: pastClass.id,
          status: 'ENROLLED', // Enum schema của bạn là ENROLLED (ko có COMPLETED, dùng điểm để xác định)
          ...scores
        }
      });
    }
  }

  // --- BƯỚC 7: MỞ LỚP ĐĂNG KÝ (KỲ 2 - 2026) ---
  console.log('🔓 Đang mở lớp cho Kỳ 2 (Từ 1/1/2026)...');
  
  const currentSemester = 2;
  const currentYear = 2026;
  const rooms = ['301-G2', '405-G3', '201-E3', 'Online'];

  for (const dbCourse of dbCourses) {
    // Mỗi môn mở 2 lớp
    for (let i = 1; i <= 2; i++) {
      const day = Math.floor(Math.random() * 6) + 2; 
      const startSlot = Math.floor(Math.random() * 9) + 1;
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      
      await prisma.class.create({
        data: {
          code: `${dbCourse.code} ${i}`, // VD: INT2204 1
          courseId: dbCourse.id,
          semester: currentSemester,
          year: currentYear,
          capacity: 60,
          enrolledCount: 0,
          isRegistrationOpen: true, 
          schedule: [
            { day: `T${day}`, slots: [startSlot, startSlot+1, startSlot+2], room: room }
          ]
        }
      });
    }
  }

  // --- BƯỚC 8: SYSTEM CONFIG & THÔNG BÁO ---
  await prisma.systemConfig.create({
    data: {
      key: 'REGISTRATION_PERIOD',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-01-20'),
      isActive: true
    }
  });

  await prisma.announcement.createMany({
    data: [
      { title: 'Thông báo đăng ký học phần Kỳ 2 năm học 2025-2026', content: 'Hệ thống bắt đầu mở từ 1/1/2026...', priority: 'high', audience: 'all', postedAt: new Date() },
    ]
  });

  console.log('✅ SEEDING HOÀN TẤT!');
  console.log('------------------------------------------------');
  console.log('📌 Mật khẩu chung: 123');
  console.log('🎓 Admin: admin@school.edu');
  
  const demoCNTT = studentsCache.find(s => s.majorShort === 'CNTT' && s.yearInSchool === 4);
  const demoQTKD = studentsCache.find(s => s.majorShort === 'QTKD' && s.yearInSchool === 1);
  
  if (demoCNTT) console.log(`🧑‍💻 SV CNTT Năm 4 (Test xem điểm): ${demoCNTT.email}`);
  if (demoQTKD) console.log(`🧑‍💼 SV QTKD Năm 1 (Test đăng ký): ${demoQTKD.email}`);
  console.log('------------------------------------------------');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });