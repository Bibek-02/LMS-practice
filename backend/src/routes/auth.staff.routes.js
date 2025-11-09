// src/routes/auth.staff.routes.js

import { Router } from "express";
import { staffSignup, staffLogin } from "../controllers/auth.controller.js";
const router = Router();
// Day 9: lock /signup behind admin; open for local dev now
router.post("/signup", staffSignup);
router.post("/login", staffLogin);
export default router;
