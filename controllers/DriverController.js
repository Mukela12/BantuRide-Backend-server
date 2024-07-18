import jwt from "jsonwebtoken";
import otplib from "otplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import admin from 'firebase-admin';
import { hashPassword, comparePassword } from "../helpers/authHelper.js";

dotenv.config();
const db = admin.firestore(); // Firestore database instance

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

// Helper to update driver data in Firestore
const updateFirebaseDriver = async (driver) => {
    const driverRef = db.collection('drivers').doc(driver.email);
    await driverRef.set(driver, { merge: true });
};

// Register a new driver
const registerOne = async (req, res) => {
    const { firstName, lastName, dob, email, phoneNumber, nrcNumber, address, password, latitude, longitude } = req.body;

    try {
        const driverRef = db.collection('drivers').doc(email);
        const doc = await driverRef.get();
        if (doc.exists) {
            return res.status(409).send({ success: false, message: 'Email already in use' });
        }

        const hashedPassword = await hashPassword(password);
        const otp = generateHOTP(process.env.SECRET, Math.floor(100000 + Math.random() * 900000));
        const newDriver = {
            firstName,
            lastName,
            dob,
            email,
            phoneNumber,
            nrcNumber,
            address,
            password: hashedPassword,
            location: new admin.firestore.GeoPoint(latitude, longitude),
            driverStatus: "available",
            otp
        };

        await updateFirebaseDriver(newDriver);
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Account Verification',
            text: `Your OTP for account verification is: ${otp}`,
        });

        return res.status(201).send({ success: true, message: 'Driver registered. Please verify your email.', driver: newDriver });
    } catch (error) {
        console.error('Error in registerOne API:', error);
        return res.status(500).send({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

// Update vehicle information
const registerTwo = async (req, res) => {
    const { email, vehicleRegistrationNumber, licenseNumber, licenseExpirationDate, brand, model, seats, color, category } = req.body;
    const driverRef = db.collection('drivers').doc(email);

    try {
        const doc = await driverRef.get();
        if (!doc.exists) {
            return res.status(404).send({ success: false, message: 'Driver not found' });
        }

        const vehicleInfo = {
            registrationNumber: vehicleRegistrationNumber,
            licenseNumber,
            licenseExpirationDate,
            brand,
            model,
            seats,
            color,
            category
        };

        await driverRef.update({ vehicleInfo });
        return res.status(200).send({ success: true, message: 'Vehicle information updated successfully.' });
    } catch (error) {
        console.error('Error in registerTwo API:', error);
        return res.status(500).send({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

// Sign in a driver
const signIn = async (req, res) => {
    const { email, password } = req.body;
    const driverRef = db.collection('drivers').doc(email);

    try {
        const doc = await driverRef.get();
        if (!doc.exists) {
            return res.status(404).send({ success: false, message: "Driver Not Found" });
        }

        const driver = doc.data();
        if (driver.otp) {
            return res.status(403).send({ success: false, message: "Please verify your OTP before logging in." });
        }

        const match = await comparePassword(password, driver.password);
        if (!match) {
            return res.status(401).send({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign({ email: driver.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).send({ success: true, message: "Login successful", token, driver });
    } catch (error) {
        console.error('Error in signIn API:', error);
        return res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Verify driver OTP
const verifyOTPDriver = async (req, res) => {
    const { email, enteredOTP } = req.body;
    const driverRef = db.collection('drivers').doc(email);

    try {
        const doc = await driverRef.get();
        if (!doc.exists) {
            return res.json({ success: false, message: `User not found with the given email: ${email}` });
        }

        const driver = doc.data();
        if (driver.otp !== enteredOTP) {
            return res.json({ success: false, message: 'Entered OTP does not match!' });
        }

        await driverRef.update({ otp: null });
        res.json({ success: true, message: 'OTP verified successfully!', driver });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        res.json({ success: false, message: 'Error during OTP verification' });
    }
};

export {
    registerOne,
    registerTwo,
    signIn,
    verifyOTPDriver
};
