const {
  createRegistrationWindow,
  getActiveRegistrationWindow,
  getAllRegistrationWindows,
  updateRegistrationWindow,
  deleteRegistrationWindow,
} = require('../services/courseRegistration/registrationWindowService.js');

async function createWindow(req, res) {
  try {
    console.log('Creating registration window with data:', req.body);
    const window = await createRegistrationWindow(req.body);
    console.log('Created window:', window);
    res.status(201).json(window);
  } catch (error) {
    console.error('Error creating registration window:', error);
    res.status(400).json({ error: error.message });
  }
}

async function getActiveWindow(req, res) {
  try {
    const window = await getActiveRegistrationWindow();
    res.json(window);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAllWindows(req, res) {
  try {
    const windows = await getAllRegistrationWindows();
    res.json(windows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateWindow(req, res) {
  try {
    const { id } = req.params;
    const window = await updateRegistrationWindow(id, req.body);
    res.json(window);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteWindow(req, res) {
  try {
    const { id } = req.params;
    await deleteRegistrationWindow(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
module.exports = {
  createWindow,
  getActiveWindow,
  getAllWindows,
  updateWindow,
  deleteWindow,
};