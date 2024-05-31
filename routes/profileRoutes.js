import express from 'express';
import {
    editProfile,
    toggleNotifications,
    toggleDriverShouldCall,
    getRideHistory,
    fileComplaint,
    handleReferral
} from '../controllers/ProfileControllerUSER';

import {
    editDriverProfile,
    toggleDriverAvailability,
    getDriverInfo
} from '../controllers/DriverProfileController';

const router = express.Router();

// Define routes USERS
router.put('/edit/:userId', editProfile);
router.post('/toggle-notifications/:userId', toggleNotifications);
router.post('/toggle-driver-should-call/:userId', toggleDriverShouldCall);
router.get('/ride-history/:userId', getRideHistory);
router.post('/complaint/:userId', fileComplaint);
router.post('/referral/:userId', handleReferral);


// Define routes DRIVERS
router.put('/edit/:driverId', editDriverProfile);
router.post('/toggle-availability/:driverId', toggleDriverAvailability);
router.get('/:driverId', getDriverInfo);

export default router;
