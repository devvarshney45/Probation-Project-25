import mongoose from 'mongoose';

const answerSubSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  answer: String,
  correct: Boolean,
  marksObtained: Number
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [answerSubSchema],
  totalScore: Number,
 // startedAt: Date,
  submittedAt: { type: Date, default: Date.now },
  timeTakenSeconds: Number
}, { timestamps: true });

submissionSchema.index({ quiz: 1, student: 1 }); // helpful queries

export default mongoose.model('Submission', submissionSchema);
