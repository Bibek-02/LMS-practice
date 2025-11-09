  // src/models/staffModel.js     
import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  full_name: {type: String, required: true},
   email: {type: String, required: true, unique: true},
   password_hash: { type: String, required: true, select: false },
   role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
   active: { type: Boolean, default: true },
})

export default mongoose.model("Staff", staffSchema);