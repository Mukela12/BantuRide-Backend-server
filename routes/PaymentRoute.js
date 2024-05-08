import express from "express";
import { confirmPaymentAndMarkRideAsSuccessful } from "../controllers/PaymentController.js";

const router = express.Router();

router.post("/confirm-payment", confirmPaymentAndMarkRideAsSuccessful);

export default router;
