// src/routes/reports.routes.js

import express from "express";
import {
  getSummaryDashboard,
  getChartsData,
} from "../controllers/reports.controller.js";

import authStaff from "../middleware/authStaff.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// Admin-only dashboard metrics
router.get(
  "/summary-dashboard",
  authStaff,
  authorize("admin"),
  getSummaryDashboard
);

router.get("/charts", authStaff, authorize("admin"), getChartsData);

export default router;
