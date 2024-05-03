import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  nrcNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  vehicleInfo: {
    registrationNumber: { type: String, required: false },  // Not required initially
    licenseNumber: { type: String, required: false },       // Not required initially
    licenseExpirationDate: { type: Date, required: false }, // Not required initially
    brand: { type: String, required: false },               // Not required initially
    model: { type: String, required: false },               // Not required initially
    seats: { type: Number, required: false },               // Not required initially
    color: { type: String, required: false },               // Not required initially
    category: { type: String, required: false }             // Not required initially
  },
  location: {
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],  // Only 'Point' type for GeoJSON
    },
    coordinates: {
      type: [Number],
      required: false,  // Not required initially
      default: [0, 0]   // Default coordinates, can be updated later
    },
  },
  otp: {
    type: String,
    required: true,
  },
  driverStatus: {
    type: String,
    enum: ["available", "unavailable"],
    default: "available",
  },
  ratings: [
    {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});


driverSchema.index({ location: "2dsphere" });

export const DriverModel = mongoose.model('Driver', driverSchema);
