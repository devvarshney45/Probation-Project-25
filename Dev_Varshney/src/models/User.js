import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : { type: String, required: true }, 
    email :{ type: String, required: true, unique: true },
    googleId: { 
        type: String, 
        unique: true, 
        sparse: true 
    }, 
    password: { 
        type: String,
        select: false 
    },
    role: { type: String, enum: ['teacher','student'], default: 'student' }
});
export default mongoose.model('User', userSchema);
