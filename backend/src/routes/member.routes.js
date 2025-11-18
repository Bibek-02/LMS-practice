// src/routes/member.routes.js
import { Router } from "express";
import { requireMemberAuth } from "../middleware/authMember.js";
import { requireStaffAuth } from "../middleware/authStaff.js";
import { authorize } from "../middleware/authorize.js";
import {
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
} from "../controllers/member.controller.js";
import { memberSignup } from "../controllers/auth.controller.js";

const router = Router();

/**
 * Member self-check (like profile endpoint)
 * GET /api/members/me
 */
router.get("/me", requireMemberAuth, (req, res) =>
  res.json({
    status: "success",
    message: "OK",
    data: { user: req.user },
  })
);

/**
 * Public/member routes
 * - Member can read/update their own profile only
 */
router
  .route("/:id")
  .get(
    requireMemberAuth,
    authorize(["member", "staff", "admin"], { ownership: true }),
    getMemberById
  )
  .put(
    requireMemberAuth,
    authorize(["member", "staff", "admin"], { ownership: true }),
    updateMember
  );

/**
 * Staff/Admin routes
 */
router
  .route("/")
  .post(requireStaffAuth, authorize(["staff", "admin"]), memberSignup)
  .get(requireStaffAuth, authorize(["staff", "admin"]), getMembers);

router
  .route("/:id")
  .delete(requireStaffAuth, authorize(["staff", "admin"]), deleteMember);

export default router;
