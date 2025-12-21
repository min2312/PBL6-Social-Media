module.exports = (sequelize, DataTypes) => {
	const Payment = sequelize.define("Payment", {
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		postId: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		amount: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		paymentType: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		appTransId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: "pending",
		},
		duration: {
			type: DataTypes.INTEGER,
			allowNull: true,
			comment: "Duration in days",
		},
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
		updatedAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	});

	Payment.associate = (models) => {
		Payment.belongsTo(models.User, { foreignKey: "userId" });
		Payment.belongsTo(models.Post, { foreignKey: "postId" });
	};

	return Payment;
};
