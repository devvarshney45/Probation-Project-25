import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  type: { type: String, enum: ['mcq','short','truefalse'], default: 'mcq' },
  questionText: { type: String, required: true },
  options: [String],
  correctAnswer: String,
  marks: { type: Number, default: 1 }
});

export default mongoose.model('Question', questionSchema);
