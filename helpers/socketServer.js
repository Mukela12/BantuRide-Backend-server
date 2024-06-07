// helpers/socketServer.js

import { Server } from "socket.io";

const socketServer = (server) => {
  const io = new Server(server);
  const users = {};

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Listen for a custom event to store the user ID with the socket ID
    socket.on("registerUser", (userId) => {
      users[userId] = socket.id;
      console.log(`User registered: ${userId}`);
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log("A user disconnected");
      for (const userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId];
          console.log(`User unregistered: ${userId}`);
          break;
        }
      }
    });
  });

  // Function to emit events to a specific user
  const emitToUser = (userId, event, data) => {
    const socketId = users[userId];
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  };

  return { io, emitToUser };
};

export default socketServer;
