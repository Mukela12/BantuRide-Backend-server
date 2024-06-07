import express from 'express';
import {
    getUserProfile,
    editUserName,
    editUserEmail,
    uploadProfilePicture,
    removeProfilePicture,
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
router.post('/profile/name', editUserName);
router.post('/profile/email', editUserEmail);
router.post('/profile/upload', uploadProfilePicture);
router.delete('/profile/remove', removeProfilePicture);
router.post('/toggle-notifications', toggleNotifications);
router.post('/toggle-driver-should-call', toggleDriverShouldCall);
router.get('/ride-history', getRideHistory);
router.post('/complaint', fileComplaint);
router.post('/referral', handleReferral);

// Define routes DRIVERS
router.put('/edit/:driverId', editDriverProfile);
router.post('/toggle-availability/:driverId', toggleDriverAvailability);
router.get('/:driverId', getDriverInfo);

export default router;
