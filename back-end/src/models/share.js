"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Share extends Model {
		static associate(models) {
			Share.belongsTo(models.User, { foreignKey: "userId" });
			Share.belongsTo(models.Post, { foreignKey: "postId" });
		}
	}
	Share.init(
		{
			userId: DataTypes.INTEGER,
			postId: DataTypes.INTEGER,
			content: DataTypes.TEXT,
			isDeleted: DataTypes.BOOLEAN,
		},
		{
			sequelize,
			modelName: "Share",
		}
	);
	return Share;
};
