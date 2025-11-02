"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Notification extends Model {
		static associate(models) {
			Notification.belongsTo(models.User, { foreignKey: "receiverId", as: "receiver" });
			Notification.belongsTo(models.User, { foreignKey: "senderId", as: "sender" });
		}
	}
	Notification.init(
		{
			receiverId: DataTypes.INTEGER,
			senderId: DataTypes.INTEGER,
			title: DataTypes.STRING,
			content: DataTypes.TEXT,
			url: DataTypes.STRING,
			type: DataTypes.STRING,
			isRead: DataTypes.BOOLEAN,
		},
		{
			sequelize,
			modelName: "Notification",
			tableName: "Notifications",
			timestamps: true, // enable timestamps
			createdAt: "createdAt", // map to existing column
			updatedAt: false, // no updatedAt column
		}
	);
	return Notification;
};
