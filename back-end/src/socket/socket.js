import { Server } from "socket.io";
import { handleUpdateTable } from "./apiSocket.js";
import { verifySocketToken } from "../middleware/JWT_Action.js";
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

		socket.on("updateTable", async (data) => {
			await handleUpdateTable(data);
		});

		socket.on("updateOrder", (data) => {
			io.emit("orderUpdated", data);
		});

		socket.on("sendOrder", (data) => {
			io.emit("receiveOrder", data);
		});

		socket.on("chefCountUpdated", (data) => {
			io.emit("chefCountUpdated", data);
		});
		socket.on("aiResults", (data) => {
			io.emit("aiResults", data);
		});
		// Add handler for order status updates
		socket.on("orderStatusUpdate", (data) => {
			io.emit("orderStatusUpdate", data);
		});

		// Add handler for dish cancellation
		socket.on("dishCancelled", (data) => {
			io.emit("dishCancelled", data);
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
