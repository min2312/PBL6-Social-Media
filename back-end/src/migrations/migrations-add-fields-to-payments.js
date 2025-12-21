module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("Payments", "postId", {
			type: Sequelize.INTEGER,
			allowNull: true,
		});
		await queryInterface.addColumn("Payments", "appTransId", {
			type: Sequelize.STRING,
			allowNull: true,
		});
		// add updatedAt to align with Sequelize conventions
		const table = await queryInterface.describeTable("Payments");
		if (!table.updatedAt) {
			await queryInterface.addColumn("Payments", "updatedAt", {
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn("NOW"),
			});
		}
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn("Payments", "postId");
		await queryInterface.removeColumn("Payments", "appTransId");
		// updatedAt removal optional depending on initial schema
	},
};
