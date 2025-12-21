module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("Payments", "duration", {
			type: Sequelize.INTEGER,
			allowNull: true,
			comment: "Duration in days for premium or sponsored post",
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("Payments", "duration");
	},
};
