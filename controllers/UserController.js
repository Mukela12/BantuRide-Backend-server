import admin from 'firebase-admin';
import jwt from "jsonwebtoken";
import otplib from "otplib";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { hashPassword, comparePassword } from "../helpers/authHelper.js";

dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();  // Firestore database instance

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
});

// Helper to generate OTP using HOTP
const generateHOTP = (secret, counter) => {
    return otplib.hotp.generate(secret, counter);
};

// Register a new user
const registerController = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    try {
        const hashedPassword = await hashPassword(password);

        const userRecord = await admin.auth().createUser({
            email,
            password: hashedPassword,
            displayName: `${firstname} ${lastname}`
        });

        const otp = generateHOTP(process.env.SECRET, Math.floor(100000 + Math.random() * 900000));

        await db.collection('users').doc(userRecord.uid).set({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            otp
        });

        // Send verification email
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Account Verification',
            text: `Your OTP for account verification is: ${otp}`,
        });

        return res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for verification.'
        });
    } catch (error) {
        console.error('Error in Register API:', error);
        return res.status(500).json({ success: false, message: 'Error in Register API', error: error.message || error });
    }
};

// Verify the OTP sent to the user
const verifyOTP = async (req, res) => {
    const { email, enteredOTP } = req.body;

    try {
        const userSnapshot = await db.collection('users').where('email', '==', email).where('otp', '==', enteredOTP).get();
        if (userSnapshot.empty) {
            return res.status(403).json({ success: false, message: 'Entered OTP does not match!' });
        }

        userSnapshot.forEach(async doc => {
            await doc.ref.update({ otp: null });
        });

        return res.status(200).json({ success: true, message: 'OTP verified successfully!' });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return res.status(500).json({ success: false, message: 'Error during OTP verification', error });
    }
};

// Login user
const loginController = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (userSnapshot.empty) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }

        let userData;
        userSnapshot.forEach(doc => {
            userData = { id: doc.id, ...doc.data() };
        });

        const match = await comparePassword(password, userData.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        if (userData.otp) {
            return res.status(403).json({ success: false, message: "Please verify your OTP before logging in." });
        }

        const token = jwt.sign({ _id: userData.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({ success: true, message: "Login successful", token, user: userData });
    } catch (error) {
        console.error('Error in login API:', error);
        return res.status(500).json({ success: false, message: "Error in login API", error });
    }
};

// Update user profile
const updateUserController = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    try {
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (userSnapshot.empty) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let updates = {};
        if (firstname) updates.firstname = firstname;
        if (lastname) updates.lastname = lastname;
        if (password) {
            const hashedPassword = await hashPassword(password);
            updates.password = hashedPassword;
        }

        userSnapshot.forEach(async doc => {
            await doc.ref.update(updates);
        });

        if (firstname || lastname || password) {
            const userRecord = await admin.auth().getUserByEmail(email);

            let authUpdates = {};
            if (firstname || lastname) {
                authUpdates.displayName = `${firstname || userRecord.displayName.split(' ')[0]} ${lastname || userRecord.displayName.split(' ')[1]}`;
            }
            if (password) {
                authUpdates.password = await hashPassword(password);
            }

            await admin.auth().updateUser(userRecord.uid, authUpdates);
        }

        return res.status(200).json({ success: true, message: "Profile Updated Successfully" });
    } catch (error) {
        console.error('Error In User Update API:', error);
        return res.status(500).json({ success: false, message: "Error In User Update API", error });
    }
};

export {
    registerController,
    loginController,
    updateUserController,
    verifyOTP
};
