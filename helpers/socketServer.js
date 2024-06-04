import { Server } from "socket.io";
import { DriverModel } from "../models/DriverModel.js";
import { NotificationModel } from "../models/Notifications.js";

const socketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Listen for driver available notifications
    socket.on("driverAvailable", async (data) => {
      const { userId, driverId } = data;

      // Notify the user
      const notification = new NotificationModel({
        userId,
        driverId,
        title: 'Driver Available',
        message: 'A driver is available for your ride.',
      });
      await notification.save();

      io.to(userId).emit("notification", notification);
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

export default socketServer;
