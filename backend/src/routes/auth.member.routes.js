// src/routes/auth.member.routes.js
import { Router } from "express";
import { memberSignup, memberLogin } from "../controllers/auth.controller.js";
const router = Router();
router.post("/signup", memberSignup);
router.post("/login", memberLogin);
export default router;