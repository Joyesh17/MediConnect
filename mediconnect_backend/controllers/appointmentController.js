const { Appointment, Doctor, Patient, Nurse } = require('../models');

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { date, time, status, type, reason, doctorId, patientId, nurseId } = req.body;
    const newAppointment = await Appointment.create({
      date,
      time,
      status,
      type,
      reason,
      doctorId,
      patientId,
      nurseId
    });
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all appointments (including details of Doctor, Patient, and Nurse)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: Doctor, as: 'doctor' },
        { model: Patient, as: 'patient' },
        { model: Nurse, as: 'nurse' }
      ]
    });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
        include: [
            { model: Doctor, as: 'doctor' },
            { model: Patient, as: 'patient' },
            { model: Nurse, as: 'nurse' }
          ]
    });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update appointment information (e.g., change status or reschedule)
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    
    await appointment.update(req.body);
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    
    await appointment.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};