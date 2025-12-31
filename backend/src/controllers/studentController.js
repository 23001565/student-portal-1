const studentService = require('../services/studentService');

async function getProfile(req, res) {
  const { role, id } = req.user;

  // student → only own profile
  const studentCode = role === 'student' ? id : Number(req.params.code);

  const student = await studentService.getByCode(studentCode);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json(student);
}

async function updateProfile(req, res) {
  const { role, id } = req.user;
  const studentCode = role === 'student' ? id : Number(req.params.code);

  const student = await studentService.updateByCode(studentCode, req.body);
  res.json(student);
}

async function archive(req, res) {
  await studentService.archiveByCode(Number(req.params.code));
  res.status(204).end();
}

async function create(req, res) {
  const student = await studentService.create(req.body);
  res.status(201).json(student);
}

async function remove(req, res) {
  await studentService.removeByCode(Number(req.params.code));
  res.status(204).end();
}

async function list(req, res) {
  const students = await studentService.filter(req.query);
  res.json(students);
}

module.exports = {
  getProfile,
  updateProfile,
  archive,
  create,
  remove,
  list,
};
