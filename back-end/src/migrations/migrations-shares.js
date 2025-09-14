"use strict";
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Shares", {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			userId: {
				type: Sequelize.INTEGER,
				references: { model: "Users", key: "id" },
				onDelete: "CASCADE",
			},
			postId: {
				type: Sequelize.INTEGER,
				references: { model: "Posts", key: "id" },
				onDelete: "CASCADE",
			},
			content: { type: Sequelize.TEXT },
			isDeleted: { type: Sequelize.BOOLEAN, defaultValue: false },
			createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("Shares");
	},
};
