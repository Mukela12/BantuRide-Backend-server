import express from "express";
import multer from 'multer';
import { authMiddleware } from "../config/authMiddleware.js"; // Ensure auth middleware is imported

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
    signIn
} from "../controllers/DriverController.js";

const upload = multer();
const router = express.Router();

// -------------------------------------------- USER ROUTES --------------------------------------------

// User login route
router.post("/signin", upload.none(), loginController);

// User register route
router.post("/create-user", upload.none(), registerController);

// User update information route - requires authentication
router.put("/update-user", authMiddleware, upload.none(), updateUserController);

// User verify OTP route
router.post("/verify-otp", upload.none(), verifyOTP);

// -------------------------------------------- DRIVER ROUTES --------------------------------------------

// Driver register route
router.post("/create-driver", upload.none(), registerOne);

// Driver register route page 2
router.post("/create-driver-2", upload.none(), registerTwo);

// Driver verify OTP route
router.post("/verify-otp-driver", upload.none(), verifyOTPDriver);

// Driver login route
router.post("/signin-driver", upload.none(), signIn);

export default router;
