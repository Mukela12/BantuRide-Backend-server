import express from "express";
import {
    registerController,
    loginController,
    updateUserController,
    verifyOTP
} from "../controllers/UserController.js";

import {
    verifyOTPDriver,
    registerOne,
    registerTwo,
    signIn } from "../controllers/DriverController.js";

import multer from 'multer';
const upload = multer();

const router = express.Router();

// -------------------------------------------- USER ROUTES --------------------------------------------

// User login route
router.post("/signin", upload.none(), loginController);

// User register route
router.post("/create-user",upload.none(), registerController);

// User update information route
router.put("/update-user", updateUserController);

// User verify OTP route
router.post("/verify-otp", verifyOTP);


// -------------------------------------------- DRIVER ROUTES --------------------------------------------

// Driver register route
router.post("/create-driver", upload.none(), registerOne);

// Driver register route page 2
router.post("/create-driver-2", upload.none(), registerTwo);

// Driver verify OTP route
router.post("/verify-otp-driver", verifyOTPDriver);

// Driver login route
router.post("/signin-driver", upload.none(), signIn);


export default router;