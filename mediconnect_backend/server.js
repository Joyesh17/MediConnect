const express = require('express');
const cors = require('cors');
const db = require('./models');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const nurseRoutes = require('./routes/nurseRoutes');

// --- USE ROUTES ---
app.use('/api/auth', authRoutes); // This makes the URL: http://localhost:5000/api/auth/register
app.use('/api/admin', adminRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/nurse', nurseRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('MediConnect Backend is Running!');
});

// Sync Database & Start Server
db.sequelize.sync({ alter: true }).then(() => {
  console.log(">> Database Synced Successfully!");
  app.listen(PORT, () => console.log(`>> Server running on port ${PORT}`));
}).catch((err) => {
  console.error(">> Failed to sync database:", err);
});