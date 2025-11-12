// src/routes/loan.routes.js
import express from "express";
import { requireStaffAuth } from "../middleware/authStaff.js";
import { authorize } from "../middleware/authorize.js"; 

import { 
    issueLoan,
    returnLoan,
    renewLoan
 } from "../controllers/loan.controller.js";     

const router = express.Router();

router.post(
    "/",
    requireStaffAuth, 
    authorize("loans", "create"), 
    issueLoan
);

router.put(
  "/:id/return",
  requireStaffAuth,
  authorize("loans", "return"),
  returnLoan
);

router.put(
  "/:id/renew",
  requireStaffAuth, 
  authorize("loans", "renew"),
  renewLoan
);

export default router;
