import express from "express";
import {
  PassengerBookingRequest,
  cancelBooking,
  requestDriverCancellation,
  driverAtPickupLocation,
  startRide,
  endRide,
  searchDriversForBooking
} from "../controllers/BookRideController.js";

const router = express.Router();

router.post("/book-request", PassengerBookingRequest);

router.post("/cancel-booking", cancelBooking);

router.post("/search-driver",searchDriversForBooking);

router.post("/request-driver-cancellation", requestDriverCancellation);

router.post("/driver-at-pickup-location", driverAtPickupLocation);

router.post("/start-ride", startRide);

router.post("/end-ride", endRide);

export default router;
