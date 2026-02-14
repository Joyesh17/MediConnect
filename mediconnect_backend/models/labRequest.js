module.exports = (sequelize, DataTypes) => {
  const LabRequest = sequelize.define('LabRequest', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    status: { 
      // OPTIMAL: Explicit state machine for Lab Tests
      type: DataTypes.ENUM(
        'suggested',           // 1. Doctor requested it, waiting for patient
        'rejected_by_patient', // 2a. Patient refused the test
        'paid',                // 2b. Patient paid, hospital received money, waiting for Nurse
        'completed'            // 3. Nurse uploaded the result
      ), 
      defaultValue: 'suggested' 
    },
    result: {
      type: DataTypes.TEXT // Perfect: Keeps plenty of space for the Nurse's report
    }, 
    doctorNote: {
      type: DataTypes.TEXT // Upgraded from STRING so doctors aren't cut off at 255 characters
    }, 
    // Explicit Foreign Keys
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'appointments', key: 'id' },
      onDelete: 'CASCADE'
    },
    testId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'lab_tests', key: 'id' },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'lab_requests',
    timestamps: true
  });

  return LabRequest;
};