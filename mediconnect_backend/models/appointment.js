module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING
    },
    status: { 
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'), 
      defaultValue: 'pending' 
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'paid'),
      defaultValue: 'unpaid'
    },
    // Explicit Foreign Keys for clarity and database integrity
    patientId: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    doctorId: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    nurseId: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL', // If a nurse leaves, we keep the appointment record
      allowNull: true
    }
  }, {
    tableName: 'appointments',
    timestamps: true
  });

  return Appointment;
};