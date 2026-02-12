module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING
    }, // e.g., 'Consultation', 'LabTest'
    status: {
      type: DataTypes.STRING,
      defaultValue: 'paid'
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });
  return Payment;
};
