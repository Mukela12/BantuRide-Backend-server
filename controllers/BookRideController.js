import Booking from "../models/BookRideModel.js";
import { DriverModel } from '../models/DriverModel.js';
import { userModel } from "../models/UserModel.js";
import { Notification } from "../models/Notification.js";
import socketServer from '../helpers/socketServer.js'; // Import the HTTP server instance

import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app); // Create an HTTP server instance
const io = new Server(socketServer(server));

// Controller to handle initial booking request
const PassengerBookingRequest = async (req, res) => {
  const { user, pickUpLatitude, pickUpLongitude, dropOffLatitude, dropOffLongitude, price, hasThirdStop, thirdStopLatitude, thirdStopLongitude } = req.body;

  if (!user || !pickUpLatitude || !pickUpLongitude || !dropOffLatitude || !dropOffLongitude) {
    return res.status(400).json({
      success: false,
      message: "User, pick-up, and drop-off locations are required.",
    });
  }

  const newBooking = new Booking({
    user,
    pickUpLocation: {
      latitude: pickUpLatitude,
      longitude: pickUpLongitude,
    },
    dropOffLocation: {
      latitude: dropOffLatitude,
      longitude: dropOffLongitude,
    },
    price,
    status: 'pending'
  });

  if (hasThirdStop && thirdStopLatitude && thirdStopLongitude) {
    newBooking.thirdStop = {
      latitude: thirdStopLatitude,
      longitude: thirdStopLongitude,
    };
  }

  try {
    await newBooking.save();

    // Emit event to notify user of successful booking
    io.emit('bookingRequestReceived', { user: newBooking.user });

    // Respond with the booking details immediately after saving
    return res.status(200).json({
      success: true,
      message: "Booking request received successfully!",
      booking: newBooking
    });

  } catch (error) {
    console.error("Error in booking a ride:", error);
    return res.status(500).json({
      success: false,
      message: "Error in booking a ride.",
      error: error.message || error,
    });
  }
};


/**
 * Finds available drivers within a specified radius from a given point.
 * 
 * @param {Array<number>} centerCoordinates - The longitude and latitude of the center point [longitude, latitude].
 * @param {number} radiusMiles - The radius in miles within which to find available drivers.
 * @returns {Promise<Array>} - A promise that resolves to an array of available drivers.
 */
async function findAvailableDriversWithinRadius(centerCoordinates, radiusMiles) {
  const radiusInMeters = radiusMiles * 1609.34; // Convert miles to meters

  try {
    const drivers = await DriverModel.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: centerCoordinates
          },
          $maxDistance: radiusInMeters
        }
      },
      driverStatus: "available"
    }).exec();

    return drivers;
  } catch (error) {
    console.error("Error finding available drivers within radius:", error);
    throw error;
  }
}



const searchDriversForBooking = async (req, res) => {
  const { bookingId } = req.body;
  
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found."
      });
    }
    await searchAndSendAvailableDrivers(booking, res);
  } catch (error) {
    console.error("Error in searching drivers for booking:", error);
    return res.status(500).json({
      success: false,
      message: "Error in processing your request.",
      error: error.message || error,
    });
  }
};

const searchAndSendAvailableDrivers = async (booking, res) => {
  let searchComplete = false;
  let intervalId = null;

  const tryFindDrivers = async () => {
    try {
      const drivers = await findAvailableDriversWithinRadius([booking.pickUpLocation.longitude, booking.pickUpLocation.latitude], 3);
      if (drivers && drivers.length > 0) {
        // Emit event with all available drivers and stop the search
        io.emit('driversAvailable', {
          bookingId: booking._id,
          drivers: drivers.map(driver => ({
            _id: driver._id,
            firstName: driver.firstName,
            lastName: driver.lastName,
            vehicleInfo: driver.vehicleInfo
          }))
        });

        // Notify user with the available drivers
        const notification = new Notification({
          userId: booking.user,
          title: 'Drivers Available',
          message: 'More drivers are available in your area.',
        });
        await notification.save();
        io.emit('notification', notification);

        // Respond to the HTTP request with the available drivers
        res.status(200).json({
          success: true,
          message: "Available drivers found.",
          drivers: drivers
        });

        clearInterval(intervalId);
        searchComplete = true; // Mark the search as complete
      }
    } catch (error) {
      console.error("Error searching for available drivers:", error);
      if (!searchComplete) {
        clearInterval(intervalId);
        io.emit('noDriversAvailable', { bookingId: booking._id });
        res.status(500).json({
          success: false,
          message: "Error searching for drivers.",
          error: error.message || error
        });
      }
    }
  };

  intervalId = setInterval(tryFindDrivers, 10000); // Search every 10 seconds

  // Set a timeout to stop searching after 1 minute
  setTimeout(() => {
    if (!searchComplete) {
      clearInterval(intervalId);
      io.emit('noDriversAvailable', { bookingId: booking._id });
      res.status(404).json({
        success: false,
        message: "No drivers found."
      });
    }
  }, 60000); // 1 minute
};

