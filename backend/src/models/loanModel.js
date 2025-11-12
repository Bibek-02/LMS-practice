// src/models/loanModel.js
import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
    {
        book : {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Book", 
            required: true
        },
        member: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Member",
            required: true
        },

        staff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            required: true
        },

        borrow_date: { type: Date, default: Date.now},
        due_date: {type: Date, required: true},
        return_date: {type: Date, default: null},

        status: {
            type: String,
            enum: ["Active", "Returned", "Overdue"],
            default: "Active",
        },

        notes: { type: String, trim: true },
        fine_snapshot: {type: Number, default: 0}
    },
    {timestamps: true}
);

export default mongoose.model("Loan", loanSchema);