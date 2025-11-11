// src/routes/book.routes.js
import { Router } from "express";
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook
} from "../controllers/book.controller.js";

import requireStaffAuth from "../middleware/authStaff.js"; // verifies staff/admin JWT
import { authorize } from "../middleware/authorize.js";

const router = Router();

// Public routes
router.route("/")
  .get(getBooks);          // Anyone (public/member/staff/admin) can list books

router.route("/:id")
  .get(getBookById);       // Anyone can view a single book

// only staff or admin can create/update/delete
router.route("/")
  .post(requireStaffAuth, authorize(["staff", "admin"]), createBook);

router.route("/:id")
  .put(requireStaffAuth, authorize(["staff", "admin"]), updateBook)
  .delete(requireStaffAuth, authorize(["staff", "admin"]), deleteBook);

export default router;