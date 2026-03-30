// Import core dependencies
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Import database (Sequelize models)
const db = require('./models');

// Load environment variables from .env file
require('dotenv').config();

const app = express();

//  MIDDLEWARE 

// Enable CORS so frontend can communicate with backend
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Define server port (fallback to 5000 if not provided)
const PORT = process.env.PORT || 5000;

// ROUTES 

// Import all route handlers
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const nurseRoutes = require('./routes/nurseRoutes');
const userRoutes = require('./routes/userRoutes');

// Attach routes with base paths
app.use('/api/auth', authRoutes);     // Authentication (login/register)
app.use('/api/admin', adminRoutes);   // Admin actions
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/users', userRoutes);

// HEALTH CHECK

// Simple route to check if backend is alive
app.get('/api/health', (req, res) => {
  res.send('MediConnect Backend is Running!');
});

// FRONTEND HOSTING

// Path to React production build folder
const frontendBuildPath = path.join(__dirname, './build');

// Check if frontend build exists
if (fs.existsSync(frontendBuildPath)) {

  // Serve static files (JS, CSS, images)
  app.use(express.static(frontendBuildPath));

  // Handle all non-API routes (important for React Router)
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });

} else {
  // Warning if frontend is not built yet
  console.warn('Frontend build folder not found. Run "npm run build" in frontend.');
}

// -------------------- DATABASE + SERVER START --------------------

console.log("Attempting DB Connection...");

// Step 1: Try connecting to MySQL
db.sequelize.authenticate()

  .then(() => {
    console.log('>> Connection to MySQL established successfully.');

    // Step 2: Sync database (update tables without losing data)
    return db.sequelize.sync({ alter: true });
  })

  .then(() => {
    console.log(">> Database Synced Successfully!");

    // Step 3: Start server only after DB is ready
    app.listen(PORT, () => {
      console.log(`>> Server running on port ${PORT}`);
    });
  })

  .catch((err) => {
    // Catch connection or sync errors
    console.error(">> Unable to connect to the database or sync:", err);
  });
