const { Bill, Patient, Appointment } = require('../models');

// Create a new bill
exports.createBill = async (req, res) => {
  try {
    const { amount, date, time, status, type, appointmentId, patientId } = req.body;
    const newBill = await Bill.create({
      amount,
      date,
      time,
      status,
      type,
      appointmentId,
      patientId
    });
    res.status(201).json(newBill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all bills (including Patient and Appointment details)
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.findAll({
      include: [
        { model: Patient, as: 'patient' },
        { model: Appointment, as: 'appointment' }
      ]
    });
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific bill by ID
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Appointment, as: 'appointment' }
      ]
    });
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.status(200).json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update bill information (e.g., mark as Paid)
exports.updateBill = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    
    await bill.update(req.body);
    res.status(200).json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a bill
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    
    await bill.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};