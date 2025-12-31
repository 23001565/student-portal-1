// import {
//   getStudentProfile,
//   // createStudent,
//   updateStudentProfile,
//   // deleteStudent, 
//   // getAllStudents,
//   // findStudentsByName,
//   getStudentEnrollments,
//   getStudentSchedule
// } from '../services/studentService.js';

// //  getStudentProfile
// export async function profile(req, res) {
//   try {
//     const studentId = req.user.id;

//     const student = await getStudentProfile(studentId);

//     if (!student) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     res.json(student);
//   } catch (err) {
//     console.error('Student profile error:', err);
//     res.status(500).json({ error: 'Failed to fetch profile' });
//   }
// }

// //updateStudentProfile
// export async function updateProfile(req, res) {
//   try {
//     const studentId = req.user.id;
//     const data = req.body;

//     const updated = await updateStudentProfile(studentId, data);

//     res.json(updated);
//   } catch (err) {
//     console.error('Update student profile error:', err);
//     res.status(500).json({ error: 'Failed to update profile' });
//   }
// }

// // getStudentEnrollments
// export async function myEnrollments(req, res) {
//   try {
//     const studentId = req.user.id;

//     const enrollments = await getStudentEnrollments(studentId);

//     res.json(enrollments);
//   } catch (err) {
//     console.error('Get enrollments error:', err);
//     res.status(500).json({ error: 'Failed to fetch enrollments' });
//   }
// }

// //getStudentSchedule
// export async function mySchedule(req, res) {
//   try {
//     const studentId = req.user.id;
//     const { semester, year } = req.query;

//     const schedule = await getStudentSchedule(
//       studentId,
//       Number(semester),
//       Number(year)
//     );

//     res.json(schedule);
//   } catch (err) {
//     console.error('Get schedule error:', err);
//     res.status(500).json({ error: 'Failed to fetch schedule' });
//   }
// }
const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');


const validateStudentPassword = (password) => {
    // Define your password criteria
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/;

    if (!password.match(passwordRegex)) {
        return false; // Password does not meet the criteria
    }

    return true; // Password is valid
};


const studentRegister = async (req, res) => {
    try {
        // Check if the email already exists
        // const existingStudentByEmail = await Student.findOne({
        //     email: req.body.email,
        // });

        // if (existingStudentByEmail) {
        //     return res.status(400).json({ message: 'Email already exists' });
        // }

        // Validate the student's password
        const isPasswordValid = validateStudentPassword(req.body.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Password does not meet the criteria.' });
        }


        // if (req.body.password !== req.body.retypepassword) {
        //     return res.status(400).json({ message: 'Passwords do not match' });
        // }
        

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        // Check if the student already exists based on roll number and class
        const existingStudent = await Student.findOne({
            rollNum: req.body.rollNum,
            school: req.body.adminID,
            sclassName: req.body.sclassName,
        });

        if (existingStudent) {
            return res.status(400).json({ message: 'Roll Number already exists' });
        } else {
            const student = new Student({
                name: req.body.name,
                rollNum: req.body.rollNum,
                password: hashedPass,
                sclassName: req.body.sclassName,
                school: req.body.adminID,
                role: "Student",
                attendance: []
            });

            let result = await student.save();

            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const studentLogIn = async (req, res) => {
    try {
        let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });
        if (student) {
            const validated = await bcrypt.compare(req.body.password, student.password);
            if (validated) {
                student = await student.populate("school", "schoolName")
                student = await student.populate("sclassName", "sclassName")
                student.password = undefined;
                student.examResult = undefined;
                student.attendance = undefined;
                res.send(student);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudents = async (req, res) => {
    try {
        let students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName")
            .populate("attendance.subName", "subName sessions");
        if (student) {
            student.password = undefined;
            res.send(student);
        }
        else {
            res.send({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id)
        res.send(result)
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

const updateStudent = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            req.body.password = await bcrypt.hash(req.body.password, salt)
        }
        let result = await Student.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })

        result.password = undefined;
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        const existingResult = student.examResult.find(
            (result) => result.subName.toString() === subName
        );

        if (existingResult) {
            existingResult.marksObtained = marksObtained;
        } else {
            student.examResult.push({ subName, marksObtained });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        const subject = await Subject.findById(subName);

        const existingAttendance = student.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString() &&
                a.subName.toString() === subName
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            // Check if the student has already attended the maximum number of sessions
            const attendedSessions = student.attendance.filter(
                (a) => a.subName.toString() === subName
            ).length;

            if (attendedSessions >= subject.sessions) {
                return res.send({ message: 'Maximum attendance limit reached' });
            }

            student.attendance.push({ date, status, subName });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;

    try {
        const result = await Student.updateMany(
            { 'attendance.subName': subName },
            { $pull: { attendance: { subName } } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    const schoolId = req.params.id

    try {
        const result = await Student.updateMany(
            { school: schoolId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subName = req.body.subId

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $pull: { attendance: { subName: subName } } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};


const removeStudentAttendance = async (req, res) => {
    const studentId = req.params.id;

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};


module.exports = {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,

    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
};
