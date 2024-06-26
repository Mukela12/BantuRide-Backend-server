import { userModel } from "../models/UserModel.js";
import Booking from '../models/BookRideModel.js';
import cloudinary from '../helpers/cloudinaryConfig.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Ensure uploads directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
}).single('avatar');

// Get user profile
export const getUserProfile = async (req, res) => {
    const { userId } = req.params;
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
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err });
        }
        
        const { userId } = req.body;
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        try {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path, { public_id: `profile_${userId}` });
            const user = await userModel.findByIdAndUpdate(userId, { avatar: uploadResponse.secure_url }, { new: true });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
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

        user.notificationsEnabled = value;
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

        user.driverShouldCall = value;
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
