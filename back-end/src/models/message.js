"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Message extends Model {
		static associate(models) {
			Message.belongsTo(models.Conversation, { foreignKey: "conversationId" });
			Message.belongsTo(models.User, { foreignKey: "senderId" });
		}
	}
	Message.init(
		{
			conversationId: DataTypes.INTEGER,
			senderId: DataTypes.INTEGER,
			content: DataTypes.TEXT,
			imageUrl: DataTypes.STRING,
			videoUrl: DataTypes.STRING,
			isSeen: DataTypes.BOOLEAN,
			seenAt: DataTypes.DATE,
			deliveredAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Message",
			timestamps: true,
			updatedAt: false,
		}
	);
	return Message;
};
