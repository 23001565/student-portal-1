const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const csv = require('csv-parser');
const { createClassesFromCSV } = require('../services/csvService');
const streamifier = require('streamifier'); 
//fs reads files from the filesystem(disk), when admin uploads files, it's usually in memory (RAM). streamifier helps convert buffer data (in memory) to a stream, so csv-parser can read it.

const uploadClasses = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const rows = [];
    streamifier.createReadStream(req.file.buffer)
      .pipe(csv())
      .on('data', row => rows.push(row))
      .on('end', async () => {
        // Call service to insert rows efficiently
        const {insertedCount, invalidRows} = await uploadClassesFromCSV(rows);
        res.json({ 
          message: 'Classes uploaded successfully', 
          inserted: insertedCount,
          invalidRows: invalidRows.length,
          invalidData: invalidRows
         });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { uploadClasses };


//fetch enrollments for all students in a specific semester
const enrollments = await prisma.enrollment.findMany({
  where: {
    studentId: studentId,
    registrationWindow: {
      semester: 1,
      year: 2025
    }
  },
  include: {
    class: true
  }
});

//when student enrolls in a class
const cls = await prisma.class.findUnique({
  where: { id: classId }
});

await prisma.enrollment.create({
  data: {
    studentId: studentId,
    classId: classId,
    registrationWindowId: cls.registrationWindowId, // assuming this field exists
  }
});


