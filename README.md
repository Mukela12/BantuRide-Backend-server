# BantuRide Server

BantuRide is an e-hailing application designed to provide efficient and reliable ride-sharing services in Zambia, with a primary focus on the beautiful city of Livingstone.

## Overview

The BantuRide Server is the backend infrastructure that powers the core functionalities of the BantuRide application. It is built to handle user requests, manage ride bookings, and facilitate communication between drivers and passengers.

## Features

- **User Authentication**: Secure user authentication and authorization to ensure a safe and trustworthy environment for both drivers and passengers.

- **Booking Management**: Efficient booking system that allows users to request rides, view available drivers, and track the status of their bookings.

- **Real-time Communication**: Real-time updates between drivers and passengers to enhance the overall user experience and provide timely information on ride status.

- **Location Services**: Integration of geospatial features to calculate distances, estimate ride durations, and match drivers with nearby passengers.

- **Driver Confirmation**: Streamlined process for drivers to confirm ride requests, ensuring a quick and reliable response to passenger bookings.

- **Cancellation and Updates**: Capability for users to cancel bookings and receive real-time updates on the status of their rides.

## Technologies Used

- **Node.js**: JavaScript runtime for building scalable and performant server-side applications.

- **Express.js**: Web application framework for Node.js used to create robust and flexible APIs.

- **MongoDB**: NoSQL database for storing user, driver, and booking data.

- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.

- **Socket.io**: Real-time communication library for enabling bidirectional communication between clients and the server.


## Version 1 

** Simple Authentication **
1. register controller
2. VerifyOTP
3. LoginController
   
![Authentication](https://github.com/Mukela12/BantuRide-Server/assets/65640620/83a52e61-9b87-4844-9319-c355c1a4c114)




## BantuRide API Documentation for Frontend Developers

This guide will walk you through how to use the API for booking rides on Flutter, React Native, or any other frontend framework. The BantuRide API allows users to book rides, cancel bookings, request driver cancellations, and manage ride statuses in real-time using Socket.IO.

### Base URL
The base URL for the BantuRide API is:
```
https://banturide.onrender.com/api
```

### Endpoints

#### 1. Booking a Ride
To book a ride, send a POST request to `/book-request` endpoint with the necessary parameters such as user details, pickup location, drop-off location, etc.

Example Request:
```dart
final response = await http.post(
  'https://banturide.onrender.com/api/book-request',
  body: {
    'user': 'John Doe',
    'pickUpLatitude': '37.7749',
    'pickUpLongitude': '-122.4194',
    'dropOffLatitude': '37.7749',
    'dropOffLongitude': '-122.4194',
    'price': '20',
    'hasThirdStop': 'false',
  },
);
```

#### 2. Canceling a Booking
To cancel a booking, send a POST request to `/cancel-booking` endpoint with the booking ID.

Example Request:
```dart
final response = await http.post(
  'https://banturide.onrender.com/api/cancel-booking',
  body: {
    'bookingId': '123456',
  },
);
```

#### 3. Requesting Driver Cancellation
To request driver cancellation, send a POST request to `/request-driver-cancellation` endpoint with the booking ID and driver ID.

Example Request:
```dart
final response = await http.post(
  'https://banturide.onrender.com/api/request-driver-cancellation',
  body: {
    'bookingId': '123456',
    'driverId': '789012',
  },
);
```

#### 4. Driver Arrival at Pickup Location
To indicate driver arrival at the pickup location, send a POST request to `/driver-at-pickup-location` endpoint with the booking ID and driver ID.

Example Request:
```dart
final response = await http.post(
  'https://banturide.onrender.com/api/driver-at-pickup-location',
  body: {
    'bookingId': '123456',
    'driverId': '789012',
  },
);
```

#### 5. Starting the Ride
To start the ride, send a POST request to `/start-ride` endpoint with the booking ID and driver ID.

Example Request:
```dart
final response = await http.post(
  'https://banturide.onrender.com/api/start-ride',
  body: {
    'bookingId': '123456',
    'driverId': '789012',
  },
);
```

#### 6. Ending the Ride
To end the ride, send a POST request to `/end-ride` endpoint with the booking ID and driver ID.

Example Request:
```dart
final response = await http.post(
  'https://banturide.onrender.com/api/end-ride',
  body: {
    'bookingId': '123456',
    'driverId': '789012',
  },
);
```

### Real-Time Updates using Socket.IO
To receive real-time updates such as driver availability and ride status changes, you can integrate Socket.IO in your frontend application.

#### Flutter Example:
```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

// Connect to Socket.IO server
IO.Socket socket = IO.io('https://banturide.onrender.com', <String, dynamic>{
  'transports': ['websocket'],
});

// Listen for driver available event
socket.on('driverAvailable', (data) {
  print('Driver available: $data');
});

// Listen for booking confirmed event
socket.on('bookingConfirmed', (data) {
  print('Booking confirmed: $data');
});

// Listen for booking cancelled event
socket.on('bookingCancelled', (data) {
  print('Booking cancelled: $data');
});
```

#### React Native Example:
```javascript
import io from 'socket.io-client';

// Connect to Socket.IO server
const socket = io('https://banturide.onrender.com');

// Listen for driver available event
socket.on('driverAvailable', (data) => {
  console.log('Driver available:', data);
});

// Listen for booking confirmed event
socket.on('bookingConfirmed', (data) => {
  console.log('Booking confirmed:', data);
});

// Listen for booking cancelled event
socket.on('bookingCancelled', (data) => {
  console.log('Booking cancelled:', data);
});
```

