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
