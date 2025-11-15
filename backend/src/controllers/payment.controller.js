import Payment from "../models/paymentModel.js";
import Fine from "../models/fineModel.js";
import crypto from "crypto";

// POST /api/payments (member)
export const createPayment = async (req, res, next) => {
  try {
    const memberId = req.member?._id || req.user?._id;
    const { fineId, method } = req.body;

    if (!fineId || !method) {
      return res.status(400).json({
        message: "fineId and method are required",
      });
    }

    // 1) Get fine
    const fine = await Fine.findById(fineId);
    if (!fine) {
      return res.status(404).json({ message: "Fine not found" });
    }

    // 2) Check status
    if (fine.status !== "Pending") {
      return res.status(400).json({
        message: `Cannot pay fine. Current status: ${fine.status}`,
      });
    }

    // 3) Ownership check
    if (fine.member.toString() !== memberId.toString()) {
      return res.status(403).json({
        message: "You cannot pay someone else's fine",
      });
    }

    // 4) Required: fine must be linked to a loan (Payment requires loan)
    if (!fine.loan) {
      return res.status(400).json({
        message: "Fine is missing loan reference",
      });
    }

    // 5) Generate transaction reference
    const txn_ref = `TXN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // 6) Create Payment
    const payment = await Payment.create({
      fine: fine._id,
      loan: fine.loan,
      member: memberId,
      amount: fine.amount,
      method,
      status: "Success",
      txn_ref,
    });

    // 7) Mark fine as paid (paid_at is auto-set by fineModel pre-save hook)
    fine.status = "Paid";
    await fine.save();

    return res.status(201).json({
      message: "Payment successful",
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/mine (member)
export const getMyPayments = async (req, res, next) => {
  try {
    const memberId = req.member?._id || req.user?._id;

    const payments = await Payment.find({ member: memberId })
      .populate("fine", "amount status paid_at")
      .populate("loan", "due_date returned_at status")
      .sort({ createdAt: -1 });

    return res.json({
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments (admin)
export const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate("member", "name email")
      .populate("loan", "status due_date returned_at")
      .populate("fine", "amount status paid_at")
      .sort({ createdAt: -1 });

    return res.json({
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};
