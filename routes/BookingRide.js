import express from "express";
import {
  PassengerBookingRequest,
  cancelBooking,
  requestDriverCancellation,
  driverAtPickupLocation,
  startRide,
  endRide,
  searchDriversForBooking,
  assignDriverToBooking,
  getDriverBooking,
  getDriverUser
} from "../controllers/BookRideController.js";
import { authMiddleware } from "../config/authMiddleware.js"; // Ensure auth middleware is imported

const router = express.Router();

// User post routes
router.post("/book-request", authMiddleware, PassengerBookingRequest);
router.post("/cancel-booking", authMiddleware, cancelBooking);
router.post("/search-driver", authMiddleware, searchDriversForBooking);
router.post("/select-driver", authMiddleware, assignDriverToBooking);

// Driver get routes
router.get("/get-driver-booking", authMiddleware, getDriverBooking);
router.get("/get-user-driver", authMiddleware, getDriverUser);

// Driver post routes
router.post("/request-driver-cancellation", authMiddleware, requestDriverCancellation);
router.post("/driver-at-pickup-location", authMiddleware, driverAtPickupLocation);
router.post("/start-ride", authMiddleware, startRide);
router.post("/end-ride", authMiddleware, endRide);

export default router;
