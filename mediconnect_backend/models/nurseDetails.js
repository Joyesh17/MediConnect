module.exports = (sequelize, DataTypes) => {
  const NurseDetails = sequelize.define('NurseDetails', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'users', // References the tableName in User.js
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false // Making this required for proper hospital organization
    },
    salary: {
      type: DataTypes.FLOAT,
      defaultValue: 3000.00
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'nurse_details',
    timestamps: true
  });

  return NurseDetails;
};