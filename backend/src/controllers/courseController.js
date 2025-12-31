const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {
  createCourse,
  updateCourseByCode,
  archiveCourse,
  deleteCourseByCode,
  listCourses,
  uploadCoursesFromCSV,
} = require('../services/courseService');

function sendError(res, err) {
  const status = err.status || 500;
  const body = { message: err.message || 'Internal Server Error' };
  return res.status(status).json(body);
}

async function create(req, res) {
  try {
    const result = await createCourse(req.body);
    res.json(result);
  } catch (err) { sendError(res, err); }
}

async function update(req, res) {
  try {
    const { code } = req.params;
    const result = await updateCourseByCode(code, req.body);
    res.json(result);
  } catch (err) { sendError(res, err); }
}

async function archive(req, res) {
  try {
    const { code } = req.params;
    const result = await archiveCourse(code);
    res.json(result);
  } catch (err) { sendError(res, err); }
}

async function remove(req, res) {
  try {
    const { code } = req.params;
    const result = await deleteCourseByCode(code);
    res.json(result);
  } catch (err) { sendError(res, err); }
}

async function list(req, res) {
  try {
    const { code, majorId, curriculumCode, includeArchived } = req.query;
    const result = await listCourses({
      code,
      majorId: majorId !== undefined ? Number(majorId) : undefined,
      curriculumCode,
      includeArchived: includeArchived === '1' || includeArchived === 'true',
    });
    res.json(result);
  } catch (err) { sendError(res, err); }
}

async function uploadCSV(req, res) {
  try {
    const file = req.file;
    const mappingStr = req.body.mapping;
    const mapping = mappingStr ? JSON.parse(mappingStr) : {};
    const result = await uploadCoursesFromCSV(file?.buffer, mapping);
    res.json(result);
  } catch (err) { const status = err.status || 500; res.status(status).json({ message: err.message || 'Internal Server Error' }); }
}

module.exports = {
  create,
  update,
  archive,
  remove,
  list,
  uploadCSV,
  uploadMiddleware: upload.single('file'),
};
