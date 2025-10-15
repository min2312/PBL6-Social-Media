"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Post extends Model {
		static associate(models) {
			Post.belongsTo(models.User, { foreignKey: "userId" });
			Post.hasMany(models.Comment, { foreignKey: "postId" });
			Post.hasMany(models.Like, { foreignKey: "postId" });
			Post.hasMany(models.Share, { foreignKey: "postId" });
		}
	}
	Post.init(
		{
			userId: DataTypes.INTEGER,
			content: DataTypes.TEXT,
			imageUrl: DataTypes.TEXT,
			videoUrl: DataTypes.TEXT,
			scope: DataTypes.STRING,
			approvalStatus: DataTypes.STRING,
			isApproved: DataTypes.BOOLEAN,
			isDeleted: DataTypes.BOOLEAN,
			isSharedPost: DataTypes.BOOLEAN,
			originalPostId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "Post",
		}
	);
	return Post;
};
