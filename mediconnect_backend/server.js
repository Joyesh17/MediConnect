const express = require('express');
const cors = require('cors');
const db = require('./models');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// PORT Definition
const PORT = process.env.PORT || 5000;

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const nurseRoutes = require('./routes/nurseRoutes');
const userRoutes = require('./routes/userRoutes');

// --- USE ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/users', userRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('MediConnect Backend is Running!');
});

// --- DATABASE SYNC & SERVER START ---
console.log("Attempting DB Connection...");

// db.sequelize.sync({ alter: true }) will update your table structure 
// without deleting data whenever you change your models.
db.sequelize.authenticate()
  .then(() => {
    console.log('>> Connection to MySQL established successfully.');
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log(">> Database Synced Successfully!");
    app.listen(PORT, () => console.log(`>> Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error(">> Unable to connect to the database or sync:", err);
  });