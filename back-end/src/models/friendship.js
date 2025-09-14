"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Friendship extends Model {
		static associate(models) {
			Friendship.belongsTo(models.User, { foreignKey: "userId" });
			Friendship.belongsTo(models.User, { foreignKey: "friendId" });
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
