// import prisma from '../data/prisma.js';

// /**
//  * POST /admin/classes/:id/cancel
//  * Hủy một lớp học
//  */
// export async function cancelClass(req, res) {
//   try {
//     const classId = Number(req.params.id);

//     const cls = await prisma.class.findUnique({
//       where: { id: classId }
//     });

//     if (!cls) {
//       return res.status(404).json({ error: 'Class not found' });
//     }

//     if (cls.canceledAt) {
//       return res.status(400).json({ error: 'Class already canceled' });
//     }

//     await prisma.$transaction(async (tx) => {
//       // 1. Cancel class
//       await tx.class.update({
//         where: { id: classId },
//         data: {
//           canceledAt: new Date()
//         }
//       });

//       // 2. Mark all enrollments as DROPPED
//       await tx.enrollment.updateMany({
//         where: {
//           classId,
//           status: 'ENROLLED'
//         },
//         data: {
//           status: 'DROPPED',
//           updatedAt: new Date()
//         }
//       });
//     });

//     res.json({ message: 'Class canceled successfully' });
//   } catch (err) {
//     console.error('Cancel class error:', err);
//     res.status(500).json({ error: 'Failed to cancel class' });
//   }
// }

// /**
//  * GET /classes
//  * Danh sách lớp đang mở theo học kỳ
//  * Query: ?semester=&year=
//  */
// export async function getActiveClasses(req, res) {
//   try {
//     const semester = Number(req.query.semester);
//     const year = Number(req.query.year);

//     const classes = await prisma.class.findMany({
//       where: {
//         semester,
//         year,
//         archivedAt: null,
//         canceledAt: null
//       },
//       include: {
//         course: true,
//         examSchedules: true,
//         _count: {
//           select: { enrollments: true }
//         }
//       }
//     });

//     res.json(classes);
//   } catch (err) {
//     console.error('Get classes error:', err);
//     res.status(500).json({ error: 'Failed to fetch classes' });
//   }
// }

// /**
//  * POST /admin/classes/archive
//  * Lưu trữ toàn bộ lớp theo học kỳ
//  * Body: { year, semester }
//  */
// export async function archiveClasses(req, res) {
//   try {
//     const { year, semester } = req.body;

//     await prisma.class.updateMany({
//       where: {
//         year,
//         semester,
//         archivedAt: null
//       },
//       data: {
//         archivedAt: new Date()
//       }
//     });

//     res.json({ message: 'Classes archived successfully' });
//   } catch (err) {
//     console.error('Archive classes error:', err);
//     res.status(500).json({ error: 'Failed to archive classes' });
//   }
// }


const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');

const sclassCreate = async (req, res) => {
    try {
        const sclass = new Sclass({
            sclassName: req.body.sclassName,
            school: req.body.adminID
        });

        const existingSclassByName = await Sclass.findOne({
            sclassName: req.body.sclassName,
            school: req.body.adminID
        });

        if (existingSclassByName) {
            res.send({ message: 'Sorry this class name already exists' });
        }
        else {
            const result = await sclass.save();
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const sclassList = async (req, res) => {
    try {
        let sclasses = await Sclass.find({ school: req.params.id })
        if (sclasses.length > 0) {
            res.send(sclasses)
        } else {
            res.send({ message: "No sclasses found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getSclassDetail = async (req, res) => {
    try {
        let sclass = await Sclass.findById(req.params.id);
        if (sclass) {
            sclass = await sclass.populate("school", "schoolName")
            res.send(sclass);
        }
        else {
            res.send({ message: "No class found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const getSclassStudents = async (req, res) => {
    try {
        let students = await Student.find({ sclassName: req.params.id })
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
}

const deleteSclass = async (req, res) => {
    try {
        const deletedClass = await Sclass.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.send({ message: "Class not found" });
        }
        const deletedStudents = await Student.deleteMany({ sclassName: req.params.id });
        const deletedSubjects = await Subject.deleteMany({ sclassName: req.params.id });
        const deletedTeachers = await Teacher.deleteMany({ teachSclass: req.params.id });
        res.send(deletedClass);
    } catch (error) {
        res.status(500).json(error);
    }
}
