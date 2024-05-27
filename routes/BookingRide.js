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
import { get } from "http";

const router = express.Router();


// user post routes
router.post("/book-request", PassengerBookingRequest);

router.post("/cancel-booking", cancelBooking);

router.post("/search-driver",searchDriversForBooking);

router.post("/select-driver", assignDriverToBooking);



// Driver get routes
router.get("/get-driver-booking", getDriverBooking);

router.get("/get-user-driver", getDriverUser);



// driver post routes

router.post("/request-driver-cancellation", requestDriverCancellation);

router.post("/driver-at-pickup-location", driverAtPickupLocation);

router.post("/start-ride", startRide);

router.post("/end-ride", endRide);

export default router;
