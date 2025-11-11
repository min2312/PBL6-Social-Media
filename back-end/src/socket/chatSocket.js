import { Server } from "socket.io";
import verifyscoketToken from "../middleware/JWT_Action.js";
let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  console.log("Socket server initialized and listening for connections");

  io.use(verifyscoketToken);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id, "User:", socket.user);

    socket.on("sendMessage", (updatedPost) => {
      io.emit("messageReceived", updatedPost);
    });
    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
    });
  });
}