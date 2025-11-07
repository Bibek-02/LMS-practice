import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [120, 'Name is too long']
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match:[
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email address'
            ],
            index: true
        },

        address: {
        type: String,
        trim: true,
        default: ''
        },

        password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false 
        },

        member_since: {
        type: Date,
        default: Date.now
        },

        expiry_date: {
        type: Date
        },

        active: {
        type: Boolean,
        default: true
        },

        notes: {
        type: String,
        trim: true,
        default: ''
        }
    }, 
    {
        timestamps: true
    }
);

export default mongoose.model("Member", memberSchema);
