// src/routes/reports.routes.js

import express from "express";
import {
  getSummaryDashboard,
  getChartsData,
} from "../controllers/reports.controller.js";

import {requireStaffAuth} from "../middleware/authStaff.js";
import {authorize} from "../middleware/authorize.js";

const router = express.Router();

// Admin-only dashboard metrics
router.get(
  "/summary-dashboard",
  requireStaffAuth,
  authorize("admin"),
  getSummaryDashboard
);

router.get("/charts", requireStaffAuth, authorize("admin"), getChartsData);

export default router;
