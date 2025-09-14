"use strict";
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Messages", {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			conversationId: {
				type: Sequelize.INTEGER,
				references: { model: "Conversations", key: "id" },
				onDelete: "CASCADE",
			},
			senderId: {
				type: Sequelize.INTEGER,
				references: { model: "Users", key: "id" },
				onDelete: "CASCADE",
			},
			content: { type: Sequelize.TEXT },
			imageUrl: { type: Sequelize.STRING },
			videoUrl: { type: Sequelize.STRING },
			isSeen: { type: Sequelize.BOOLEAN, defaultValue: false },
			seenAt: { type: Sequelize.DATE },
			deliveredAt: { type: Sequelize.DATE },
			createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("Messages");
	},
};
