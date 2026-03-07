module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING
    }, // e.g., 'Consultation', 'LabTest'
    
    // NEW: Tracks exactly who gets the money ('doctor' or 'hospital')
    payee: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'hospital'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'completed'
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    
    // Explicit Foreign Key linking to the Patient (User)
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    
    // NEW: Explicit Foreign Key linking to the Appointment
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'appointments',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'payments',
    timestamps: true
  });

  return Payment;
};