"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Friendship extends Model {
		static associate(models) {
			// người gửi
			Friendship.belongsTo(models.User, {
				foreignKey: "userId",
				as: "Sender",
			});
			// người nhận
			Friendship.belongsTo(models.User, {
				foreignKey: "friendId",
				as: "Receiver",
			});
		}
	}
	Friendship.init(
		{
			userId: DataTypes.INTEGER,
			friendId: DataTypes.INTEGER,
			status: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "Friendship",
		}
	);
	return Friendship;
};
