import DriverModel from '../models/DriverModel.js';

// Edit driver profile
export const editDriverProfile = async (req, res) => {
    const { driverId } = req.params;
    const { firstName, lastName, dob, email, phoneNumber, nrcNumber, address, vehicleInfo } = req.body;
    try {
        const driver = await DriverModel.findByIdAndUpdate(driverId, {
            firstName,
            lastName,
            dob,
            email,
            phoneNumber,
            nrcNumber,
            address,
            vehicleInfo
        }, { new: true });
        res.status(200).json(driver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle driver availability
export const toggleDriverAvailability = async (req, res) => {
    const { driverId } = req.params;
    try {
        const driver = await DriverModel.findById(driverId);
        driver.driverStatus = driver.driverStatus === 'available' ? 'unavailable' : 'available';
        await driver.save();
        res.status(200).json(driver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all driver information
export const getDriverInfo = async (req, res) => {
    const { driverId } = req.params;
    try {
        const driver = await DriverModel.findById(driverId);
        res.status(200).json(driver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
