const { Nurse } = require('../models');

// Create a new nurse
exports.createNurse = async (req, res) => {
  try {
    const { name, email, phone, dob } = req.body;
    const newNurse = await Nurse.create({ name, email, phone, dob });
    res.status(201).json(newNurse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all nurses
exports.getAllNurses = async (req, res) => {
  try {
    const nurses = await Nurse.findAll();
    res.status(200).json(nurses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific nurse by ID
exports.getNurseById = async (req, res) => {
  try {
    const nurse = await Nurse.findByPk(req.params.id);
    if (!nurse) return res.status(404).json({ error: 'Nurse not found' });
    res.status(200).json(nurse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update nurse information
exports.updateNurse = async (req, res) => {
  try {
    const nurse = await Nurse.findByPk(req.params.id);
    if (!nurse) return res.status(404).json({ error: 'Nurse not found' });
    
    await nurse.update(req.body);
    res.status(200).json(nurse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a nurse
exports.deleteNurse = async (req, res) => {
  try {
    const nurse = await Nurse.findByPk(req.params.id);
    if (!nurse) return res.status(404).json({ error: 'Nurse not found' });
    
    await nurse.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};