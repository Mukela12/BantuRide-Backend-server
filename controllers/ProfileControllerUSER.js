import { userModel } from "../models/UserModel.js";
import Booking from '../models/BookRideModel.js';
import cloudinary from '../helpers/cloudinaryConfig.js';

// Get user profile
export const getUserProfile = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
    const { userId, image } = req.body; // Assuming image URL or base64 string is sent in the body

    try {
        const uploadResponse = await cloudinary.uploader.upload(image, { public_id: `profile_${userId}` });

        const user = await userModel.findByIdAndUpdate(userId, { avatar: uploadResponse.secure_url }, { new: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove profile picture
export const removeProfilePicture = async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await userModel.findById(userId);

        if (!user || !user.avatar) {
            return res.status(400).json({ error: "No profile picture to remove" });
        }

        const publicId = user.avatar.split('/').pop().split('.')[0];

        await cloudinary.uploader.destroy(publicId);

        user.avatar = null;
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Edit user's name
export const editUserName = async (req, res) => {
    const { userId, firstname, lastname } = req.body;

    try {
        const user = await userModel.findByIdAndUpdate(userId, { firstname, lastname }, { new: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Edit user's email
export const editUserEmail = async (req, res) => {
    const { email, userId } = req.body;

    try {
        const user = await userModel.findByIdAndUpdate(userId, { email }, { new: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle notifications for user
export const toggleNotifications = async (req, res) => {
    const { userId, value } = req.body;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.notificationsEnabled = value === 'true';
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle driver should call
export const toggleDriverShouldCall = async (req, res) => {
    const { userId, value } = req.body;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.driverShouldCall = value === 'true';
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get ride history
export const getRideHistory = async (req, res) => {
    const { userId } = req.body;

    try {
        const bookings = await Booking.find({ user: userId });
        if (!bookings) {
            return res.status(404).json({ error: "No bookings found" });
        }

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// File a complaint
export const fileComplaint = async (req, res) => {
    const { userId } = req.body;
    const { complaintText } = req.body;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

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
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.referrals.push({ referralCode, createdAt: new Date() });
        await user.save();

        res.status(200).json(user.referrals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