// Function to assign a selected driver to the booking
const assignDriverToBooking = async (req, res) => {
  const { bookingId, driverId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    const driver = await DriverModel.findById(driverId);

    if (!booking || !driver) {
      return res.status(404).json({
        success: false,
        message: "Booking or driver not found.",
      });
    }

    booking.driver = driver;
    booking.status = 'confirmed';
    await booking.save();

    // Set driver status to unavailable
    driver.driverStatus = 'unavailable';
    await driver.save();

    // Emit booking confirmation event to user and driver
    io.emit('bookingConfirmed', {
      bookingId: booking._id,
      driver: {
        _id: driver._id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        vehicleInfo: driver.vehicleInfo
      }
    });

    // Notify the user and the driver
    const userNotification = new Notification({
      userId: booking.user,
      driverId: driver._id,
      title: 'Booking Confirmed',
      message: 'Your booking has been confirmed with a driver.',
    });
    await userNotification.save();

    const driverNotification = new Notification({
      userId: booking.user,
      driverId: driver._id,
      title: 'Booking Assigned',
      message: 'A booking has been assigned to you.',
    });
    await driverNotification.save();

    io.emit('notification', userNotification);
    io.emit('notification', driverNotification);

    return res.status(200).json({
      success: true,
      message: "Driver selected and booking confirmed successfully!",
      booking: {
        _id: booking._id,
        user: booking.user,
        pickUpLocation: booking.pickUpLocation,
        dropOffLocation: booking.dropOffLocation,
        thirdStop: booking.thirdStop,
        price: booking.price,
        status: booking.status,
        driver: {
          _id: driver._id,
          firstName: driver.firstName,
          lastName: driver.lastName,
          vehicleInfo: driver.vehicleInfo
        }
      }
    });
  } catch (error) {
    console.error("Error in assigning driver to booking:", error);
    return res.status(500).json({
      success: false,
      message: "Error in assigning driver to booking.",
      error: error.message || error,
    });
  }
};



// Controller to handle cancellation of a ride by a user
const cancelBooking = async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Update booking status to "cancelled"
    booking.status = 'cancelled';
    await booking.save();

    // Set driver status to available if a driver is assigned
    if (booking.driver) {
      const driver = await DriverModel.findById(booking.driver);
      if (driver) {
        driver.driverStatus = 'available';
        await driver.save();
      }
    }

    // Emit cancellation event
    io.emit('bookingCancelled', { bookingId });

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
    });
  } catch (error) {
    console.error("Error in cancelling booking:", error);
    return res.status(500).json({
      success: false,
      message: "Error in cancelling booking.",
      error: error.message || error,
    });
  }
};

// Function to handle driver ride cancellation request
const requestDriverCancellation = async (req, res) => {
  const { bookingId, driverId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking || booking.driver !== driverId) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or driver not associated with the booking.",
      });
    }

    // Set driver cancellation request flag
    booking.driverCancellationRequested = true;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Driver's ride cancellation request sent successfully.",
    });
  } catch (error) {
    console.error("Error in requesting driver ride cancellation:", error);
    return res.status(500).json({
      success: false,
      message: "Error in requesting driver ride cancellation.",
      error: error.message || error,
    });
  }
};

