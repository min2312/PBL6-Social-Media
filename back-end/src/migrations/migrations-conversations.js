"use strict";
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Conversations", {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			userId1: {
				type: Sequelize.INTEGER,
				references: { model: "Users", key: "id" },
				onDelete: "CASCADE",
			},
			userId2: {
				type: Sequelize.INTEGER,
				references: { model: "Users", key: "id" },
				onDelete: "CASCADE",
			},
			createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("Conversations");
	},
};
