import { Server } from "socket.io";
import { handleUpdateTable } from "./apiSocket.js";
import { verifySocketToken } from "../middleware/JWT_Action.js";
import { saveMessage } from "../service/socialService.js";
let io;

const initSocket = (server) => {
	io = new Server(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});

	console.log("Socket server initialized and listening for connections");

	io.use(verifySocketToken);

	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id, "User:", socket.user);

		// Join a room based on user ID
		if (socket.user && socket.user.id) {
			socket.join(socket.user.id.toString());
			console.log(
				`User ${socket.user.id} with socket ID ${socket.id} joined room ${socket.user.id}`
			);
		}

		socket.on("sendMessage", async ({ recipientId, message }) => {
			console.log(
				`Received message from ${socket.user.id} to ${recipientId}:`,
				message
			);
			await saveMessage(socket.user.id, recipientId, message);
			io.to(recipientId.toString()).emit("receiveMessage", {
				senderId: socket.user.id,
				...message,
			});
		});

		socket.on("updatePost", (updatedPost) => {
			io.emit("postUpdated", updatedPost);
		});

		socket.on("deletePost", (postToDelete) => {
			io.emit("postDeleted", postToDelete);
		});

		socket.on("sendFriendRequest", ({ data, toUserId, friendshipStatus }) => {
			io.emit("friendRequestReceived", { data, toUserId, friendshipStatus });
		});

		socket.on("notification", ({ userId }) => {
			io.emit("notificationReceived", { userId });
		});
		
		socket.on("joinRoom", (roomId) => {
      	socket.join(roomId);
      	console.log(`User joined room ${roomId}`);
    });

		socket.on("disconnect", (reason) => {
			console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
		});
	});
};

const getIO = () => {
	if (!io) throw new Error("Socket has not been initialized!");
	return io;
};

export { initSocket, getIO };
