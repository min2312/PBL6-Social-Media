module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("Users", "isPremium", {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
		});
		await queryInterface.addColumn("Users", "premiumExpiresAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("Users", "isPremium");
		await queryInterface.removeColumn("Users", "premiumExpiresAt");
	},
};
