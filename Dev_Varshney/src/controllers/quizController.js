import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js';
import Classroom from '../models/Classroom.js';
import { sendSubmissionToML } from '../services/mlService.js';
import mongoose from 'mongoose';

// teacher creates quiz
export const createQuiz = async (req, res) => {
  try {
    const { title, description, classroomId,durationMinutes } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    // (optional) ensure teacher owns the classroom
    if (classroomId) {
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
      if (String(classroom.teacher) !== req.user.id) return res.status(403).json({ message: 'Not your classroom' });
    }

    const quiz = await Quiz.create({
      title,
      description,
      classroom: classroomId ? classroomId : null,
      createdBy: req.user.id,
    //  scheduledAt,
      durationMinutes
    });

    if (classroomId) {
      await Classroom.findByIdAndUpdate(classroomId, { $push: { quizzes: quiz._id } });
    }

    res.status(201).json({ success: true, quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// teacher adds question
export const addQuestion = async (req, res) => {
  try {
    const { quizId, questionText, type, options, correctAnswer, marks } = req.body;
    if (!quizId || !questionText) return res.status(400).json({ message: 'quizId and questionText required' });

    const q = await Question.create({
      quiz: quizId,
      type: type || 'mcq',
      questionText,
      options: options || [],
      correctAnswer,
      marks: marks || 1
    });

    await Quiz.findByIdAndUpdate(quizId, { $push: { questions: q._id } });

    res.status(201).json({ success: true, question: q });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// get quizzes by classroom (student sees limited info)
export const getQuizzesByClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const quizzes = await Quiz.find({ classroom: classroomId }).select('title description scheduledAt durationMinutes createdAt');
    res.json({ quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// get quiz details for user (teacher sees answers, student not)
export const getQuizForUser = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // if teacher, return full
    if (req.user.role === 'teacher' && String(quiz.createdBy) === req.user.id) {
      return res.json({ quiz });
    }

    // student -> omit correctAnswer
    const questions = await Question.find({ quiz: quizId }).select('-correctAnswer');
    const studentView = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      questions,
      scheduledAt: quiz.scheduledAt,
      durationMinutes: quiz.durationMinutes
    };
    res.json({ quiz: studentView });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // answers: [{ questionId, answer }]
    if (!quizId || !answers) return res.status(400).json({ message: 'quizId and answers required' });

    // fetch questions 
    const questions = await Question.find({ quiz: quizId });
    const qMap = {};
    questions.forEach(q => { qMap[String(q._id)] = q; });

    let totalScore = 0;
    const answerRecords = [];

    for (const ans of answers) {
      const q = qMap[String(ans.questionId)];
      if (!q) continute;
      const isCorrect = q.correctAnswer === ans.answer;
      const marksObtained = isCorrect ? (q.marks || 1) : 0;
      totalScore += marksObtained;
      answerRecords.push({
        question: q._id,
        answer: ans.answer,
        correct: isCorrect,
        marksObtained
      });
    }

    const submission = await Submission.create({
      quiz: quizId,
      student: req.user.id,
      answers: answerRecords,
      totalScore,
      submittedAt: new Date(),
    //  timeTakenSeconds: startedAt ? Math.floor((Date.now() - new Date(startedAt).getTime())/1000) : undefined
    });

    sendSubmissionToML({
      submissionId: submission._id,
      quizId,
      studentId: req.user.id,
      answers: answerRecords,
      totalScore,
      maxScore: questions.reduce((s,q) => s + (q.marks || 1), 0),
      timestamp: submission.submittedAt
    });

    res.json({ success: true, score: totalScore, submissionId: submission._id });
  } catch (err) {
    console.error(err);
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// teacher sees results
export const getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const subs = await Submission.find({ quiz: quizId }).populate('student', 'name email profilePic').sort({ totalScore: -1 });
    res.json({ submissions: subs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
