const express = require('express');
const cors = require('cors');
const db = require('./models');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Test Route
app.get('/', (req, res) => {
  res.send('MediConnect Backend is Running!');
});

// Sync Database & Start Server
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log(">> Database Synced Successfully!");
    app.listen(PORT, () => console.log(`>> Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error(">> Failed to sync database:", err);
  });