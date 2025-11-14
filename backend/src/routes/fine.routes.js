// src/routes/fine.routes.js
import express from "express";
import { authorize } from "../middleware/authorize.js";
import { requireStaffAuth } from "../middleware/authStaff.js";
import { requireMemberAuth } from "../middleware/authMember.js"; // assume you have this
import { 
    listFines,
    listMyFines, 
    payFine, 
    waiveFine } from "../controllers/fine.controller.js";


const router = express.Router();

// staff/admin
router.get("/", requireStaffAuth, authorize("fines","list"), listFines);

// member
router.get("/mine", requireMemberAuth, authorize("fines","mine"), listMyFines);
router.put("/:id/pay", requireMemberAuth, authorize("fines","pay"), payFine);

// admin only (will pass requireStaffAuth then block at authorize if role==='staff')
router.put("/:id/waive", requireStaffAuth, authorize("fines","waive"), waiveFine);

export default router;
