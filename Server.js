// import dependencies
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from 'body-parser';
import http from 'http'; // Add http import

import connectDB from "./config/db.js";

import userRoute from "./routes/AuthRoute.js";
import Rides from "./routes/BookingRide.js";
import socketServer from "./helpers/socketServer.js";

// configure dotenv
dotenv.config();

// connect to database
connectDB();

// set up server application
const app = express();
const server = http.createServer(app); // Create http server

const PORT = 3000;

// Set up Socket.IO server
socketServer(server);


// middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use("/auth", userRoute);
app.use("/bookride", Rides);

// Handle HEAD requests to root
app.head('/', (req, res) => {
    res.status(200).send();
});

// Root route to verify server is running
app.get('/', (req, res) => {
    res.status(200).send('Server is running!');
});


// run server
server.listen(PORT, () => { // Use server to listen instead of app
    console.log(`Server is running on port ${PORT}`)
});

