// src/routes/payment.routes.js

import express from "express";
import {
  createPayment,
  getMyPayments,
  getAllPayments,
} from "../controllers/payment.controller.js";

import {requireMemberAuth} from "../middleware/authMember.js";
import {requireStaffAuth} from "../middleware/authStaff.js";
import {authorize} from "../middleware/authorize.js";

const router = express.Router();

// Member: pay fine
router.post("/", requireMemberAuth, createPayment);

// Member: view own payments
router.get("/mine", requireMemberAuth, getMyPayments);

// Admin: view all payments
router.get("/", requireStaffAuth, authorize("admin"), getAllPayments);

export default router;
