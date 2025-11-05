import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {type : String, required: true},
    author: {type: String, required: true},
    publishedDate: {type: Date},
    available: {type: Boolean, default: true},
    added_on: {type: Date, default: Date.now}   
});

export default mongoose.model("Book", bookSchema);