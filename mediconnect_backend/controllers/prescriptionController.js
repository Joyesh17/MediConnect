const { Prescription, Doctor, Patient, Appointment } = require('../models');

// Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const { medication, dosage, instructions, doctorId, patientId, appointmentId } = req.body;
    const newPrescription = await Prescription.create({
      medication,
      dosage,
      instructions,
      doctorId,
      patientId,
      appointmentId
    });
    res.status(201).json(newPrescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all prescriptions (including Doctor and Patient details)
exports.getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      include: [
        { model: Doctor, as: 'doctor' },
        { model: Patient, as: 'patient' }
      ]
    });
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id, {
      include: [
        { model: Doctor, as: 'doctor' },
        { model: Patient, as: 'patient' },
        { model: Appointment, as: 'appointment' }
      ]
    });
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.status(200).json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update prescription information
exports.updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id);
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    
    await prescription.update(req.body);
    res.status(200).json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a prescription
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id);
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    
    await prescription.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};