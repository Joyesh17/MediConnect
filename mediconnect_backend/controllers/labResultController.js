const { LabResult, Patient, Appointment } = require('../models');

// Create a new lab result
exports.createLabResult = async (req, res) => {
  try {
    const { testName, result, date, patientId, appointmentId } = req.body;
    const newLabResult = await LabResult.create({
      testName,
      result,
      date,
      patientId,
      appointmentId
    });
    res.status(201).json(newLabResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all lab results (including Patient and Appointment details)
exports.getAllLabResults = async (req, res) => {
  try {
    const labResults = await LabResult.findAll({
      include: [
        { model: Patient, as: 'patient' },
        { model: Appointment, as: 'appointment' }
      ]
    });
    res.status(200).json(labResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific lab result by ID
exports.getLabResultById = async (req, res) => {
  try {
    const labResult = await LabResult.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Appointment, as: 'appointment' }
      ]
    });
    if (!labResult) return res.status(404).json({ error: 'Lab Result not found' });
    res.status(200).json(labResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update lab result
exports.updateLabResult = async (req, res) => {
  try {
    const labResult = await LabResult.findByPk(req.params.id);
    if (!labResult) return res.status(404).json({ error: 'Lab Result not found' });
    
    await labResult.update(req.body);
    res.status(200).json(labResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a lab result
exports.deleteLabResult = async (req, res) => {
  try {
    const labResult = await LabResult.findByPk(req.params.id);
    if (!labResult) return res.status(404).json({ error: 'Lab Result not found' });
    
    await labResult.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};