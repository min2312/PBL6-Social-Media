"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
			User.hasMany(models.Post, { foreignKey: "userId" });
			User.hasMany(models.Comment, { foreignKey: "userId" });
			User.hasMany(models.Like, { foreignKey: "userId" });
			User.hasMany(models.Share, { foreignKey: "userId" });
			User.hasMany(models.Friendship, {
				foreignKey: "userId",
				as: "SentRequests", // người gửi lời mời
			});
			User.hasMany(models.Friendship, {
				foreignKey: "friendId",
				as: "ReceivedRequests", // người nhận lời mời
			});
			User.hasMany(models.Message, { foreignKey: "senderId" });
			User.hasMany(models.Notification, { foreignKey: "receiverId" });
		}
	}
	User.init(
		{
			fullName: DataTypes.STRING,
			email: DataTypes.STRING,
			passwordHash: DataTypes.STRING,
			profilePicture: DataTypes.STRING,
			bio: DataTypes.TEXT,
			trustScore: DataTypes.INTEGER,
			role: DataTypes.STRING,
			phone: DataTypes.STRING,
			lastActive: DataTypes.DATE,
			gender: DataTypes.STRING,
			status: DataTypes.STRING,
			blockedUntil: DataTypes.DATE,
			suspendedUntil: DataTypes.DATE,
			isPremium: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			premiumExpiresAt: {
				type: DataTypes.DATE,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: "User",
		}
	);
	return User;
};
