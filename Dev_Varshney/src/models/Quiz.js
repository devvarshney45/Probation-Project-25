import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  scheduledAt: Date,
  durationMinutes: Number,
  live: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
