module.exports = (sequelize, DataTypes) => {
  const DoctorDetails = sequelize.define('DoctorDetails', {
    userId: { 
      type: DataTypes.INTEGER, 
      primaryKey: true,
      references: {
        model: 'users', // Matches the tableName in User.js
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    degree: { 
      type: DataTypes.STRING, 
      allowNull: false // Enforcing the degree requirement for the Doctor Card
    },
    specialization: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    consultationFee: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      defaultValue: 500 // Standard baseline fee, can be updated by the doctor later
    },
    bio: { 
      type: DataTypes.TEXT 
    },
    isAvailable: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    }
  }, {
    tableName: 'doctor_details',
    timestamps: true
  });

  return DoctorDetails;
};