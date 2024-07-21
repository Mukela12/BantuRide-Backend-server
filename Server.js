import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

import initFirebaseAdmin from './config/firebase.js';
import { authMiddleware } from './config/authMiddleware.js'; // Import auth middleware

const db = initFirebaseAdmin(); // Initialize Firebase

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));

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
app.use("/bookride", authMiddleware, Rides); // Use auth middleware for secured routes
app.use('/payment', authMiddleware, PaymentRoute);
app.use('/favorites', authMiddleware, favoriteRoutes);
app.use('/profile', authMiddleware, ProfileRoute);
app.use('/notifications', authMiddleware, NotificationsRoute);

app.get('/', (req, res) => {
    res.status(200).send('Server is running!');
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
