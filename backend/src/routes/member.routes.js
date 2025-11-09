// src/routes/member.routes.js
import { Router } from "express";
import { requireMemberAuth } from "../middleware/authMember.js";
import { requireStaffAuth } from "../middleware/authStaff.js";
import {
  createMember,
  getMembers,
  getMemberById,   
  updateMember,
  deleteMember,
} from "../controllers/member.controller.js";

const router = Router();

// Member self-check (member token)
router.get("/me", requireMemberAuth, (req, res) =>
  res.json({ status: "success", message: "OK", data: { user: req.user } })
);

// Staff/Admin only beyond this line
router
  .route("/")
  .post(requireStaffAuth, createMember)  // optional; we already have /auth/members/signup
  .get(requireStaffAuth, getMembers);

router
  .route("/:id")
  .get(requireStaffAuth, getMemberById)
  .put(requireStaffAuth, updateMember)
  .delete(requireStaffAuth, deleteMember);

export default router;
