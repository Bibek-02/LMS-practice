  // src/models/staffModel.js     
import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  full_name: {
    type: String, 
    required: true,
    trim : true,
    minlength: [ 2, 'Name must be at least 2 characters' ],
    maxlength: [120, 'Name is too long']
  },

   email: {
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    index: true,
  },

  password_hash: {
     type: String,
      required: true, 
      select: false
     },

  role: {
     type: String, 
     enum: ['admin', 'staff'], 
     default: 'staff' 
  },
  active: { type: Boolean, default: true },
})

export default mongoose.model("Staff", staffSchema);