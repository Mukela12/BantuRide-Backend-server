import jwt from "jsonwebtoken";
import otplib from "otplib";
import { hashPassword, comparePassword, sendVerificationEmail } from "../helpers/authHelper.js";
import { DriverModel } from '../models/DriverModel.js';
import dotenv from "dotenv";
dotenv.config();
import admin from 'firebase-admin';
import serviceAccount from '../config/banturide-firebase.json' assert { type: 'json' };

import initFirebaseAdmin from '../config/firebase.js';

const db = initFirebaseAdmin(); 


const generateHOTP = (secret, counter) => {
  return otplib.hotp.generate(secret, counter);
};

const updateFirebaseDriver = async (driver) => {
    const driverRef = db.collection('drivers').doc(String(driver._id));
    
    // Ensuring vehicleInfo is a plain object
    const vehicleInfo = driver.vehicleInfo.toObject ? driver.vehicleInfo.toObject() : driver.vehicleInfo;
  
    await driverRef.set({
      firstName: driver.firstName,
      lastName: driver.lastName,
      dob: driver.dob,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      nrcNumber: driver.nrcNumber,
      address: driver.address,
      vehicleInfo: JSON.parse(JSON.stringify(vehicleInfo)), // Convert to plain object if necessary
      location: new admin.firestore.GeoPoint(driver.location.coordinates[1], driver.location.coordinates[0]),
      available: driver.driverStatus === 'available'
    }, { merge: true });
  };
  

const registerOne = async (req, res) => {
  const { firstName, lastName, dob, email, phoneNumber, nrcNumber, address, password, latitude, longitude } = req.body;
  try {
    if (await DriverModel.findOne({ email })) {
      return res.status(409).send({ success: false, message: 'Email already in use' });
    }

    const hashedPassword = await hashPassword(password);
    
    const driver = new DriverModel({
      firstName,
      lastName,
      dob,
      email,
      phoneNumber,
      nrcNumber,
      address,
      password: hashedPassword,
      location: { coordinates: [longitude, latitude] },
      driverStatus: "available",
      otp: generateHOTP(process.env.SECRET, Math.floor(100000 + Math.random() * 900000))
    });

    await driver.save();
    await updateFirebaseDriver(driver);
    await sendVerificationEmail(driver.email, driver.otp);
    return res.status(201).send({ success: true, message: 'Driver registered. Please verify your email.' });
  } catch (error) {
    console.error('Error in registerOne API:', error);
    return res.status(500).send({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

const registerTwo = async (req, res) => {
  const { email, vehicleRegistrationNumber, licenseNumber, licenseExpirationDate, brand, model, seats, color, category } = req.body;
  try {
    const driver = await DriverModel.findOne({ email });
    if (!driver) {
      return res.status(404).send({ success: false, message: 'Driver not found' });
    }

    driver.vehicleInfo = {
      registrationNumber: vehicleRegistrationNumber,
      licenseNumber,
      licenseExpirationDate,
      brand,
      model,
      seats,
      color,
      category
    };

    await driver.save();
    await updateFirebaseDriver(driver);
    return res.status(200).send({ success: true, message: 'Vehicle information updated successfully.', driver: driver });
  } catch (error) {
    console.error('Error in registerTwo API:', error);
    return res.status(500).send({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const driver = await DriverModel.findOne({ email });
    if (!driver) {
      return res.status(404).send({ success: false, message: "Driver Not Found" });
    }

    if (driver.otp) {
      return res.status(403).send({ success: false, message: "Please verify your OTP before logging in." });
    }

    const match = await comparePassword(password, driver.password);
    if (!match) {
      return res.status(401).send({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ _id: driver._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.status(200).send({ success: true, message: "Login successful", token, driver });
  } catch (error) {
    console.error('Error in signIn API:', error);
    return res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
  }
};

const verifyOTPDriver = async (req, res) => {
  const { email, enteredOTP } = req.body;
  try {
    const driver = await DriverModel.findOne({ email });
    if (!driver) {
      return res.json({
        success: false,
        message: `User not found with the given email: ${email}`,
      });
    }

    if (driver.otp !== enteredOTP) {
      return res.json({
        success: false,
        message: 'Entered OTP does not match!'
      });
    }

    driver.otp = null;
    await driver.save();
    await updateFirebaseDriver(driver);
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
