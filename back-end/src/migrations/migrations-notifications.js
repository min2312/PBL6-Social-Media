"use strict";
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Notifications", {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			receiverId: {
				type: Sequelize.INTEGER,
				references: { model: "Users", key: "id" },
				onDelete: "CASCADE",
			},
			senderId: {
				type: Sequelize.INTEGER,
				references: { model: "Users", key: "id" },
				onDelete: "CASCADE",
			},
			title: { type: Sequelize.STRING },
			content: { type: Sequelize.TEXT },
			url: { type: Sequelize.STRING },
			type: { type: Sequelize.STRING },
			isRead: { type: Sequelize.BOOLEAN, defaultValue: false },
			createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("Notifications");
	},
};
