// import { reserveSeat } from "../services/enrollmentService.js";
// import { validateCourseSelection } from "../services/validationService.js";
// import { getStudentClasses } from "../services/registrationService";

// export async function getRegistrationPage(req, res) {
//   const { studentId } = req.user;
//   const { curriculumId, term, year } = req.query;

//   const classes = await getStudentClasses(studentId, curriculumId, term, year);
//   res.json({ classes });
// }

// export async function saveEnrollment(req, res) {
//   const { courseId } = req.body;
//   const studentId = req.user.id;

//   const validation = await validateCourseSelection(studentId, { course_id: courseId });
//   if (!validation.valid) {
//     return res.status(400).json({ success: false, message: validation.message });
//   }

//   const seat = await reserveSeat(courseId);
//   if (!seat.success) {
//     return res.status(400).json({ success: false, message: seat.message });
//   }

//   // If both valid and reserved successfully → save enrollment in DB
//   await db.query(
//     "INSERT INTO enrollments (student_id, course_id, status) VALUES ($1, $2, 'submitted')",
//     [studentId, courseId]
//   );

//   res.status(200).json({ success: true });
// }


const Complain = require('../models/complainSchema.js');

// const complainCreate = async (req, res) => {
//     try {
//         const complain = new Complain(req.body)

//         const result = await complain.save()
//         res.send(result)
//     } catch (err) {
//         res.status(500).json(err);
//     }
// };

// const complainList = async (req, res) => {
//     try {
//         let complains = await Complain.find({ school: req.params.id }).populate("user", "name");
//         if (complains.length > 0) {
//             res.send(complains)
//         } else {
//             res.send({ message: "No complains found" });
//         }
//     } catch (err) {
//         res.status(500).json(err);
//     }
// };



const complainCreate = async (req, res) => {
    try {
        const { user, date, complaint, school, teacher } = req.body;

        const complain = new Complain({
            user,
            date,
            complaint,
            school,
            teacher, // Assign the teacher associated with the complaint
        });

        const result = await complain.save();
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json(err);
    }
};


// const complainList = async (req, res) => {
//     try {
//         const teacherId = req.params.teacherId; // You should pass the teacher's ID as a parameter
//         let complains = await Complain.find({ teacher: teacherId }).populate("user", "name");

//         if (complains.length > 0) {
//             res.send(complains);
//         } else {
//             res.send({ message: "No complains found for this teacher" });
//         }
//     } catch (err) {
//         res.status(500).json(err);
//     }
// };

// List complaints for a specific teacher
const complainList = async (req, res) => {
    try {
        const teacherId = req.params.teacherId; // You should pass the teacher's ID as a parameter
        let complains = await Complain.find({ teacher: teacherId }).populate("user", "name");

        if (complains.length > 0) {
            res.send(complains);
        } else {
            res.send({ message: "No complains found for this teacher" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// List all complaints for admins
const complainListForAdmin = async (req, res) => {
    try {
        // Fetch all complaints regardless of the teacher
        let complains = await Complain.find().populate("user", "name");

        if (complains.length > 0) {
            res.send(complains);
        } else {
            res.send({ message: "No complains found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { complainCreate, complainList , complainListForAdmin };


