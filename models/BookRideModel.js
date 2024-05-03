import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
  },
  pickUpLocation: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  dropOffLocation: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  thirdStop: {
    latitude: Number, // Optional third stop latitude
    longitude: Number, // Optional third stop longitude
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  driverCancellationRequested: {
    type: Boolean,
    default: false,
  },
  userCancellationRequested: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  driverArrivedAtPickup: {
    type: Boolean,
    default: false,
  },
  driverArrivedAtDropoff: {
    type: Boolean,
    default: false,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
