// src/models/fineModel.js
import mongoose from "mongoose";

const fineSchema = new mongoose.Schema(
    {
    loan: { type: mongoose.Schema.Types.ObjectId, ref: "Loan", required: true },
     member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true, index: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Waived"],
      default: "Pending",
    },
    reason: { type: String, trim: true }, 
    },
    { timestamps: true }
);

export default mongoose.model("Fine", fineSchema);