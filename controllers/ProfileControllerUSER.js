import { userModel } from "../models/UserModel.js";
import Booking from '../models/BookRideModel.js';

// Get user profile
export const getUserProfile = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await userModel.findById(userId);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Edit user profile
export const editProfile = async (req, res) => {
    const { userId } = req.params;
    const { firstname, lastname, email, address, phoneNumber } = req.body;
    try {
        const user = await userModel.findByIdAndUpdate(userId, { firstname, lastname, email, address, phoneNumber }, { new: true });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle notifications for user
export const toggleNotifications = async (req, res) => {
    const { userId, value } = req.params;
    try {
        const user = await userModel.findById(userId);
        user.notificationsEnabled = value;
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle driver should call
export const toggleDriverShouldCall = async (req, res) => {
    const { userId, value } = req.params;
    try {
        const user = await userModel.findById(userId);
        user.driverShouldCall = value;
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getRideHistory = async (req, res) => {
    const { userId } = req.params;
    try {
        const bookings = await Booking.find({ user: userId });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// File a complaint
export const fileComplaint = async (req, res) => {
    const { userId } = req.params;
    const { complaintText } = req.body;
    try {
        const user = await userModel.findById(userId);
        user.complaints.push({ complaintText, createdAt: new Date() });
        await user.save();
        res.status(200).json(user.complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Handle referrals
export const handleReferral = async (req, res) => {
    const { userId } = req.params;
    const { referralCode } = req.body;
    try {
        const user = await User.findById(userId);
        user.referrals.push({ referralCode, createdAt: new Date() });
        await user.save();
        res.status(200).json(user.referrals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
