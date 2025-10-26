import { getStudentProfile } from '../services/studentService.js';

export async function profile(req, res) {
  try {
    const student = await getStudentProfile(req.user.id); // user id from auth middleware
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}
