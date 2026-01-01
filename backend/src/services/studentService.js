const prisma = require('../data/prisma');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;

function transform(student) {
  return {
    code: student.code,
    name: student.name,
    email: student.email,
    year: student.year,
    majorName: student.major.name,
    curriculumCode: student.curriculum.code,
    isActive: student.isActive,
  };
}

async function getByCode(code) {
  const student = await prisma.student.findUnique({
    where: { code },
    select: {
      code: true,
      email: true,
      name: true,
      year: true,
      major: true,
      curriculum: true,
      isActive: true,
      archivedAt: true,
    },
  });
  if (!student ) {
    return null;
  }
  if (student.archivedAt) {
    throw new Error('Student is archived');
  }
  return transform(student);
}

async function updateByCode(code, payload) {
  const { curriculumCode, ...rest } = payload;
  const data = { ...rest };

  if (!code) {
    throw new Error('Missing student code');
  }

  const existing = await prisma.student.findUnique({
    where: { code },
  });

  if (!existing) {
    throw new Error('Student not found');
  }

  if (curriculumCode) {
    const curriculum = await prisma.curriculum.findUnique({
      where: { code: curriculumCode },
      select: {
        id: true,
        majorId: true,
      },
    });

    if (!curriculum) {
      throw new Error('Invalid curriculumCode');
    }

    data.curriculum = {
      connect: { id: curriculum.id },
    };

    data.major = {
      connect: { id: curriculum.majorId },
    };
  }

  const student = await prisma.student.update({
    where: { code },
    data,
    select: {
      code: true,
      email: true,
      name: true,
      year: true,
      major: true,
      curriculum: true,
      isActive: true,
    },
  });

  return transform(student);
}



async function archiveByCode(code) {
  return prisma.student.update({
    where: { code },
    data: {
      archivedAt: new Date(),
      isActive: false,
    },
  });
}

async function removeByCode(code) {
  return prisma.student.delete({
    where: { code },
  });
}

async function create(payload) {
  const {
    curriculumCode,
    password,
    ...rest
  } = payload;

  // 1. Validate required fields
  const required = ['code', 'email', 'name', 'year', 'password'];
  for (const field of required) {
    if (!payload[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // 3. Resolve curriculum
  const curriculum = await prisma.curriculum.findUnique({
    where: { code: curriculumCode },
    select: { id: true, majorId: true },
  });

  if (!curriculum) {
    throw new Error('Invalid curriculumCode');
  }  

  // 4. Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 5. Create student
  const student = await prisma.student.create({
    data: {
      ...rest,
      password: hashedPassword,
      major: { connect: { id: curriculum.majorId } },
      curriculum: { connect: { id: curriculum.id } },
    },
    select: {
      code: true,
      email: true,
      name: true,
      year: true,
      major: true,
      curriculum: true,
    },
  });
  return transform(student);
}

async function filter({
  year,
  studentCode,
  majorName,
  curriculumCode,
}) {
  if (majorName && curriculumCode) {
    const curriculum = await prisma.curriculum.findFirst({
      where: { code: curriculumCode },
      select: { majorId: true },
    });

    if (!curriculum) {
      throw new Error('Invalid curriculumCode');
    }

    const major = await prisma.major.findUnique({
      where: { name: majorName },
      select: { id: true },
    });

    if (!major) {
      throw new Error('Invalid majorName');
    }

    if (curriculum.majorId !== major.id) {
      throw new Error('curriculumCode does not match majorName');
    }
  }

  const students = await prisma.student.findMany({
    where: {
      archivedAt: null,

      ...(year !== undefined && { year }),
      ...(studentCode !== undefined && { code: studentCode }),

      ...(majorName && {
        major: {
          name: majorName,
        },
      }),

      ...(curriculumCode && {
        curriculum: {
          code: curriculumCode,
        },
      }),
    },
    select: {
      id: true,
      code: true,
      email: true,
      name: true,
      year: true,
      major: true,
      curriculum: true,
      isActive: true,
    },
  });
  if (!students || students.length === 0) {
    return [];
  }
  return students.map(transform);
}


module.exports = {
  getByCode,
  updateByCode,
  archiveByCode,
  removeByCode,
  create,
  filter,
};
