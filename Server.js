import dotenv from "dotenv";
dotenv.config();  // Configure dotenv as early as possible

import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from 'body-parser';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

import initFirebaseAdmin from './config/firebase.js';  // Ensure this is imported early
initFirebaseAdmin();  // Initialize Firebase before other routes

// Set up server application
const app = express();
const server = http.createServer(app); // Create http server

const PORT = process.env.PORT || 3004;

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));

// Create uploads directory if it does not exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Import routes
import NotificationsRoute from './routes/notifications.js';
import favoriteRoutes from './routes/favorites.js';
import userRoute from "./routes/AuthRoute.js";
import Rides from "./routes/BookingRide.js";
import PaymentRoute from "./routes/PaymentRoute.js";
import ProfileRoute from "./routes/profileRoutes.js";

// Use routes
app.use("/auth", userRoute);
app.use("/bookride", Rides);
app.use('/payment', PaymentRoute);
app.use('/favorites', favoriteRoutes);
app.use('/profile', ProfileRoute);
app.use('/notifications', NotificationsRoute);

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).send('Server is running!');
});

// Run server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
