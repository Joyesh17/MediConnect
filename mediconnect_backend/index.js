const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./models');
const authRoutes = require('./routes/authRoutes'); // New Auth Routes
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const nurseRoutes = require('./routes/nurseRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const labResultRoutes = require('./routes/labResultRoutes');
const billRoutes = require('./routes/billRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // Login & Register
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/nurses', nurseRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/lab-results', labResultRoutes);
app.use('/api/bills', billRoutes);

// Simple Test Route
app.get('/', (req, res) => {
  res.json({ message: 'MediConnect Backend is running!' });
});

// Start Server and Connect to DB
const PORT = process.env.PORT || 5000;

db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to database:', err);
});