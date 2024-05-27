

## RideBooking API Documentation for Frontend Developers

This guide will walk you through how to use the API for booking rides using frameworks such as Flutter, React Native, or any other frontend framework. The RideBooking API allows users to book rides, cancel bookings, request driver cancellations, and manage ride statuses. 

### NOTE to ENOS
In the inital stages you have to save user ID when the user is signing to allow the user to make a request, also make sure to saving the bookingid (booking._id) after you receive a response from a successful booking request.

### NOTE TO GEORGE
Also you will have to manage the IDs throughout the app for now (bookingID (booking._id), userID (user._id), DriverID (driver._id))

### Base URL
The base URL for the RideBooking API is:

```
https://banturide.onrender.com/bookride
```

### Endpoints

#### 1. Booking a Ride
To book a ride, send a POST request to the `/book-request` endpoint with the necessary parameters such as user details, pickup location, drop-off location, etc.

**Endpoint:** `POST /book-request`

**Request Parameters:**
- `user` (string): User ID (save this when user is created as user._id)
- `pickUpLatitude` (number): Latitude of the pickup location
- `pickUpLongitude` (number): Longitude of the pickup location
- `dropOffLatitude` (number): Latitude of the drop-off location
- `dropOffLongitude` (number): Longitude of the drop-off location
- `price` (number): Ride price (optional)
- `hasThirdStop` (boolean): Indicates if there is a third stop (optional)
- `thirdStopLatitude` (number): Latitude of the third stop (optional)
- `thirdStopLongitude` (number): Longitude of the third stop (optional)

**Response:**
- `success` (boolean): Indicates success
- `message` (string): Success or error message
- `booking` (object): Booking object with all details

**MongoDB Model Changes:**
- `status`: Set to 'pending'
- `pickUpLocation`: Set with latitude and longitude
- `dropOffLocation`: Set with latitude and longitude
- `thirdStop`: Set with latitude and longitude if applicable



#### 2. Searching for Available Drivers
To search for available drivers, send a POST request to the `/search-driver` endpoint with the booking ID.

**Endpoint:** `POST /search-driver`

**Request Parameters:**
- `bookingId` (string): ID of the booking (you can get this from the response of the successful booking response as booking._id

**Response:**
- `success` (boolean): Indicates success
- `message` (string): Success or error message
- `drivers` (array): Array of available drivers

**Example Request (React Native):**
```
const response = await fetch('https://banturide.onrender.com/bookride/search-driver', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    bookingId: '123456', // This id should be retrived from the booking response when the booking request is successful (booking._id)
  }),
});

const responseData = await response.json();

```


#### 3. Selecting a Driver
To select a driver, send a POST request to the `/select-driver` endpoint with the booking ID and driver ID.

**Endpoint:** `POST /select-driver`

**Request Parameters:**
- `bookingId` (string): ID of the booking (booking._id)
- `driverId` (string): ID of the selected driver (driver._id)

**Response:**
- `success` (boolean): Indicates success
- `message` (string): Success or error message
- `booking` (object): Updated booking object

**MongoDB Model Changes:**
- `driver`: Set to the selected driver's details
- `status`: Set to 'confirmed'

**Driver Model Changes:**
- `driverStatus`: Set to 'unavailable'
- `bookingId`: Set to the booking ID

**Example Request (React Native):**

```
const response = await fetch('https://banturide.onrender.com/bookride/select-driver', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    bookingId: '123456',
    driverId: '789012',
  }),
});

const responseData = await response.json();

```

#### 4. Driver Arrival at Pickup Location
To indicate the driver's arrival at the pickup location, send a POST request to the `/driver-at-pickup-location` endpoint with the booking ID.

**Endpoint:** `POST /driver-at-pickup-location`

**Request Parameters:**
- `bookingId` (string): ID of the booking

**Response:**
- `success` (boolean): Indicates success
- `message` (string): Success or error message

**MongoDB Model Changes:**
- `driverArrivedAtPickup`: Set to `true`

**Example Request (Dart):**

```
final response = await http.post(
  'https://banturide.onrender.com/bookride/driver-at-pickup-location',
  body: {
    'bookingId': '123456',
  },
);

```

#### 5. Starting the Ride
To start the ride, send a POST request to the `/start-ride` endpoint with the booking ID.

**Endpoint:** `POST /start-ride`

**Request Parameters:**
- `bookingId` (string): ID of the booking

**Response:**
- `success` (boolean): Indicates success
- `message` (string): Success or error message

**MongoDB Model Changes:**
- `status`: Set to 'ongoing'

**Example Request (Dart):**

```
final response = await http.post(
  'https://banturide.onrender.com/bookride/start-ride',
  body: {
    'bookingId': '123456',
  },
);
```

#### 6. Ending the Ride
To end the ride, send a POST request to the `/end-ride` endpoint with the booking ID.

**Endpoint:** `POST /end-ride`

**Request Parameters:**
- `bookingId` (string): ID of the booking

**Response:**
- `success` (boolean): Indicates success
- `message` (string): Success or error message

**MongoDB Model Changes:**
- `driverArrivedAtDropoff`: Set to `true`
- `status`: Set to 'completed'

**Example Request (Dart):**
```
final response = await http.post(
  'https://banturide.onrender.com/bookride/end-ride',
  body: {
    'bookingId': '123456',
  },
);

```

#### 7. Canceling a Booking
To cancel a booking, send a POST request to the `/cancel-booking` endpoint with the booking ID.

**Endpoint:** `POST /cancel-booking`

**Request Parameters:**
- `bookingId` (string): ID of the booking

**Response:**
- `success` (boolean): Indicates success
- `message` (string): Success or error message

**MongoDB Model Changes:**
- `status`: Set to 'cancelled'

**Driver Model Changes (if applicable):**
- `driverStatus`: Set to 'available'

**Example Request (React Native):**
```
const response = await fetch('https://banturide.onrender.com/bookride/cancel-booking', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    bookingId: '123456',
  }),
});

const responseData = await response.json();
```


