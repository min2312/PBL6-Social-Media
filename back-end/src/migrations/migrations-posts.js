"use strict";
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Posts", {
			id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
			userId: {
				type: Sequelize.INTEGER,
				references: { model: "Users", key: "id" },
				onDelete: "CASCADE",
			},
			content: { type: Sequelize.TEXT },
			imageUrl: { type: Sequelize.TEXT },
			videoUrl: { type: Sequelize.TEXT },
			scope: { type: Sequelize.STRING, defaultValue: "public" },
			approvalStatus: { type: Sequelize.STRING, defaultValue: "pending" },
			isApproved: { type: Sequelize.BOOLEAN, defaultValue: false },
			isDeleted: { type: Sequelize.BOOLEAN, defaultValue: false },
			isSharedPost: { type: Sequelize.BOOLEAN, defaultValue: false },
			originalPostId: { type: Sequelize.INTEGER },
			createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
			updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("Posts");
	},
};
