"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Conversation extends Model {
		static associate(models) {
			Conversation.hasMany(models.Message, { foreignKey: "conversationId" });
		}
	}
	Conversation.init(
		{
			userId1: DataTypes.INTEGER,
			userId2: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "Conversation",
			// timestamps: false,
			updatedAt: false,
		}
	);
	return Conversation;
};
