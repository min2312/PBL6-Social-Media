module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("Posts", "sponsoredExpiresAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("Posts", "sponsoredExpiresAt");
	},
};