// Listener for user acceptance of driver ride cancellation
io.on('connection', (socket) => {
  socket.on('acceptDriverCancellation', async (data) => {
    const { bookingId, driverId } = data;
    try {
      const booking = await Booking.findById(bookingId);

      if (booking && booking.driverCancellationRequested && booking.driver === driverId) {
        // Set driver to available
        const driver = await DriverModel.findById(driverId);
        if (driver) {
          driver.driverStatus = 'available';
          await driver.save();
        }

        // Remove driver from booking
        booking.driver = undefined;
        booking.driverCancellationRequested = false;
        booking.status = 'pending';
        await booking.save();

        // Begin search for a new driver
        await searchAndSendAvailableDrivers(booking, res);

        return res.status(200).json({
          success: true,
          message: "Driver's ride cancellation accepted. Booking set to pending.",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid request or driver's ride cancellation not requested.",
        });
      }
    } catch (error) {
      console.error("Error in accepting driver ride cancellation:", error);
      return res.status(500).json({
        success: false,
        message: "Error in accepting driver ride cancellation.",
        error: error.message || error,
      });
    }
  });
});


// Controller to handle driver arrival at pickup location
const driverAtPickupLocation = async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking || booking.status !== 'confirmed' || !booking.driver) {
      return res.status(404).json({
        success: false,
        message: "Invalid booking or booking not in confirmed status or no driver assigned.",
      });
    }

    // Update booking status to indicate driver arrival
    booking.driverArrivedAtPickup = true;
    await booking.save();

    // Emit event to notify user that driver has arrived at pickup location
    io.emit('driverArrivedAtPickup', { bookingId });

    return res.status(200).json({
      success: true,
      message: "Driver has arrived at pickup location.",
    });
  } catch (error) {
    console.error("Error in notifying driver arrival at pickup location:", error);
    return res.status(500).json({
      success: false,
      message: "Error in notifying driver arrival at pickup location.",
      error: error.message || error,
    });
  }
};


// Controller to handle starting the ride
const startRide = async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking || !booking.driverArrivedAtPickup) {
      return res.status(400).json({
        success: false,
        message: "You must arrive at the pickup location before starting the ride.",
      });
    }

    // Update booking status to indicate ride has started
    booking.status = 'ongoing';
    await booking.save();

    // Emit event to notify user that the ride has started
    io.emit('rideStarted', { bookingId });

    return res.status(200).json({
      success: true,
      message: "Ride has started.",
    });
  } catch (error) {
    console.error("Error in starting the ride:", error);
    return res.status(500).json({
      success: false,
      message: "Error in starting the ride.",
      error: error.message || error,
    });
  }
};

// Controller to handle ending the ride
const endRide = async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking || booking.status !== 'ongoing') {
      return res.status(400).json({
        success: false,
        message: "The ride is not ongoing or booking not found.",
      });
    }

    // Update booking status to indicate ride has ended
    booking.driverArrivedAtDropoff = true;
    booking.status = 'completed';
    await booking.save();

    // Emit event to notify user that the ride has ended
    io.emit('rideEnded', { bookingId });

    return res.status(200).json({
      success: true,
      message: "Ride has ended.",
    });
  } catch (error) {
    console.error("Error in ending the ride:", error);
    return res.status(500).json({
      success: false,
      message: "Error in ending the ride.",
      error: error.message || error,
    });
  }
};

const getDriverBooking = async (req, res) => {
   const { driverId } = req.body;

    try {
      const driver = await DriverModel.findById(driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found."
        });
      }
      const booking = await Booking.findById(driver.bookingid);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking Yet."
        });
      }
      return res.status(200).json({
        success: true,
        message: "Booking found.",
        booking: booking
      });
    } catch (error) {
      console.error("Error in getting driver booking:", error);
      return res.status(500).json({
        success: false,
        message: "Error in getting driver booking.",
        error: error.message || error,
      });
    }

};

const getDriverUser = async (req, res) => {

  const { driverId } = req.body;

  try {
    const driver = await DriverModel.findById(driverId);

    const booking = await Booking.findById(driver.bookingid);
    
    const user = await userModel.findById(booking.user);


    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }
    return res.status(200).json({
      success: true,
      message: "User found.",
      user: user
    });
  } catch (error) {
    console.error("Error in getting driver user:", error);
    return res.status(500).json({
      success: false,
      message: "Error in getting driver user.",
      error: error.message || error,
    });
  }

};

export { PassengerBookingRequest, cancelBooking, getDriverUser, getDriverBooking, requestDriverCancellation, driverAtPickupLocation, assignDriverToBooking, startRide, searchDriversForBooking, endRide };


