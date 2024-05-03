import { Server } from "socket.io";
import { DriverModel } from "../models/DriverModel.js";

const socketServer = (server) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Listen for changes in driver availability
    const driverChangeStream = DriverModel.watch();
    driverChangeStream.on("change", (change) => {
      if (change.operationType === "update") {
        const updatedDriver = change.fullDocument;
        if (updatedDriver.driverStatus === "available") {
          io.emit("driverAvailable", updatedDriver);
        }
      }
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log("A user disconnected");
      driverChangeStream.close();
    });
  });
};

export default socketServer;
