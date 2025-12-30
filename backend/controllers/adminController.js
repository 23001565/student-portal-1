// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const csv = require('csv-parser');
// const { createClassesFromCSV } = require('../services/csvService.js');
// const streamifier = require('streamifier'); 
// //fs reads files from the filesystem(disk), when admin uploads files, it's usually in memory (RAM). streamifier helps convert buffer data (in memory) to a stream, so csv-parser can read it.

// const uploadClasses = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

//     const rows = [];
//     streamifier.createReadStream(req.file.buffer)
//       .pipe(csv())
//       .on('data', row => rows.push(row))
//       .on('end', async () => {
//         // Call service to insert rows efficiently
//         const {insertedCount, invalidRows} = await uploadClassesFromCSV(rows);
//         res.json({ 
//           message: 'Classes uploaded successfully', 
//           inserted: insertedCount,
//           invalidRows: invalidRows.length,
//           invalidData: invalidRows
//          });
//       });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// module.exports = { uploadClasses };


// //fetch enrollments for all students in a specific semester
// const enrollments = await prisma.enrollment.findMany({
//   where: {
//     studentId: studentId,
//     registrationWindow: {
//       semester: 1,
//       year: 2025
//     }
//   },
//   include: {
//     class: true
//   }
// });

// //when student enrolls in a class
// const cls = await prisma.class.findUnique({
//   where: { id: classId }
// });

// await prisma.enrollment.create({
//   data: {
//     studentId: studentId,
//     classId: classId,
//     registrationWindowId: cls.registrationWindowId, // assuming this field exists
//   }
// });

// import redis from '../data/redis.js';
// import { cacheRegistrationData } from '../services/registrationService.js';


// export const startRegistrationRound = async (req, res) => {
//   const { year, semester, startTime, endTime } = req.body;

//   // Save active round info to Redis
//   await redis.set('registration_round:active', JSON.stringify({
//     year, semester, startTime, endTime
//   }));

//   // Cache all relevant data
//   await cacheRegistrationData(year, semester);

//   return res.status(200).json({ message: 'Registration round started and cache preloaded.' });
// };



const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notice = require('../models/noticeSchema.js');
const Complain = require('../models/complainSchema.js');

// Password validation function
function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/;

    if (password.match(passwordRegex)) {
        return "strong";
    } else if (password.length < 8) {
        return "weak: Password should be at least 8 characters long";
    } else {
        return "medium";
    }
}

const adminRegister = async (req, res) => {
    try {
        // Validate password criteria on the server side
        const password = req.body.password;
        const isPasswordValid = validatePassword(password);

        // Check if the password is not valid
        if (isPasswordValid !== "strong") {
            return res.status(400).json({ message: 'Password does not meet the criteria.' });
        }

        // Check if the passwords match
        if (req.body.password !== req.body.retypedPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // If the password is valid and matches, proceed to save the admin
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const admin = new Admin({
            ...req.body,
            password: hashedPass
        });

        // Check for existing email and school name
        const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
        const existingSchool = await Admin.findOne({ schoolName: req.body.schoolName });

        if (existingAdminByEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        } else if (existingSchool) {
            return res.status(400).json({ message: 'School name already exists' });
        }

        // Save the admin
        let result = await admin.save();
        result.password = undefined;
        res.send(result);

    } catch (err) {
        res.status(500).json(err);
    }
};


const adminLogIn = async (req, res) => {
    if (req.body.email && req.body.password) {
        let admin = await Admin.findOne({ email: req.body.email });
        if (admin) {
            const validated = await bcrypt.compare(req.body.password, admin.password);
            if (validated) {
                admin.password = undefined;
                res.send(admin);
            } else {
                res.send({ message: 'Invalid password' });
            }
        } else {
            res.send({ message: 'User not found' });
        }
    } else {
        res.send({ message: 'Email and password are required' });
    }
};

