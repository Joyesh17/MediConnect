const Sequelize = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// 1. Load the .env file for database credentials
dotenv.config({ path: path.join(__dirname, '../.env') });

// 2. Connect to Database using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 3. --- IMPORT MODELS (Exactly matching your filenames and cases) ---
db.User = require('./User')(sequelize, Sequelize);
db.DoctorDetails = require('./doctorDetails')(sequelize, Sequelize);
db.NurseDetails = require('./nurseDetails')(sequelize, Sequelize);
db.LabTest = require('./labTest')(sequelize, Sequelize);
db.Appointment = require('./appointment')(sequelize, Sequelize);
db.LabRequest = require('./labRequest')(sequelize, Sequelize);
db.Prescription = require('./prescription')(sequelize, Sequelize);
db.Payment = require('./payment')(sequelize, Sequelize);

// 4. --- RELATIONS (Preserving your full logic) ---

// User Profiles
db.User.hasOne(db.DoctorDetails, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.DoctorDetails.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasOne(db.NurseDetails, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.NurseDetails.belongsTo(db.User, { foreignKey: 'userId' });

// Appointments
// Patient Relation
db.User.hasMany(db.Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
db.Appointment.belongsTo(db.User, { foreignKey: 'patientId', as: 'patient' });

// Doctor Relation
db.User.hasMany(db.Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
db.Appointment.belongsTo(db.User, { foreignKey: 'doctorId', as: 'doctor' });

// Nurse Relation
db.User.hasMany(db.Appointment, { foreignKey: 'nurseId', as: 'nurseAppointments' });
db.Appointment.belongsTo(db.User, { foreignKey: 'nurseId', as: 'nurse' });

// Lab Requests
db.Appointment.hasMany(db.LabRequest, { foreignKey: 'appointmentId' });
db.LabRequest.belongsTo(db.Appointment, { foreignKey: 'appointmentId' });

db.LabTest.hasMany(db.LabRequest, { foreignKey: 'testId' });
db.LabRequest.belongsTo(db.LabTest, { foreignKey: 'testId' });

// Prescriptions
db.Appointment.hasOne(db.Prescription, { foreignKey: 'appointmentId' });
db.Prescription.belongsTo(db.Appointment, { foreignKey: 'appointmentId' });

// Payments
db.User.hasMany(db.Payment, { foreignKey: 'patientId' });
db.Payment.belongsTo(db.User, { foreignKey: 'patientId' });

module.exports = db;