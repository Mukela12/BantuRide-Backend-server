
### Documentation for React Native Developers: Interacting with Booking Functions

This documentation provides clear guidance on how to integrate the booking functionalities within a React Native application, specifically focusing on the `searchDriversForBooking` and `assignDriverToBooking` functions. Additionally, it explains how to manage Firebase Cloud Messaging (FCM) tokens which are crucial for receiving real-time updates about driver availability.

---

### 1. Setup and Configuration
Before integrating the backend functionalities, ensure that your React Native environment is configured to handle HTTP requests and Firebase notifications.

#### Installing Required Libraries:
- **Axios** for HTTP requests: `npm install axios`
- **React Native Firebase** for handling notifications: `npm install @react-native-firebase/app @react-native-firebase/messaging`

#### Configuration:
- Configure Firebase according to the [React Native Firebase Documentation](https://rnfirebase.io/).
- Ensure your backend URL is stored in an environment variable or directly in your code.

---

### 2. Obtaining the FCM Token
FCM tokens are used to identify the device to the Firebase backend, which allows it to send push notifications to the device.

#### Fetching the FCM Token:
```javascript
import messaging from '@react-native-firebase/messaging';

async function registerForPushNotificationsAsync() {
    await messaging().requestPermission();  // Request user permission
    const token = await messaging().getToken();  // Get the FCM token
    return token;
}
```

#### Handling Token Updates:
FCM tokens may need to be refreshed; handling token updates is crucial for maintaining reliable delivery of push notifications.
```javascript
function handleTokenRefresh() {
    messaging().onTokenRefresh(token => {
        // Update the token on the backend or handle appropriately
    });
}
```

---

### 3. Making Backend Requests
#### Search for Available Drivers:
This function is triggered when a user requests to find drivers. It handles real-time updates via Firebase.

```javascript
import axios from 'axios';

const searchDriversForBooking = async (bookingId) => {
    const fcmToken = await registerForPushNotificationsAsync();
    try {
        const response = await axios.post('https://your-backend.com/api/searchDrivers', {
            bookingId,
            userFCMToken: fcmToken,
        });
        console.log('Search initiated:', response.data);
    } catch (error) {
        console.error('Failed to search drivers:', error);
    }
};
```

#### Assign Driver to Booking:
Trigger this function when a user selects a driver from the list provided by the `searchDriversForBooking` function.

```javascript
const assignDriverToBooking = async (bookingId, driverId) => {
    try {
        const response = await axios.post('https://your-backend.com/api/assignDriver', {
            bookingId,
            driverId,
        });
        console.log('Driver assigned:', response.data);
        // Optionally stop listening for updates if needed
    } catch (error) {
        console.error('Failed to assign driver:', error);
    }
};
```

#### Implement Button in React Native:
When displaying driver information, include a button that, when pressed, triggers the `assignDriverToBooking` function.

```javascript
import { Button } from 'react-native';

const DriverItem = ({ driver, bookingId }) => (
    <Button
        title="Select Driver"
        onPress={() => assignDriverToBooking(bookingId, driver._id)}
    />
);
```

---

### 4. Real-time Updates Handling
Ensure that the frontend properly handles the real-time updates from Firebase for the best user experience. This might include updating the UI with new drivers as they become available or handling other status updates.

### Conclusion
This guide provides the essential steps needed for a React Native developer to integrate with the booking functionalities and manage FCM tokens for real-time updates. Adjust the implementation details based on specific project architecture and backend setup.


















## RideBooking API Documentation for Frontend Developers

This guide will walk you through how to use the API for booking rides using frameworks such as Flutter, React Native, or any other frontend framework. The RideBooking API allows users to book rides, cancel bookings, request driver cancellations, and manage ride statuses. 

### NOTE to ENOS
In the inital stages you have to save user ID when the user is signing to allow the user to make a request, also make sure to saving the bookingid (booking._id) after you receive a response from a successful booking request. (bookingID (booking._id), userID (user._id), DriverID (driver._id)).

### NOTE TO GEORGE
Also you will have to manage the IDs throughout the app ( DriverID (driver._id)). You will save the driverID when the driver signs in this id is going to be provided in the response.
The you can use ENDPONTS 8 AND 9 to retrive booking information and user information. You can decide how many times you want to call this end point to check if the driver has any new booking (endpoint 8 at the bottom of this page). 


Example of how the id's generated by mongoDB look like: 

<img width="1064" alt="Screenshot 2024-05-27 at 10 18 28" src="https://github.com/Mukela12/BantuRide-Backend-server/assets/65640620/e7f24ebd-dd47-47a2-a454-ed8ff664ecc9">






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

#### 8. Getting Driver Booking
To get the booking details associated with a driver, send a GET request to the `/get-driver-booking` endpoint with the driver ID.

**Endpoint:** `GET /get-driver-booking`

**Request Parameters:**
- `driverId` (string): ID of the driver

**Response:**
- `success` (boolean): Indicates success
- `message` (string): Success or error message
- `booking` (object): Booking object if found

**Example Request (Dart):**
```
final response = await http.get(
  'https://banturide.onrender.com/bookride/get-driver-booking',
  headers: {
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'driverId': '789012',
  }),
);

final responseData = jsonDecode(response.body);
```

#### 9. Getting User for Driver
To get the user details associated with a booking for a driver, send a GET request to the `/get-user-driver` endpoint with the driver ID.

**Endpoint:** `GET /get-user-driver`

**Request Parameters:**
- `driverId` (string): ID of the driver

**Response:**
- `success` (boolean): Indicates success
- `message` (string): Success or error message
- `user` (object): User object if found

**Example Request (Dart):**
```
final response = await http.get(
  'https://banturide.onrender.com/bookride/get-user-driver',
  headers: {
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'driverId': '789012',
  }),
);

final responseData = jsonDecode(response.body);
```







## Favorites, Notifications and profiles


### API Endpoints for Favorite Locations (USER)

#### Add a Favorite Location 

- **Endpoint:** `POST /favorites/add-favorites`
- **Description:** Add a new favorite location for the user.
- **Request Body (parameters):**
  - `userId` (String): User's unique identifier (ObjectId).
  - `type` (String): Type of location (`home`, `work`, `other`).
  - `address` (String): Physical address of the location.
  - `name` (String, optional): Custom name for the location.

#### Example Request in React Native:
```
import axios from 'axios';

const addFavoriteLocation = async (userId, type, address, name) => {
    try {
        const response = await axios.post('https://banturide.onrender.com/favorites/add-favorites', {
            userId,
            type,
            address,
            name
        });
        console.log('Favorite Location Added:', response.data);
    } catch (error) {
        console.error('Error adding favorite location:', error);
    }
};
```


#### Get Favorite Locations (USER)

- **Endpoint:** `GET /favorites/get-favorites`
- **Description:** Retrieve all favorite locations for the user.
- **Request Parameters:**
  - `userId` (String): User's unique identifier (ObjectId).

#### Example Request in React Native:
```
const getFavoriteLocations = async (userId) => {
    try {
        const response = await axios.get('https://banturide.onrender.com/favorites/get-favorites', {
            params: { userId }
        });
        console.log('Favorite Locations:', response.data);
    } catch (error) {
        console.error('Error fetching favorite locations:', error);
    }
};
```


#### Update a Favorite Location (USER)

- **Endpoint:** `PUT /favorites/update-favorites`
- **Description:** Update an existing favorite location.
- **Request Body:**
  - `userId` (String): ID of the location to update.
  - `address` (String, optional): New address.
  - `name` (String, optional): New name.

#### Example Request in React Native:
```
const updateFavoriteLocation = async (userId, address, name) => {
    try {
        const response = await axios.put('https://banturide.onrender.com/favorites/update-favorites', {
            userId,
            address,
            name
        });
        console.log('Favorite Location Updated:', response.data);
    } catch (error) {
        console.error('Error updating favorite location:', error);
    }
};
```

#### Delete a Favorite Location (USER)

- **Endpoint:** `DELETE /favorites/favorites`
- **Description:** Delete a favorite location.
- **Request Body:**
  - `userId` (String): ID of the location to delete.

#### Example Request in React Native:
```
const deleteFavoriteLocation = async (userId) => {
    try {
        const response = await axios.delete('https://banturide.onrender.com/favorites/favorites', {
            data: { userId }
        });
        console.log('Favorite Location Deleted:', response.data);
    } catch (error) {
        console.error('Error deleting favorite location:', error);
    }
};
```





## API Endpoints for Driver Profile

### Get Driver Information

- **Endpoint:** `GET /profile/:driverId`
- **Description:** Retrieve all information for a specific driver.
- **Request Parameters:**
  - `driverId` (String): Driver's unique identifier (ObjectId).

#### Example Request in Dart (Flutter):
```
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> getDriverInfo(String driverId) async {
  final url = 'https://banturide.onrender.com/profile/$driverId';
  try {
    final response = await http.get(Uri.parse(url));
    if (response.statusCode == 200) {
      final driverInfo = json.decode(response.body);
      print('Driver Information: $driverInfo');
    } else {
      print('Error fetching driver information: ${response.body}');
    }
  } catch (error) {
    print('Error fetching driver information: $error');
  }
}

```


### Edit Driver Profile

- **Endpoint:** `PUT /profile/edit/:driverId`
- **Description:** Edit the profile information of a specific driver.
- **Request Body:**
  - `firstName` (String): Driver's first name.
  - `lastName` (String): Driver's last name.
  - `dob` (String): Driver's date of birth.
  - `email` (String): Driver's email address.
  - `phoneNumber` (String): Driver's phone number.
  - `nrcNumber` (String): Driver's NRC number.
  - `address` (String): Driver's address.
  - `vehicleInfo` (String): Information about the driver's vehicle.

#### Example Request in Dart (Flutter):
```
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> editDriverProfile(String driverId, String firstName, String lastName, String dob, String email, String phoneNumber, String nrcNumber, String address, String vehicleInfo) async {
  final url = 'https://banturide.onrender.com/profile/edit/$driverId';
  try {
    final response = await http.put(
      Uri.parse(url),
      headers: {"Content-Type": "application/json"},
      body: json.encode({
        'firstName': firstName,
        'lastName': lastName,
        'dob': dob,
        'email': email,
        'phoneNumber': phoneNumber,
        'nrcNumber': nrcNumber,
        'address': address,
        'vehicleInfo': vehicleInfo,
      }),
    );
    if (response.statusCode == 200) {
      final updatedDriver = json.decode(response.body);
      print('Driver Profile Updated: $updatedDriver');
    } else {
      print('Error updating driver profile: ${response.body}');
    }
  } catch (error) {
    print('Error updating driver profile: $error');
  }
}
```

### Toggle Driver Availability

- **Endpoint:** `POST /profile/toggle-availability/:driverId`
- **Description:** Toggle the availability status of a driver.
- **Request Parameters:**
  - `driverId` (String): Driver's unique identifier (ObjectId).

#### Example Request in Dart (Flutter):
```
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> toggleDriverAvailability(String driverId) async {
  final url = 'https://banturide.onrender.com/profile/toggle-availability/$driverId';
  try {
    final response = await http.post(Uri.parse(url));
    if (response.statusCode == 200) {
      final updatedDriver = json.decode(response.body);
      print('Driver Availability Toggled: $updatedDriver');
    } else {
      print('Error toggling driver availability: ${response.body}');
    }
  } catch (error) {
    print('Error toggling driver availability: $error');
  }
}

```



# ENOS PROFILE USER ENDPOINTS


## Table of Contents

1. [Base URL](#base-url)
2. [Profile Endpoints](#profile-endpoints)
    1. [Get User Profile](#1-get-user-profile)
    2. [Edit User's Name](#2-edit-users-name)
    3. [Edit User's Email](#3-edit-users-email)
    4. [Upload Profile Picture](#4-upload-profile-picture)
    5. [Remove Profile Picture](#5-remove-profile-picture)
    6. [Toggle Notifications](#6-toggle-notifications)
    7. [Toggle Driver Should Call](#7-toggle-driver-should-call)
    8. [Get Ride History](#8-get-ride-history)
    9. [File a Complaint](#9-file-a-complaint)
    10. [Handle Referrals](#10-handle-referrals)

## Base URL

The base URL for the BantuRide API is:
```
https://banturide.onrender.com
```

## Profile Endpoints

### 1. Get User Profile

To retrieve the user profile information.

**Endpoint:** `GET /profile/:userId`

**Request Parameters:**
- `userId` (string): ID of the user

**Example Request (React Native):**
```javascript
const response = await fetch('https://banturide.onrender.com/profile/{userId}', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});
const responseData = await response.json();
console.log(responseData);
```

### 2. Edit User's Name

To edit the user's first and last name.

**Endpoint:** `POST /profile/name/:userId`

**Request Parameters:**
- `userId` (string): ID of the user

**Request Body:**
- `firstname` (string): New first name
- `lastname` (string): New last name

**Example Request (React Native):**
```javascript
const response = await fetch('https://banturide.onrender.com/profile/name/{userId}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstname: 'John',
    lastname: 'Doe',
  }),
});
const responseData = await response.json();
console.log(responseData);
```

### 3. Edit User's Email

To edit the user's email address.

**Endpoint:** `POST /profile/email/:userId`

**Request Parameters:**
- `userId` (string): ID of the user

**Request Body:**
- `email` (string): New email address

**Example Request (React Native):**
```javascript
const response = await fetch('https://banturide.onrender.com/profile/email/{userId}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'newemail@example.com',
  }),
});
const responseData = await response.json();
console.log(responseData);
```

### 4. Upload Profile Picture

To upload a profile picture.

**Endpoint:** `POST /profile/upload/:userId`

**Request Parameters:**
- `userId` (string): ID of the user

**Request Body:**
- `image` (string): Base64 string of the image or image URL

**Example Request (React Native):**
```javascript
const response = await fetch('https://banturide.onrender.com/profile/upload/{userId}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image: 'data:image/jpeg;base64,...', // Base64 string of the image
  }),
});
const responseData = await response.json();
console.log(responseData);
```

### 5. Remove Profile Picture

To remove the profile picture.

**Endpoint:** `DELETE /profile/remove/:userId`

**Request Parameters:**
- `userId` (string): ID of the user

**Example Request (React Native):**
```javascript
const response = await fetch('https://banturide.onrender.com/profile/remove/{userId}', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
});
const responseData = await response.json();
console.log(responseData);
```

### 6. Toggle Notifications

To toggle notification settings for the user.

**Endpoint:** `POST /toggle-notifications/:userId/:value`

**Request Parameters:**
- `userId` (string): ID of the user
- `value` (boolean): `true` or `false` to enable or disable notifications

**Example Request (React Native):**
```javascript
const response = await fetch('https://banturide.onrender.com/toggle-notifications/{userId}/true', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});
const responseData = await response.json();
console.log(responseData);
```

### 7. Toggle Driver Should Call

To toggle whether the driver should call the user.

**Endpoint:** `POST /toggle-driver-should-call/:userId/:value`

**Request Parameters:**
- `userId` (string): ID of the user
- `value` (boolean): `true` or `false` to enable or disable driver call

**Example Request (React Native):**
```javascript
const response = await fetch('https://banturide.onrender.com/toggle-driver-should-call/{userId}/true', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});
const responseData = await response.json();
console.log(responseData);
```

### 8. Get Ride History

To get the ride history of the user.

**Endpoint:** `GET /ride-history/:userId`

**Request Parameters:**
- `userId` (string): ID of the user

**Example Request (React Native):**
```javascript
const response = await fetch('https://banturide.onrender.com/ride-history/{userId}', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});
const responseData = await response.json();
console.log(responseData);
```

### 9. File a Complaint

To file a complaint.

**Endpoint:** `POST /complaint/:userId`

**Request Parameters:**
- `userId` (string): ID of the user

**Request Body:**
- `complaintText` (string): Text of the complaint

**Example Request (React Native):**
```javascript
const response = await fetch('https://banturide.onrender.com/complaint/{userId}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    complaintText: 'Your complaint text here',
  }),
});
const responseData = await response.json();
console.log(responseData);
```

### 10. Handle Referrals

To handle referrals.

**Endpoint:** `POST /referral/:userId`

**Request Parameters:**
- `userId` (string): ID of the user

**Request Body:**
- `referralCode` (string): Referral code

**Example Request (React Native):**
```javascript
const response = await fetch('https://banturide.onrender.com/referral/{userId}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    referralCode: 'REF12345',
  }),
});
const responseData = await response.json();
console.log(responseData);
```

## Conclusion

This documentation provides a comprehensive guide on how to interact with the profile-related endpoints of the BantuRide backend server using React Native. For any further questions or support, please refer to our official documentation or contact our support team.
By following this documentation, frontend developers can effectively integrate the BantuRide API into their applications to manage user profiles seamlessly.



<<<<<<< HEAD
# Notifications API (USER AND DRIVER)

## API Base URL
`https://banturide.onrender.com`

## Notifications API

### Overview

This API allows users and drivers to manage their notifications. The endpoints support retrieving all notifications, unread notifications, read notifications, and marking notifications as read or unread.

### API Endpoints

#### Get All Notifications

- **Endpoint:** `GET /notifications/all`
- **Description:** Retrieve all notifications for a user or driver.
- **Request Parameters:**
  - `userId` (String, optional): User's unique identifier (ObjectId).
  - `driverId` (String, optional): Driver's unique identifier (ObjectId).

##### Example Request in React Native:
```
import axios from 'axios';

const getAllNotifications = async (userId) => {
    try {
        const response = await axios.get('https://banturide.onrender.com/notifications/all', {
            params: { userId }
        });
        console.log('All Notifications:', response.data);
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
};

```

##### Example Request in DART (flutter):


```
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> getAllNotifications(String driverId) async {
  final url = 'https://banturide.onrender.com/notifications/all?driverId=$driverId';
  try {
    final response = await http.get(Uri.parse(url));
    if (response.statusCode == 200) {
      final notifications = json.decode(response.body);
      print('All Notifications: $notifications');
    } else {
      print('Error fetching notifications: ${response.body}');
    }
  } catch (error) {
    print('Error fetching notifications: $error');
  }
}

 ```


 ### Get Read Notifications

- **Endpoint:** `GET /notifications/read`
- **Description:** Retrieve read notifications for a user or driver.
- **Request Parameters:**
  - `userId` (String, optional): User's unique identifier (ObjectId).
  - `driverId` (String, optional): Driver's unique identifier (ObjectId).

#### Example Request in React Native:
```
import axios from 'axios';

const getReadNotifications = async (userId) => {
    try {
        const response = await axios.get('https://banturide.onrender.com/notifications/read', {
            params: { userId }
        });
        console.log('Read Notifications:', response.data);
    } catch (error) {
        console.error('Error fetching read notifications:', error);
    }
};
```

#### Example Request in DART (flutter):

``` 
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> getReadNotifications(String driverId) async {
  final url = 'https://banturide.onrender.com/notifications/read?driverId=$driverId';
  try {
    final response = await http.get(Uri.parse(url));
    if (response.statusCode == 200) {
      final notifications = json.decode(response.body);
      print('Read Notifications: $notifications');
    } else {
      print('Error fetching read notifications: ${response.body}');
    }
  } catch (error) {
    print('Error fetching read notifications: $error');
  }
}

```


### Mark Notification as Read

- **Endpoint:** `PUT /notifications/read/:notificationId`
- **Description:** Mark a specific notification as read.
- **Request Parameters:**
  - `notificationId` (String): Notification's unique identifier (ObjectId).

#### Example Request in React Native:
```
import axios from 'axios';

const markAsRead = async (notificationId) => {
    try {
        const response = await axios.put(`https://banturide.onrender.com/notifications/read/${notificationId}`);
        console.log('Notification Marked as Read:', response.data);
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

```

#### Example Request in DART (flutter):


```
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> markAsRead(String notificationId) async {
  final url = 'https://banturide.onrender.com/notifications/read/$notificationId';
  try {
    final response = await http.put(Uri.parse(url));
    if (response.statusCode == 200) {
      final notification = json.decode(response.body);
      print('Notification Marked as Read: $notification');
    } else {
      print('Error marking notification as read: ${response.body}');
    }
  } catch (error) {
    print('Error marking notification as read: $error');
  }
}

```

### Mark Notification as Unread

- **Endpoint:** `PUT /notifications/unread/:notificationId`
- **Description:** Mark a specific notification as unread.
- **Request Parameters:**
  - `notificationId` (String): Notification's unique identifier (ObjectId).

#### Example Request in React Native:

```
import axios from 'axios';

const markAsUnread = async (notificationId) => {
    try {
        const response = await axios.put(`https://banturide.onrender.com/notifications/unread/${notificationId}`);
        console.log('Notification Marked as Unread:', response.data);
    } catch (error) {
        console.error('Error marking notification as unread:', error);
    }
};

```

#### Example Request in DART (flutter):

```
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> markAsUnread(String notificationId) async {
  final url = 'https://banturide.onrender.com/notifications/unread/$notificationId';
  try {
    final response = await http.put(Uri.parse(url));
    if (response.statusCode == 200) {
      final notification = json.decode(response.body);
      print('Notification Marked as Unread: $notification');
    } else {
      print('Error marking notification as unread: ${response.body}');
    }
  } catch (error) {
    print('Error marking notification as unread: $error');
  }
}

```







## Integrating Socket.IO for Real-Time Notifications in React Native

ENOS! This guide will walk you through the steps to integrate Socket.IO into your React Native application to receive real-time notifications for events such as driver availability and booking confirmations. The notifications will be sent from the backend and received in the frontend, allowing you to handle these events in real-time.

### Install Socket.IO Client

First, you need to install the Socket.IO client library in your React Native project. Run the following command in your project directory:

```
npm install socket.io-client
```


Example code: 

```
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import io from 'socket.io-client';

const Notifications = () => {
  // Connect to Socket.IO server
  const socket = io('https://banturide.onrender.com');

  useEffect(() => {
    // Listen for notifications
    socket.on('notification', (data) => {
      console.log('Notification received:', data);
      // Handle the notification (e.g., show a toast, update state, etc.)
      Alert.alert('Notification', data.message);
    });

    // Listen for specific events
    socket.on('driversAvailable', (data) => {
      console.log('Drivers available:', data);
      // Update state with available drivers
      Alert.alert('Drivers Available', 'More drivers are available in your area.');
    });

    socket.on('bookingConfirmed', (data) => {
      console.log('Booking confirmed:', data);
      // Handle booking confirmation
      Alert.alert('Booking Confirmed', 'Your booking has been confirmed with a driver.');
    });

    // Clean up the connection when the component unmounts
    return () => {
      socket.off('notification');
      socket.off('driversAvailable');
      socket.off('bookingConfirmed');
    };
  }, []);

  return null;
};

export default Notifications;
```

