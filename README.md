

## BantuRide API Documentation for Frontend Developers

This guide will walk you through how to use the API for booking rides on Flutter, React Native, or any other frontend framework. The BantuRide API allows users to book rides, cancel bookings, request driver cancellations, and manage ride statuses in real-time using Socket.IO.

### Base URL
The base URL for the BantuRide API is:
```
https://banturide.onrender.com/bookride
```

### Endpoints

#### 1. Booking a Ride
To book a ride, send a POST request to `/book-request` endpoint with the necessary parameters such as user details, pickup location, drop-off location, etc.

Example Request:
```dart
final response = await http.post(
  'https://banturide.onrender.com/bookride/book-request',
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
  'https://banturide.onrender.com/bookride/cancel-booking',
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
  'https://banturide.onrender.com/bookride/request-driver-cancellation',
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
  'https://banturide.onrender.com/bookride/driver-at-pickup-location',
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
  'https://banturide.onrender.com/bookride/start-ride',
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
  'https://banturide.onrender.com/bookride/end-ride',
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

