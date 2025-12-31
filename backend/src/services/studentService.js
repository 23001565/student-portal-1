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
    include: {
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
  if (!student || student.archivedAt) {
    return null;
  }
  return transform(student);
}

async function updateByCode(code, payload) {
  const {
    majorName,
    curriculumCode,
    ...rest
  } = payload;

  const data = { ...rest };

  if (majorName) {
    const major = await prisma.major.findUnique({
      where: { name: majorName },
      select: { id: true },
    });

    if (!major) {
      throw new Error('Invalid majorName');
    }

    data.majorId = major.id;
  }

  if (curriculumCode) {
    const curriculum = await prisma.curriculum.findUnique({
      where: { code: curriculumCode },
      select: { id: true },
    });

    if (!curriculum) {
      throw new Error('Invalid curriculumCode');
    }

    data.curriculumId = curriculum.id;
  }

  const student = await prisma.student.update({
    where: { code },
    data,
    include: {
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
    majorName,
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

  // 2. Resolve major
  const major = await prisma.major.findUnique({
    where: { name: majorName },
    select: { id: true },
  });

  if (!major) {
    throw new Error('Invalid majorCode');
  }

  // 3. Resolve curriculum
  const curriculum = await prisma.curriculum.findUnique({
    where: { code: curriculumCode },
    select: { id: true },
  });

  if (!curriculum) {
    throw new Error('Invalid curriculumCode');
  }

  // Optional consistency check
  if (curriculum.majorId !== major.id) {
    throw new Error('Curriculum does not belong to major');
  }

  // 4. Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 5. Create student
  const student = await prisma.student.create({
    data: {
      ...rest,
      password: hashedPassword,
      majorId: major.id,
      curriculumId: curriculum.id,
    },
    include: {
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
    include: {
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
