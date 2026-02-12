const Sequelize = require('sequelize');
const config = require('../config/config.json');

// Connect to Database
const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    dialect: config.development.dialect,
    logging: false
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import Models
db.User = require('./user')(sequelize, Sequelize);
db.DoctorDetails = require('./doctorDetails')(sequelize, Sequelize);
db.NurseDetails = require('./nurseDetails')(sequelize, Sequelize);
db.LabTest = require('./labTest')(sequelize, Sequelize);
db.Appointment = require('./appointment')(sequelize, Sequelize);
db.LabRequest = require('./labRequest')(sequelize, Sequelize);
db.Prescription = require('./prescription')(sequelize, Sequelize);
db.Payment = require('./payment')(sequelize, Sequelize);

// --- RELATIONS (The Logic) ---

// 1. User Profiles
db.User.hasOne(db.DoctorDetails, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.DoctorDetails.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasOne(db.NurseDetails, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.NurseDetails.belongsTo(db.User, { foreignKey: 'userId' });

// 2. Appointments
db.User.hasMany(db.Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
db.Appointment.belongsTo(db.User, { foreignKey: 'patientId', as: 'patient' });

db.User.hasMany(db.Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
db.Appointment.belongsTo(db.User, { foreignKey: 'doctorId', as: 'doctor' });

db.User.hasMany(db.Appointment, { foreignKey: 'nurseId', as: 'nurseAppointments' });
db.Appointment.belongsTo(db.User, { foreignKey: 'nurseId', as: 'nurse' });

// 3. Lab Requests
db.Appointment.hasMany(db.LabRequest, { foreignKey: 'appointmentId' });
db.LabRequest.belongsTo(db.Appointment, { foreignKey: 'appointmentId' });

db.LabTest.hasMany(db.LabRequest, { foreignKey: 'testId' });
db.LabRequest.belongsTo(db.LabTest, { foreignKey: 'testId' });

// 4. Prescriptions
db.Appointment.hasOne(db.Prescription, { foreignKey: 'appointmentId' });
db.Prescription.belongsTo(db.Appointment, { foreignKey: 'appointmentId' });

// 5. Payments
db.User.hasMany(db.Payment, { foreignKey: 'patientId' });
db.Payment.belongsTo(db.User, { foreignKey: 'patientId' });

module.exports = db;