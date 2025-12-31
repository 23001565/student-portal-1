const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
  createClass,
  updateClass,
  archiveClass,
  deleteClass,
  listClasses,
  uploadClassesFromCSV,
} = require('../services/classService');

function sendError(res, err) {
  const status = err.status || 500;
  const body = { message: err.message || 'Internal Server Error' };
  return res.status(status).json(body);
}

async function create(req, res) {
  try {
    const result = await createClass(req.body);
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
}

async function update(req, res) {
  try {
    const { code, semester, year } = req.params;
    const result = await updateClass(
      code,
      Number(semester),
      Number(year),
      req.body,
    );
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
}

async function archive(req, res) {
  try {
    const { code, semester, year } = req.params;
    const result = await archiveClass(
      code,
      Number(semester),
      Number(year),
    );
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
}

async function remove(req, res) {
  try {
    const { code, semester, year } = req.params;
    const result = await deleteClass(
      code,
      Number(semester),
      Number(year),
    );
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
}

async function list(req, res) {
  try {
    const { courseCode, semester, year, includeArchived } = req.query;

    const result = await listClasses({
      courseCode,
      semester: semester !== undefined ? Number(semester) : undefined,
      year: year !== undefined ? Number(year) : undefined,
      includeArchived: includeArchived === '1' || includeArchived === 'true',
    });

    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
}

async function uploadCSV(req, res) {
  try {
    const file = req.file;
    const mappingStr = req.body.mapping;
    const mapping = mappingStr ? JSON.parse(mappingStr) : {};

    const result = await uploadClassesFromCSV(file?.buffer, mapping);
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
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
