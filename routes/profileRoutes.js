import express from 'express';
import {
    editProfile,
    toggleNotifications,
    toggleDriverShouldCall,
    getRideHistory,
    fileComplaint,
    handleReferral
} from '../controllers/ProfileControllerUSER.js';

import {
    editDriverProfile,
    toggleDriverAvailability,
    getDriverInfo
} from '../controllers/DriverProfileController.js';

const router = express.Router();

// Define routes USERS
router.get('/profile/:userId', getUserProfile);
router.post('/profile/name/:userId', editUserName);
router.post('/profile/email/:userId', editUserEmail);
router.post('/toggle-notifications/:userId/:value', toggleNotifications);
router.post('/toggle-driver-should-call/:userId/:value', toggleDriverShouldCall);
router.get('/ride-history/:userId', getRideHistory);
router.post('/complaint/:userId', fileComplaint);
router.post('/referral/:userId', handleReferral);


// Define routes DRIVERS
router.put('/edit/:driverId', editDriverProfile);
router.post('/toggle-availability/:driverId', toggleDriverAvailability);
router.get('/:driverId', getDriverInfo);

export default router;
