// src/models/fineModel.js
import mongoose from "mongoose";

const fineSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Pending", "Paid", "Waived"],
      default: "Pending",
    },

    reason: {
      type: String,
      trim: true,
    },


    // (Used for reporting, but 100% optional)
    paid_at: {
      type: Date,
      default: null,
    },

    waived_at: {
      type: Date,
      default: null,
    },

    waived_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },
  },
  { timestamps: true }
);


fineSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "Paid" && !this.paid_at) {
      this.paid_at = new Date();
    }
    if (this.status === "Waived" && !this.waived_at) {
      this.waived_at = new Date();
    }
  }
  next();
});

export default mongoose.model("Fine", fineSchema);
