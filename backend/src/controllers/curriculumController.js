const multer = require('multer');
const {
  getCurriculumByCode,
  listCurricula,
  getStudentCurriculum,
  createCurriculum,
  updateCurriculumByCode,
  archiveCurriculum,
  deleteCurriculumByCode,
  cloneCurriculum,
} = require('../services/curriculumService');
const { list } = require('./studentController');

const uploadFieldsParser = multer().none();

function sendError(res, err) {
  const status = err.status || 500;
  const body = { message: err.message || 'Internal Server Error' };
  if (err.details) body.details = err.details;
  return res.status(status).json(body);
}

async function listCurriculaController(req, res) {
  try {
    console.log('listCurriculaController called with query:', req.query);
    const { majorName, startYear, endYear } = req.query;
    const curricula = await listCurricula({ majorName, startYear, endYear });
    console.log('Data returned from service:', curricula);
    res.json(curricula);
  } catch (err) {
    console.error('Error in listCurriculaController:', err);
    sendError(res, err);
  }
}

async function getStudentCurriculumController(req, res) {
  console.log('getStudentCurriculumController called with user:', req.user);
  const { role, id } = req.user;

  if (role !== 'student') {
    console.warn('Access denied: user is not a student. User:', req.user);
    return res.status(403).json({ message: 'Student access required' });
  }
  try {
    const curriculum = await getStudentCurriculum(id);
    if (!curriculum) {
      console.error('No curriculum found for student id:', id);
      return res.status(404).json({ message: 'No curriculum found for this student.' });
    }
    res.json(curriculum);
  } catch (err) {
    console.error('Error in getStudentCurriculumController:', err);
    sendError(res, err);
  }
}

async function uploadCurriculumController(req, res) {
  try {
    const payloadStr = req.body.payload || req.body.mapping || req.body.data || null;
    if (!payloadStr) {
      const err = new Error('payload is required'); err.status = 400; throw err;
    }
    let payload;
    try { payload = JSON.parse(payloadStr); } catch {
      const err = new Error('invalid payload'); err.status = 400; throw err;
    }
    const result = await createCurriculum(payload);
    res.json(result);
  } catch (err) { sendError(res, err); }
}

async function updateCurriculumController(req, res) {
  try {
    const { code } = req.params;
    const payloadStr = req.body.payload || req.body.data || null;
    if (!payloadStr) { const err = new Error('payload is required'); err.status = 400; throw err; }
    let payload; try { payload = JSON.parse(payloadStr); } catch { const err = new Error('invalid payload'); err.status = 400; throw err; }
    const result = await updateCurriculumByCode(code, payload);
    res.json(result);
  } catch (err) { sendError(res, err); }
}

async function archiveCurriculumController(req, res) {
  try {
    const { code } = req.params;
    const result = await archiveCurriculum(code);
    res.json(result);
  } catch (err) { sendError(res, err); }
}

async function deleteCurriculumController(req, res) {
  try {
    const { code } = req.params;
    const result = await deleteCurriculumByCode(code);
    res.json(result);
  } catch (err) { sendError(res, err); }
}

async function cloneCurriculumController(req, res) {
  try {
    const { fromCode, toCode, startYear, endYear, majorId } = req.body;
    const result = await cloneCurriculum({ fromCode, toCode, startYear, endYear, majorId });
    res.json(result);
  } catch (err) { sendError(res, err); }
}

async function getCurriculumByCodeController(req, res) {
  try {
    const { code } = req.params;
    const data = await require('../services/curriculumService').getCurriculumByCode(code);
    res.json(data);
  } catch (err) { sendError(res, err); }
}



module.exports = {
  uploadFieldsParser,
  uploadCurriculumController,
  updateCurriculumController,
  archiveCurriculumController,
  deleteCurriculumController,
  cloneCurriculumController,
  getCurriculumByCodeController,
  listCurriculaController,
  getStudentCurriculumController,
};
