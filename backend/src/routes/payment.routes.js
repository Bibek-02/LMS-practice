// src/routes/payment.routes.js

import express from "express";
import {
  createPayment,
  getMyPayments,
  getAllPayments,
} from "../controllers/payment.controller.js";

import authMember from "../middleware/authMember.js";
import authStaff from "../middleware/authStaff.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// Member: pay fine
router.post("/", authMember, createPayment);

// Member: view own payments
router.get("/mine", authMember, getMyPayments);

// Admin: view all payments
router.get("/", authStaff, authorize("admin"), getAllPayments);

export default router;
