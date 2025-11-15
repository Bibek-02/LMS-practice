// src/models/paymentModel.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        fine: {type: mongoose.Schema.Types.ObjectId, ref: "Fine", required: true, index: true},
        loan:   { type: mongoose.Schema.Types.ObjectId, ref: "Loan", required: true },
        member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
        amount: { type: Number, required: true, min: 0 },
        method: { type: String, enum: ["cash","card"], default: "card" },
        status: { type: String, enum: ["Success","Failed"], default: "Success" },
        txn_ref:{ type: String, trim: true },
    },
    {timestamps: true}
);
export default mongoose.model("Payment", paymentSchema);