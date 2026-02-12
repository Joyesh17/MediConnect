module.exports = (sequelize, DataTypes) => {
  const LabRequest = sequelize.define('LabRequest', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    status: { 
      type: DataTypes.ENUM('suggested', 'accepted', 'rejected', 'completed'), 
      defaultValue: 'suggested' 
    },
    result: {
      type: DataTypes.TEXT
    }, // Nurse uploads text result here
    doctorNote: {
      type: DataTypes.STRING
    }, // Note from doctor
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