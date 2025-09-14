"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Notification extends Model {
		static associate(models) {
			Notification.belongsTo(models.User, { foreignKey: "receiverId" });
			Notification.belongsTo(models.User, { foreignKey: "senderId" });
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
		}
	);
	return Notification;
};
