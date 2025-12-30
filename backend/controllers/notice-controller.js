
// import { getStudentSchedule } from '../services/scheduleService.js';

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
