module.exports = (sequelize, DataTypes) => {
  const Prescription = sequelize.define('Prescription', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    medications: {
      type: DataTypes.TEXT,
      allowNull: false
    }, // Stores medicine details as a long string or JSON
    instructions: {
      type: DataTypes.TEXT
    },
    diagnosis: {
      type: DataTypes.STRING
    },
    // Explicit Foreign Key linking to the appointment
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Ensures one prescription per appointment
      references: {
        model: 'appointments',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'prescriptions',
    timestamps: true
  });

  return Prescription;
};