module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Payments", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			userId: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			amount: {
				type: Sequelize.FLOAT,
				allowNull: false,
			},
			paymentType: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			status: {
				type: Sequelize.STRING,
				defaultValue: "pending",
			},
			createdAt: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Payments");
	},
};
