module.exports = (sequelize, DataTypes) => {
  const Prescription = sequelize.define('Prescription', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    diagnosis: {
      type: DataTypes.TEXT // Upgraded from STRING to hold massive amounts of medical notes
    },
    medications: {
      type: DataTypes.TEXT,
      allowNull: true // Changed to true: Doctor might only order lab tests initially
    }, 
    instructions: {
      type: DataTypes.TEXT
    },
    // Explicit Foreign Key linking to the appointment
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Ensures one prescription per appointment (Doctor edits this later)
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