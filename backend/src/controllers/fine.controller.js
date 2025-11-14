// src/controllers/fine.controller.js
import Fine from "../models/fineModel.js";
import Loan from "../models/loanModel.js";
import Payment from "../models/paymentModel.js";

// GET /api/fines  (staff/admin)
export const listFines = async (req, res, next) => {
  try {
    const { status } = req.query; // optional
    const q = status ? { status } : {};
    const fines = await Fine.find(q)
      .populate({ path: "loan", select: "_id book member due_date return_date status" })
      .populate({ path: "member", select: "_id name email" })
      .sort({ createdAt: -1 });
    res.json({ data: fines });
  } catch (e) { next(e); }
};

// GET /api/fines/mine  (member)
export const listMyFines = async (req, res, next) => {
  try {
    const memberId = req.user.id;
    const fines = await Fine.find({ member: memberId })
      .populate({ path: "loan", select: "_id book due_date return_date status" })
      .sort({ createdAt: -1 });
    res.json({ data: fines });
  } catch (e) { next(e); }
};

// PUT /api/fines/:id/pay  (member owns) — full payment for Day 10
export const payFine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, method = "other", txn_ref } = req.body;
    const user = req.user;

    const fine = await Fine.findById(id);
    if (!fine) return res.status(404).json({ message: "Fine not found" });

    // Ownership
    if (user.role === "member" && String(fine.member) !== String(user.id)) {
      return res.status(403).json({ message: "Forbidden: not your fine" });
    }

    if (fine.status !== "Pending") {
      return res.status(409).json({ message: `Cannot pay a ${fine.status} fine` });
    }

    if (amount == null || Number(amount) !== Number(fine.amount)) {
      return res.status(400).json({ message: "Amount must equal outstanding fine" });
    }

    // Record payment (placeholder)
    await Payment.create({
      fine: fine._id,
      loan: fine.loan,
      member: fine.member,
      amount,
      method,
      status: "Success",
      txn_ref: txn_ref || undefined,
    });

    // Close the fine
    fine.status = "Paid";
    await fine.save();

    res.json({ message: "Fine paid successfully", data: { fineId: fine._id, status: fine.status } });
  } catch (e) { next(e); }
};

// PUT /api/fines/:id/waive  (admin only)
export const waiveFine = async (req, res, next) => {
  try {
    const { id } = req.params;

    const fine = await Fine.findById(id);
    if (!fine) return res.status(404).json({ message: "Fine not found" });

    if (fine.status !== "Pending") {
      return res.status(409).json({ message: `Cannot waive a ${fine.status} fine` });
    }

    fine.status = "Waived";
    await fine.save();

    res.json({ message: "Fine waived", data: { fineId: fine._id, status: fine.status } });
  } catch (e) { next(e); }
};
