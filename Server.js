// import dependencies
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from 'body-parser';
import http from 'http'; // Add http import

import connectDB from "./config/db.js";

import NotifcationsRoute from './routes/notifications.js';
import favoriteRoutes from './routes/favorites.js';
import userRoute from "./routes/AuthRoute.js";
import Rides from "./routes/BookingRide.js";
import PaymentRoute from "./routes/PaymentRoute.js";
import ProfileRoute from "./routes/profileRoutes.js";
import socketServer from "./helpers/socketServer.js";

// configure dotenv
dotenv.config();

// connect to database
connectDB();

// set up server application
const app = express();
const server = http.createServer(app); // Create http server

const PORT = 3004;

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
app.use('/payment', PaymentRoute);
app.use('/favorites', favoriteRoutes);
app.use('/profile', ProfileRoute);
app.use('/notifications', NotifcationsRoute);

app.head('/', (req, res) => {
    res.status(200).send();
});

app.get('/', (req, res) => {
    res.status(200).send('Server is running!');
});

// run server
server.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`)
});
