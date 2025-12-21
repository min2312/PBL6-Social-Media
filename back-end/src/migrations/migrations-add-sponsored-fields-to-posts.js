module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("Posts", "isSponsored", {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		});
		await queryInterface.addColumn("Posts", "paymentStatus", {
			type: Sequelize.STRING,
			defaultValue: "pending",
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("Posts", "isSponsored");
		await queryInterface.removeColumn("Posts", "paymentStatus");
	},
};
